import { AdminEmpty, AdminPageHeader, StatusPill } from "@/features/admin/components/admin-ui";
import { getAdminCategories } from "@/features/admin/data";
import { archiveCategory } from "@/features/admin/entities/actions";
import { CategoryForm } from "@/features/admin/entities/entity-forms";

export default async function CategoriesPage(){const categories=await getAdminCategories();return <><AdminPageHeader description="Localized storefront collections." title="Categories"/><CategoryForm/>{categories.length?<div className="admin-stack">{categories.map(category=><details className="admin-panel" key={category.id}><summary><strong>{category.category_translations.find(t=>t.locale==="en")?.name??category.slug}</strong><span>{category.slug} · <StatusPill tone={category.active?"good":"neutral"}>{category.active?"ACTIVE":"INACTIVE"}</StatusPill></span></summary><CategoryForm value={category}/><form action={archiveCategory.bind(null,category.id)}><button className="admin-danger-button" type="submit">Archive category</button></form></details>)}</div>:<AdminEmpty>No categories yet.</AdminEmpty>}</>}
