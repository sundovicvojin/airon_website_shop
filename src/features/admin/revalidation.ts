import "server-only";

import { revalidatePath } from "next/cache";

export function revalidateCatalog(slug?: string) {
  for (const locale of ["en", "sr"] as const) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/shop`);
    revalidatePath(`/${locale}/collections`);
    if (slug) revalidatePath(`/${locale}/products/${slug}`);
  }
}

export function revalidateBanners() {
  revalidatePath("/en");
  revalidatePath("/sr");
}
