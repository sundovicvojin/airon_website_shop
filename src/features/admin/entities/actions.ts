"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { revalidateBanners, revalidateCatalog } from "@/features/admin/revalidation";
import type { AdminActionState } from "@/features/admin/types";
import { validateImage, validatePdf } from "@/features/admin/uploads";
import { parseMoneyInput } from "@/lib/money";
import { requireAdmin } from "@/lib/permissions/admin";

const slug = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const optional = z.string().trim().transform(value=>value||null);
const ok = (message: string): AdminActionState => ({ success: true, message });
const fail = (message: string, fieldErrors?: AdminActionState["fieldErrors"]): AdminActionState => ({ success: false, message, fieldErrors });

export async function saveCategory(id: string | null, _state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const schema=z.object({slug,nameEn:z.string().trim().min(1).max(140),descriptionEn:optional,nameSr:optional,descriptionSr:optional,sortOrder:z.coerce.number().int(),active:z.boolean()});
  const parsed=schema.safeParse({slug:formData.get("slug"),nameEn:formData.get("nameEn"),descriptionEn:formData.get("descriptionEn"),nameSr:formData.get("nameSr"),descriptionSr:formData.get("descriptionSr"),sortOrder:formData.get("sortOrder"),active:formData.get("active")==="on"});
  if(!parsed.success)return fail("Check category fields.",parsed.error.flatten().fieldErrors);
  const {client}=await requireAdmin("manageCatalog"); const input=parsed.data; let categoryId=id;
  if(categoryId){const {error}=await client.from("categories").update({slug:input.slug,active:input.active,sort_order:input.sortOrder,archived_at:null}).eq("id",categoryId);if(error)return fail(error.message);}else{const {data,error}=await client.from("categories").insert({slug:input.slug,active:input.active,sort_order:input.sortOrder}).select("id").single();if(error)return fail(error.message);categoryId=data.id;}
  const rows=[{category_id:categoryId,locale:"en" as const,name:input.nameEn,description:input.descriptionEn},...(input.nameSr?[{category_id:categoryId,locale:"sr" as const,name:input.nameSr,description:input.descriptionSr}]:[])];
  const {error}=await client.from("category_translations").upsert(rows,{onConflict:"category_id,locale"});if(error)return fail(error.message);if(!input.nameSr)await client.from("category_translations").delete().eq("category_id",categoryId).eq("locale","sr");
  revalidatePath("/admin/categories");revalidateCatalog();return ok(id?"Category updated.":"Category created.");
}

export async function archiveCategory(id:string){const {client}=await requireAdmin("manageCatalog");const {error}=await client.from("categories").update({active:false,archived_at:new Date().toISOString()}).eq("id",id);if(error)throw error;revalidatePath("/admin/categories");revalidateCatalog();}

export async function saveBatch(id:string|null,_state:AdminActionState,formData:FormData):Promise<AdminActionState>{
  const schema=z.object({productId:z.uuid(),batchNumber:z.string().trim().min(1).max(100),manufacturedAt:optional,testDate:optional,purity:z.string().trim(),active:z.boolean()});
  const parsed=schema.safeParse({productId:formData.get("productId"),batchNumber:formData.get("batchNumber"),manufacturedAt:formData.get("manufacturedAt"),testDate:formData.get("testDate"),purity:formData.get("purity"),active:formData.get("active")==="on"});if(!parsed.success)return fail("Check batch fields.",parsed.error.flatten().fieldErrors);
  const purity=parsed.data.purity?Number(parsed.data.purity):null;if(purity!==null&&(!Number.isFinite(purity)||purity<0||purity>100))return fail("Purity must be between 0 and 100.",{purity:["Invalid purity."]});
  const {client}=await requireAdmin("manageCatalog");const row={product_id:parsed.data.productId,batch_number:parsed.data.batchNumber,manufactured_at:parsed.data.manufacturedAt,test_date:parsed.data.testDate,purity,active:parsed.data.active};const result=id?await client.from("product_batches").update(row).eq("id",id):await client.from("product_batches").insert(row);if(result.error)return fail(result.error.message);revalidatePath("/admin/batches");revalidateCatalog();return ok(id?"Batch updated.":"Batch created.");
}

