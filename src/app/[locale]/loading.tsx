import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() { return <main className="editorial-page"><Container><Skeleton className="h-4 w-32" /><Skeleton className="mt-8 h-32 max-w-4xl" /><Skeleton className="mt-10 h-20 max-w-2xl" /><div className="mt-20 grid gap-6 md:grid-cols-3"><Skeleton className="h-56" /><Skeleton className="h-56" /><Skeleton className="h-56" /></div></Container></main>; }
