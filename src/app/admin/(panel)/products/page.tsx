import Link from "next/link";

import { AdminEmpty, AdminPageHeader, StatusPill } from "@/features/admin/components/admin-ui";
import { getAdminProducts } from "@/features/admin/data";
import { deleteProduct, setProductState } from "@/features/admin/products/actions";
import { formatMoney } from "@/lib/money";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { q = "" } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0,80) : "";
  const products = await getAdminProducts(query);
  return <><AdminPageHeader actionHref="/admin/products/new" actionLabel="Add product" description="Catalogue, inventory and publication state." title="Products" /><form className="admin-filter"><input defaultValue={query} name="q" placeholder="Search slug or SKU" /><button className="admin-button admin-button--secondary" type="submit">Search</button></form>{products.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Strength</th><th>SKU</th><th>Price</th><th>Stock</th><th>Status</th><th>Visibility</th><th>Flags</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{products.map(product=>{const name=product.product_translations.find(item=>item.locale==="en")?.name??product.slug;return <tr key={product.id}><td><Link href={`/admin/products/${product.id}`}>{name}</Link></td><td>{product.strength} {product.unit}</td><td>{product.sku??"—"}</td><td>{formatMoney(product.price_amount,product.currency)}</td><td>{product.stock_quantity}</td><td><StatusPill tone={product.stock_status==="IN_STOCK"?"good":product.stock_status==="LOW_STOCK"?"warning":"neutral"}>{product.stock_status}</StatusPill></td><td>{product.visibility}</td><td>{product.active?"Active":"Disabled"}{product.featured?" · Featured":""}{product.archived_at?" · Archived":""}</td><td>{new Date(product.updated_at).toLocaleDateString()}</td><td><div className="admin-row-actions"><Link href={`/admin/products/${product.id}`}>Edit</Link><form action={setProductState.bind(null,product.id,"disable")}><button type="submit">Disable</button></form><form action={setProductState.bind(null,product.id,"archive")}><button type="submit">Archive</button></form><form action={deleteProduct.bind(null,product.id)}><button type="submit">Safe delete</button></form></div></td></tr>})}</tbody></table></div>:<AdminEmpty>No products match this view.</AdminEmpty>}</>;
}