export async function archiveBatch(id:string){const {client}=await requireAdmin("manageCatalog");const {error}=await client.from("product_batches").update({active:false}).eq("id",id);if(error)throw error;revalidatePath("/admin/batches");revalidateCatalog();}

export async function createCoa(_state:AdminActionState,formData:FormData):Promise<AdminActionState>{
  const schema=z.object({productId:z.uuid(),batchId:optional.pipe(z.uuid().nullable()),title:z.string().trim().min(1).max(180),publicVisible:z.boolean(),active:z.boolean()});const parsed=schema.safeParse({productId:formData.get("productId"),batchId:formData.get("batchId"),title:formData.get("title"),publicVisible:formData.get("publicVisible")==="on",active:formData.get("active")==="on"});if(!parsed.success)return fail("Check COA fields.",parsed.error.flatten().fieldErrors);
  const file=formData.get("file");if(!(file instanceof File))return fail("Choose a PDF.");try{await validatePdf(file);}catch(cause){return fail(cause instanceof Error?cause.message:"Invalid PDF.");}
  const {client}=await requireAdmin("manageCatalog");const id=crypto.randomUUID();const path=`coa/${parsed.data.productId}/${parsed.data.batchId??"unassigned"}/${id}.pdf`;const {error:uploadError}=await client.storage.from("coa").upload(path,file,{contentType:"application/pdf"});if(uploadError)return fail(uploadError.message);const {error}=await client.from("coa_documents").insert({id,product_id:parsed.data.productId,batch_id:parsed.data.batchId,title:parsed.data.title,storage_path:path,public_visible:parsed.data.publicVisible,active:parsed.data.active});if(error){await client.storage.from("coa").remove([path]);return fail(error.message);}revalidatePath("/admin/coa");revalidateCatalog();return ok("COA uploaded.");
}

export async function updateCoaState(id:string,publicVisible:boolean,active:boolean){const {client}=await requireAdmin("manageCatalog");const {error}=await client.from("coa_documents").update({public_visible:publicVisible,active}).eq("id",id);if(error)throw error;revalidatePath("/admin/coa");revalidateCatalog();}

export async function saveCoupon(id:string|null,_state:AdminActionState,formData:FormData):Promise<AdminActionState>{
  const schema=z.object({code:z.string().trim().min(1).max(64),type:z.enum(["PERCENTAGE","FIXED"]),value:z.string().trim().min(1),minimum:z.string().trim(),startsAt:optional,expiresAt:optional,usageLimit:z.string().trim(),active:z.boolean()});const parsed=schema.safeParse({code:formData.get("code"),type:formData.get("type"),value:formData.get("value"),minimum:formData.get("minimum"),startsAt:formData.get("startsAt"),expiresAt:formData.get("expiresAt"),usageLimit:formData.get("usageLimit"),active:formData.get("active")==="on"});if(!parsed.success)return fail("Check coupon fields.",parsed.error.flatten().fieldErrors);
  const percentage=parsed.data.type==="PERCENTAGE"?Number(parsed.data.value):null;const fixed=parsed.data.type==="FIXED"?parseMoneyInput(parsed.data.value):null;const minimum=parsed.data.minimum?parseMoneyInput(parsed.data.minimum):null;if((percentage!==null&&(!Number.isFinite(percentage)||percentage<=0||percentage>100))||(parsed.data.type==="FIXED"&&fixed===null)|| (parsed.data.minimum&&minimum===null))return fail("Enter valid coupon values.");
  const row={code:parsed.data.code.toUpperCase(),type:parsed.data.type,value_amount:fixed,percentage_value:percentage,minimum_order_amount:minimum,starts_at:parsed.data.startsAt?new Date(parsed.data.startsAt).toISOString():null,expires_at:parsed.data.expiresAt?new Date(parsed.data.expiresAt).toISOString():null,usage_limit:parsed.data.usageLimit?Number(parsed.data.usageLimit):null,active:parsed.data.active};const {client}=await requireAdmin("managePromotions");const result=id?await client.from("coupons").update(row).eq("id",id):await client.from("coupons").insert(row);if(result.error)return fail(result.error.message);revalidatePath("/admin/coupons");return ok(id?"Coupon updated.":"Coupon created.");
}

