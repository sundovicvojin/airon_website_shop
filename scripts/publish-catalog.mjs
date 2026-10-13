#!/usr/bin/env node
// Publishes DRAFT products (visibility=PUBLIC, active=true) that have at least one image and a non-empty EN description.
// Prices, stock and everything else are left untouched. GLOW, KLOW, PT21 and TI18 are never touched.
//
//   node --env-file=.env.local scripts/publish-catalog.mjs            # dry run (default)
//   node --env-file=.env.local scripts/publish-catalog.mjs --apply    # write
import { createClient } from "@supabase/supabase-js";

const apply = process.argv.includes("--apply");
const EXCLUDED_PREFIXES = ["glow-", "klow-", "pt21-", "ti18-"];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log(`Mode: ${apply ? "APPLY (writes)" : "DRY RUN"}`);
console.log(`Target: ${url ?? "(NEXT_PUBLIC_SUPABASE_URL not set)"}`);
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await db
  .from("products")
  .select("id,slug,visibility,active,archived_at,product_images(id),product_translations(locale,description)")
  .order("slug");
if (error) throw error;

const publish = [];
for (const product of data) {
  const reasons = [];
  if (EXCLUDED_PREFIXES.some(prefix => product.slug.startsWith(prefix))) reasons.push("excluded product");
  if (product.archived_at) reasons.push("archived");
  if (product.visibility === "PUBLIC" && product.active) reasons.push("already public");
  if (!product.product_images.length) reasons.push("no image");
  const en = product.product_translations.find(item => item.locale === "en");
  if (!en?.description?.trim()) reasons.push("empty EN description");
  if (reasons.length) console.log(`skip:    ${product.slug} (${reasons.join(", ")})`);
  else { publish.push(product); console.log(`${apply ? "publish" : "would publish"}: ${product.slug}`); }
}

if (apply && publish.length) {
  const { error: updateError } = await db.from("products").update({ visibility: "PUBLIC", active: true }).in("id", publish.map(p => p.id));
  if (updateError) throw updateError;
}
console.log(`\n${apply ? "Published" : "Would publish"}: ${publish.length}. Skipped: ${data.length - publish.length}.`);
