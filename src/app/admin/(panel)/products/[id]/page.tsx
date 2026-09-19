import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/features/admin/components/admin-ui";
import { getAdminCategories, getAdminProduct } from "@/features/admin/data";
import { ProductForm } from "@/features/admin/products/product-form";

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) { const [{id},{saved}]=await Promise.all([params,searchParams]); const [product,categories]=await Promise.all([getAdminProduct(id),getAdminCategories()]); if(!product)notFound(); return <><AdminPageHeader description="Update content, price, stock, publication and relations." title="Edit product" />{saved==="1"?<p className="admin-notice">Product saved. Public routes were revalidated.</p>:null}<ProductForm categories={categories} product={product} /></>; }
