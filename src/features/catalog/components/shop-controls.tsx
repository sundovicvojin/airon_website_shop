"use client";

import type { Dictionary } from "@/i18n/dictionaries";

export function ShopControls({ copy }: Readonly<{ copy: Dictionary["shop"] }>) {
  return <div className="shop-controls">
    <div><label htmlFor="shop-search">{copy.searchLabel}</label><input id="shop-search" placeholder={copy.searchPlaceholder} type="search" /></div>
    <div><label htmlFor="shop-sort">{copy.sortLabel}</label><select defaultValue="featured" id="shop-sort"><option value="featured">{copy.sortFeatured}</option><option value="newest">{copy.sortNewest}</option><option value="price-asc">{copy.sortLowHigh}</option><option value="price-desc">{copy.sortHighLow}</option></select></div>
  </div>;
}
