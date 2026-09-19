import Link from "next/link";

import { AdminEmpty, AdminPageHeader, StatusPill } from "@/features/admin/components/admin-ui";
import { getDashboardData } from "@/features/admin/data";
import { formatMoney } from "@/lib/money";

export default async function AdminDashboardPage() {
  const data = await getDashboardData();
  const cards = [["Products", data.products], ["Orders", data.orders], ["Customers", data.customers], ["Revenue", formatMoney(data.revenue)], ["Low stock", data.lowStock.length]];
  return <><AdminPageHeader description="Live operational overview. No demo statistics." title="Overview" /><section className="admin-stats">{cards.map(([label,value])=><article key={label}><span>{label}</span><strong>{value}</strong></article>)}</section><div className="admin-dashboard-grid"><section className="admin-panel"><div className="admin-panel__heading"><h2>Recent orders</h2><Link href="/admin/orders">View all</Link></div>{data.recentOrders.length ? <div className="admin-table-wrap"><table className="admin-table"><tbody>{data.recentOrders.map(order=><tr key={order.id}><td>{order.order_number}</td><td>{order.email}</td><td>{formatMoney(order.total_amount,order.currency)}</td><td><StatusPill>{order.order_status}</StatusPill></td></tr>)}</tbody></table></div>:<AdminEmpty>No orders yet.</AdminEmpty>}</section><section className="admin-panel"><div className="admin-panel__heading"><h2>Low stock</h2><Link href="/admin/products">Products</Link></div>{data.lowStock.length ? <ul className="admin-list">{data.lowStock.map(product=><li key={product.id}><span>{product.slug}</span><strong>{product.stock_quantity}</strong></li>)}</ul>:<AdminEmpty>No low-stock products.</AdminEmpty>}</section><section className="admin-panel"><div className="admin-panel__heading"><h2>Order status</h2></div>{Object.keys(data.statusSummary).length ? <ul className="admin-list">{Object.entries(data.statusSummary).map(([status,count])=><li key={status}><span>{status}</span><strong>{count}</strong></li>)}</ul>:<AdminEmpty>No order status data.</AdminEmpty>}</section></div></>;
}
