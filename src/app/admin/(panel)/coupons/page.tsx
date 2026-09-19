import { AdminEmpty, AdminPageHeader, StatusPill } from "@/features/admin/components/admin-ui";
import { getAdminCoupons } from "@/features/admin/data";
import { CouponForm } from "@/features/admin/entities/entity-forms";
import { formatMoney } from "@/lib/money";

export default async function CouponsPage(){const coupons=await getAdminCoupons();return <><AdminPageHeader description="Configuration only; checkout redemption remains deferred." title="Coupons"/><CouponForm/>{coupons.length?<div className="admin-stack">{coupons.map(coupon=><details className="admin-panel" key={coupon.id}><summary><strong>{coupon.code}</strong><span>{coupon.type==="FIXED"?formatMoney(coupon.value_amount??0):`${coupon.percentage_value}%`} · <StatusPill tone={coupon.active?"good":"neutral"}>{coupon.active?"ACTIVE":"INACTIVE"}</StatusPill></span></summary><CouponForm value={coupon}/></details>)}</div>:<AdminEmpty>No coupons yet.</AdminEmpty>}</>}
