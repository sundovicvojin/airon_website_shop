"use client";

import { useActionState } from "react";

import { createProduct, removeProductImage, updateProduct } from "@/features/admin/products/actions";
import { initialAdminActionState } from "@/features/admin/types";

type Translation = { locale: string; name: string; short_name: string | null; short_description: string | null; description: string | null };
type ProductValue = {
  id: string; slug: string; sku: string | null; strength: string; unit: string; price_amount: number; compare_at_price_amount: number | null;
  stock_quantity: number; stock_status: string; visibility: string; active: boolean; featured: boolean; sort_order: number;
  product_translations: Translation[]; product_categories: { category_id: string }[]; product_images?: { id: string; storage_path: string; alt_text: string; is_primary: boolean; sort_order: number }[];
};
type Category = { id: string; slug: string; category_translations: { locale: string; name: string }[] };

function cents(value: number | null) { return value === null ? "" : (value / 100).toFixed(2); }

export function ProductForm({ categories, product }: { categories: Category[]; product?: ProductValue | null }) {
  const action = product ? updateProduct.bind(null, product.id) : createProduct;
  const [state, formAction, pending] = useActionState(action, initialAdminActionState);
  const en = product?.product_translations.find(item => item.locale === "en");
  const sr = product?.product_translations.find(item => item.locale === "sr");
  const field = (name: string) => state.fieldErrors?.[name]?.[0];
  return <form action={formAction} className="admin-form admin-product-form">
    <section className="admin-form-section"><h2>Basic</h2><div className="admin-form-grid">
      <label>Name (EN)<input defaultValue={en?.name} name="enName" required /></label><label>Short name (EN)<input defaultValue={en?.short_name ?? ""} name="enShortName" /></label>
      <label>Slug<input defaultValue={product?.slug} name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label><label>SKU<input defaultValue={product?.sku ?? ""} name="sku" /></label>
    </div>{["enName","slug","sku"].map(name=>field(name)?<p className="admin-field-error" key={name}>{field(name)}</p>:null)}</section>
    <section className="admin-form-section"><h2>Product & price</h2><div className="admin-form-grid admin-form-grid--four">
      <label>Strength<input defaultValue={product?.strength} name="strength" required /></label><label>Unit<input defaultValue={product?.unit} name="unit" required /></label>
      <label>Price EUR<input defaultValue={product ? cents(product.price_amount) : ""} inputMode="decimal" name="price" required /></label><label>Compare-at EUR<input defaultValue={product ? cents(product.compare_at_price_amount) : ""} inputMode="decimal" name="comparePrice" /></label>
    </div>{["strength","unit","price","comparePrice"].map(name=>field(name)?<p className="admin-field-error" key={name}>{field(name)}</p>:null)}</section>
    <section className="admin-form-section"><h2>English content</h2><label>Short description<textarea defaultValue={en?.short_description ?? ""} name="enShortDescription" rows={3} /></label><label>Full description<textarea defaultValue={en?.description ?? ""} name="enDescription" rows={7} /></label></section>
    <section className="admin-form-section"><h2>Serbian content</h2><p className="admin-help">Optional. Empty Serbian name removes the SR translation and storefront falls back to English.</p><div className="admin-form-grid"><label>Name (SR)<input defaultValue={sr?.name ?? ""} name="srName" /></label><label>Short name (SR)<input defaultValue={sr?.short_name ?? ""} name="srShortName" /></label></div><label>Short description (SR)<textarea defaultValue={sr?.short_description ?? ""} name="srShortDescription" rows={3} /></label><label>Full description (SR)<textarea defaultValue={sr?.description ?? ""} name="srDescription" rows={7} /></label></section>
    <section className="admin-form-section"><h2>Inventory & visibility</h2><div className="admin-form-grid admin-form-grid--four">
      <label>Stock quantity<input defaultValue={product?.stock_quantity ?? 0} min={0} name="stockQuantity" required type="number" /></label>
      <label>Stock status<select defaultValue={product?.stock_status ?? "DISABLED"} name="stockStatus"><option>IN_STOCK</option><option>LOW_STOCK</option><option>OUT_OF_STOCK</option><option>DISABLED</option></select></label>
      <label>Visibility<select defaultValue={product?.visibility ?? "DRAFT"} name="visibility"><option>PUBLIC</option><option>HIDDEN</option><option>DRAFT</option></select></label>
      <label>Sort order<input defaultValue={product?.sort_order ?? 0} name="sortOrder" type="number" /></label>
    </div><div className="admin-checks"><label><input defaultChecked={product?.active} name="active" type="checkbox" /> Active</label><label><input defaultChecked={product?.featured} name="featured" type="checkbox" /> Featured</label></div>{["stockQuantity","stockStatus","visibility"].map(name=>field(name)?<p className="admin-field-error" key={name}>{field(name)}</p>:null)}</section>
    <section className="admin-form-section"><h2>Media</h2><div className="admin-form-grid"><label>Main image<input accept="image/avif,image/webp,image/png,image/jpeg" name="mainImage" type="file" /></label><label>Gallery images<input accept="image/avif,image/webp,image/png,image/jpeg" multiple name="galleryImages" type="file" /></label></div><p className="admin-help">AVIF, WebP, PNG or JPEG; maximum 8 MB each. A new main image replaces the current primary image.</p>{product?.product_images?.length?<ul className="admin-list">{product.product_images.map(image=><li key={image.id}><span>{image.is_primary?"Primary":"Gallery"} · {image.storage_path}</span><button formAction={removeProductImage.bind(null,image.id)} type="submit">Remove</button></li>)}</ul>:null}</section>
    <section className="admin-form-section"><h2>Categories</h2>{categories.length ? <div className="admin-checks">{categories.map(category=><label key={category.id}><input defaultChecked={product?.product_categories.some(item=>item.category_id===category.id)} name="categoryIds" type="checkbox" value={category.id} /> {category.category_translations.find(item=>item.locale==="en")?.name ?? category.slug}</label>)}</div>:<p className="admin-help">Create categories first, then assign them here.</p>}</section>
    {product ? <section className="admin-form-section"><h2>Relations</h2><p className="admin-help">Manage linked batches and COA documents from their dedicated sections.</p><div className="admin-actions"><a className="admin-button admin-button--secondary" href={`/admin/batches?product=${product.id}`}>Batches</a><a className="admin-button admin-button--secondary" href={`/admin/coa?product=${product.id}`}>COA</a></div></section> : null}
    {state.message ? <p aria-live="polite" className="admin-form-message" data-success={state.success}>{state.message}</p> : null}
    <div className="admin-form-submit"><button className="admin-button" disabled={pending} type="submit">{pending ? "Saving…" : product ? "Save product" : "Create product"}</button></div>
  </form>;
}
