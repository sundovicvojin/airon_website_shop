import { AdminPageHeader } from "@/features/admin/components/admin-ui";
import { getAdminCategories } from "@/features/admin/data";
import { ProductForm } from "@/features/admin/products/product-form";

export default async function NewProductPage() { const categories=await getAdminCategories(); return <><AdminPageHeader description="Create a draft, then publish when content and inventory are ready." title="Add product" /><ProductForm categories={categories} /></>; }
