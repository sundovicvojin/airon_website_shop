import "server-only";

import { requireAdmin, type AdminCapability } from "@/lib/permissions/admin";

export async function getDashboardData() {
  const { client } = await requireAdmin();
  const [products, orders, customers, lowStock, recentOrders] = await Promise.all([
    client.from("products").select("id", { count: "exact", head: true }),
    client.from("orders").select("id,total_amount,order_status", { count: "exact" }),
    client.from("customers").select("id", { count: "exact", head: true }),
    client.from("products").select("id,slug,strength,stock_quantity,stock_status,product_translations(locale,name)").in("stock_status", ["LOW_STOCK", "OUT_OF_STOCK"]).is("archived_at", null).order("stock_quantity").limit(6),
    client.from("orders").select("id,order_number,email,total_amount,currency,order_status,created_at").order("created_at", { ascending: false }).limit(6),
  ]);
  const orderRows = orders.data ?? [];
  const statusSummary = orderRows.reduce<Record<string, number>>((summary, order) => ({ ...summary, [order.order_status]: (summary[order.order_status] ?? 0) + 1 }), {});
  return {
    products: products.count ?? 0, orders: orders.count ?? orderRows.length, customers: customers.count ?? 0,
    revenue: orderRows.filter((order) => order.order_status !== "CANCELLED").reduce((sum, order) => sum + order.total_amount, 0),
    lowStock: lowStock.data ?? [], recentOrders: recentOrders.data ?? [], statusSummary,
  };
}

export async function getAdminProducts(query = "") {
  const { client } = await requireAdmin("manageCatalog");
  let request = client.from("products").select("id,slug,strength,unit,sku,price_amount,currency,stock_quantity,stock_status,visibility,active,featured,archived_at,updated_at,product_translations(locale,name),product_images(storage_path,is_primary)").order("updated_at", { ascending: false }).limit(100);
  if (query) request = request.or(`slug.ilike.%${query.replaceAll(/[%,()]/g, "")}%,sku.ilike.%${query.replaceAll(/[%,()]/g, "")}%`);
  const { data, error } = await request;
  if (error) throw error;
  return data;
}

export async function getAdminProduct(id: string) {
  const { client } = await requireAdmin("manageCatalog");
  const { data, error } = await client.from("products").select("id,slug,strength,unit,sku,price_amount,compare_at_price_amount,currency,stock_quantity,stock_status,visibility,active,featured,sort_order,archived_at,product_translations(locale,name,short_name,short_description,description,storage_information,shipping_information,disclaimer),product_images(id,storage_path,alt_text,is_primary,sort_order),product_categories(category_id)").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAdminCategories() {
  const { client } = await requireAdmin("manageCatalog");
  const { data, error } = await client.from("categories").select("id,slug,active,sort_order,archived_at,updated_at,category_translations(locale,name,description)").order("sort_order").order("created_at");
  if (error) throw error;
  return data;
}

export async function getAdminProductsForSelect(capability: AdminCapability = "manageCatalog") {
  const { client } = await requireAdmin(capability);
  const { data, error } = await client.from("products").select("id,slug,product_translations(locale,name)").is("archived_at", null).order("slug");
  if (error) throw error;
  return data;
}

export async function getAdminBatches() { const {client}=await requireAdmin("manageCatalog"); const {data,error}=await client.from("product_batches").select("id,product_id,batch_number,manufactured_at,test_date,purity,active,updated_at,products(slug,product_translations(locale,name))").order("created_at",{ascending:false}); if(error)throw error; return data; }
export async function getAdminCoa() { const {client}=await requireAdmin("manageCatalog"); const {data,error}=await client.from("coa_documents").select("id,product_id,batch_id,title,storage_path,public_visible,active,uploaded_at,products(slug),product_batches(batch_number)").order("uploaded_at",{ascending:false}); if(error)throw error; return data; }
export async function getAdminCoupons() { const {client}=await requireAdmin("managePromotions"); const {data,error}=await client.from("coupons").select("id,code,type,value_amount,percentage_value,minimum_order_amount,starts_at,expires_at,usage_limit,usage_count,active,updated_at").order("created_at",{ascending:false}); if(error)throw error; return data; }
export async function getAdminBanners() { const {client}=await requireAdmin("manageCatalog"); const {data,error}=await client.from("banners").select("id,key,image_path,cta_href,active,sort_order,starts_at,ends_at,updated_at,banner_translations(locale,title,body,cta_label)").order("sort_order").order("created_at"); if(error)throw error; return data; }
export async function getAdminOrders() { const {client}=await requireAdmin("manageOrders"); const {data,error}=await client.from("orders").select("id,order_number,customer_id,email,currency,total_amount,order_status,payment_status,fulfillment_status,shipping_status,created_at,customers(first_name,last_name)").order("created_at",{ascending:false}).limit(100); if(error)throw error; return data; }
export async function getAdminCustomers() { const {client}=await requireAdmin("manageOrders"); const {data,error}=await client.from("customers").select("id,first_name,last_name,email,created_at,orders(id,total_amount,order_status,created_at)").order("created_at",{ascending:false}).limit(100); if(error)throw error; return data; }
