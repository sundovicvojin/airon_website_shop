import { AdminEmpty, AdminPageHeader, StatusPill } from "@/features/admin/components/admin-ui";
import { getAdminBatches, getAdminProductsForSelect } from "@/features/admin/data";
import { archiveBatch } from "@/features/admin/entities/actions";
import { BatchForm } from "@/features/admin/entities/entity-forms";

export default async function BatchesPage(){const[products,batches]=await Promise.all([getAdminProductsForSelect(),getAdminBatches()]);return <><AdminPageHeader description="Product batch records and testing dates." title="Batches"/><BatchForm products={products}/>{batches.length?<div className="admin-stack">{batches.map(batch=><details className="admin-panel" key={batch.id}><summary><strong>{batch.batch_number}</strong><span>{batch.products?.slug??"Product"} · <StatusPill tone={batch.active?"good":"neutral"}>{batch.active?"ACTIVE":"ARCHIVED"}</StatusPill></span></summary><BatchForm products={products} value={batch}/><form action={archiveBatch.bind(null,batch.id)}><button className="admin-danger-button">Archive batch</button></form></details>)}</div>:<AdminEmpty>No batches yet.</AdminEmpty>}</>}
