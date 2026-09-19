import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() { return <main className="shop-page"><Container><Skeleton className="h-4 w-36" /><Skeleton className="mt-6 h-24 max-w-3xl" /><div className="mt-16 grid gap-5 md:grid-cols-3"><Skeleton className="h-14" /><Skeleton className="h-14" /><Skeleton className="h-14" /></div><Skeleton className="mt-12 h-80" /></Container></main>; }
