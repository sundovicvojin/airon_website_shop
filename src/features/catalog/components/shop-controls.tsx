import { Button } from "@/components/ui/button";
import type { CatalogSort } from "@/lib/supabase/services/catalog";
import type { Dictionary } from "@/i18n/dictionaries";

export function ShopControls({ copy, query, sort }: Readonly<{ copy: Dictionary["shop"]; query: string; sort: CatalogSort }>) {
  return <form className="shop-controls" method="get">
    <div><label htmlFor="shop-search">{copy.searchLabel}</label><input defaultValue={query} id="shop-search" name="q" placeholder={copy.searchPlaceholder} type="search" /></div>
    <div><label htmlFor="shop-sort">{copy.sortLabel}</label><select defaultValue={sort} id="shop-sort" name="sort"><option value="featured">{copy.sortFeatured}</option><option value="newest">{copy.sortNewest}</option><option value="price-asc">{copy.sortLowHigh}</option><option value="price-desc">{copy.sortHighLow}</option></select></div>
    <Button type="submit">{copy.searchLabel}</Button>
  </form>;
}
