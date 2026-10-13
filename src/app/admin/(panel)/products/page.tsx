import { AdminEmpty, AdminPageHeader } from "@/features/admin/components/admin-ui";
import { getAdminProducts } from "@/features/admin/data";
import { ProductsTable, type ProductRow } from "@/features/admin/products/products-table";
import { formatMoney } from "@/lib/money";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { q = "" } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0,80) : "";
  const products = await getAdminProducts(query);
  const rows: ProductRow[] = products.map(product => {
    const en = product.product_translations.find(item => item.locale === "en");
    return {
      id: product.id, slug: product.slug, name: en?.name ?? product.slug, archived: product.archived_at !== null,
      visibility: product.visibility, active: product.active, stockStatus: product.stock_status, stockQuantity: product.stock_quantity,
      imageCount: product.product_images.length, hasEnDescription: Boolean(en?.description?.trim()),
      sku: product.sku, strength: product.strength, unit: product.unit, featured: product.featured, updatedAt: product.updated_at,
      priceLabel: product.price_amount === null ? "Price on request" : formatMoney(product.price_amount, product.currency),
    };
  });
  return <><AdminPageHeader actionHref="/admin/products/new" actionLabel="Add product" description="Catalogue, inventory and publication state." title="Products" /><form className="admin-filter"><input defaultValue={query} name="q" placeholder="Search slug or SKU" /><button className="admin-button admin-button--secondary" type="submit">Search</button></form>{products.length ? <ProductsTable products={rows} />:<AdminEmpty>No products match this view.</AdminEmpty>}</>;
}
