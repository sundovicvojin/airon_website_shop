import { AdminEmpty, AdminPageHeader, StatusPill } from "@/features/admin/components/admin-ui";
import { getAdminBanners } from "@/features/admin/data";
import { BannerForm } from "@/features/admin/entities/entity-forms";

export default async function BannersPage(){const banners=await getAdminBanners();return <><AdminPageHeader description="Small, localized storefront banner system." title="Banners"/><BannerForm/>{banners.length?<div className="admin-stack">{banners.map(banner=><details className="admin-panel" key={banner.id}><summary><strong>{banner.banner_translations.find(t=>t.locale==="en")?.title??banner.key}</strong><span>{banner.key} · <StatusPill tone={banner.active?"good":"neutral"}>{banner.active?"ACTIVE":"INACTIVE"}</StatusPill></span></summary><BannerForm value={banner}/></details>)}</div>:<AdminEmpty>No banners yet.</AdminEmpty>}</>}