export async function saveBanner(id:string|null,_state:AdminActionState,formData:FormData):Promise<AdminActionState>{
  const schema=z.object({key:slug,titleEn:z.string().trim().min(1).max(180),bodyEn:optional,ctaLabelEn:optional,titleSr:optional,bodySr:optional,ctaLabelSr:optional,ctaHref:optional,startsAt:optional,endsAt:optional,sortOrder:z.coerce.number().int(),active:z.boolean()});const parsed=schema.safeParse({key:formData.get("key"),titleEn:formData.get("titleEn"),bodyEn:formData.get("bodyEn"),ctaLabelEn:formData.get("ctaLabelEn"),titleSr:formData.get("titleSr"),bodySr:formData.get("bodySr"),ctaLabelSr:formData.get("ctaLabelSr"),ctaHref:formData.get("ctaHref"),startsAt:formData.get("startsAt"),endsAt:formData.get("endsAt"),sortOrder:formData.get("sortOrder"),active:formData.get("active")==="on"});if(!parsed.success)return fail("Check banner fields.",parsed.error.flatten().fieldErrors);if(parsed.data.ctaHref&&!parsed.data.ctaHref.startsWith("/"))return fail("CTA href must be an internal path starting with /.");
  const {client}=await requireAdmin("manageCatalog");let bannerId=id;const row={key:parsed.data.key,cta_href:parsed.data.ctaHref,starts_at:parsed.data.startsAt?new Date(parsed.data.startsAt).toISOString():null,ends_at:parsed.data.endsAt?new Date(parsed.data.endsAt).toISOString():null,sort_order:parsed.data.sortOrder,active:parsed.data.active};if(bannerId){const {error}=await client.from("banners").update(row).eq("id",bannerId);if(error)return fail(error.message);}else{const {data,error}=await client.from("banners").insert(row).select("id").single();if(error)return fail(error.message);bannerId=data.id;}
  const translations=[{banner_id:bannerId,locale:"en" as const,title:parsed.data.titleEn,body:parsed.data.bodyEn,cta_label:parsed.data.ctaLabelEn},...(parsed.data.titleSr?[{banner_id:bannerId,locale:"sr" as const,title:parsed.data.titleSr,body:parsed.data.bodySr,cta_label:parsed.data.ctaLabelSr}]:[])];const {error:translationError}=await client.from("banner_translations").upsert(translations,{onConflict:"banner_id,locale"});if(translationError)return fail(translationError.message);
  const image=formData.get("image");if(image instanceof File&&image.size){try{const {extension,mime}=await validateImage(image);const path=`banners/${bannerId}/${crypto.randomUUID()}.${extension}`;const {error:uploadError}=await client.storage.from("banners").upload(path,image,{contentType:mime});if(uploadError)return fail(uploadError.message);const {data:current}=await client.from("banners").select("image_path").eq("id",bannerId).single();const {error}=await client.from("banners").update({image_path:path}).eq("id",bannerId);if(error){await client.storage.from("banners").remove([path]);return fail(error.message);}if(current?.image_path)await client.storage.from("banners").remove([current.image_path]);}catch(cause){return fail(cause instanceof Error?cause.message:"Image upload failed.");}}
  revalidatePath("/admin/banners");revalidateBanners();return ok(id?"Banner updated.":"Banner created.");
}

export async function deleteCoupon(id:string){const {client}=await requireAdmin("managePromotions");const {count,error:countError}=await client.from("coupon_redemptions").select("id",{count:"exact",head:true}).eq("coupon_id",id);if(countError)throw countError;if((count??0)>0)throw new Error("Redeemed coupons cannot be deleted; deactivate them instead.");const {error}=await client.from("coupons").delete().eq("id",id);if(error)throw error;revalidatePath("/admin/coupons");}

export async function deleteBanner(id:string){const {client}=await requireAdmin("manageCatalog");const {data,error:readError}=await client.from("banners").select("image_path").eq("id",id).single();if(readError)throw readError;const {error}=await client.from("banners").delete().eq("id",id);if(error)throw error;if(data.image_path)await client.storage.from("banners").remove([data.image_path]);revalidatePath("/admin/banners");revalidateBanners();}
