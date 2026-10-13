#!/usr/bin/env node
// One-off catalogue import (names, strengths, descriptions). No prices, images, batches or COA.
// Idempotent by slug: existing products are skipped, never overwritten.
//
//   node --env-file=<envfile> scripts/seed-catalog.mjs            # dry run (default)
//   node --env-file=<envfile> scripts/seed-catalog.mjs --apply    # write
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. The key is never printed.
import { createClient } from "@supabase/supabase-js";

const apply = process.argv.includes("--apply");

// Peptides: lyophilised powder. Compounds marked `plain: true` (L-carnitine, NAD+): form not asserted.
const FORM_EN = "Lyophilised powder";
const FORM_SR = "Liofilizovani prah";
const STORAGE_EN = "See the product label";
const STORAGE_SR = "Pogledajte etiketu proizvoda";
const PLAIN_EN = "See the product label";
const PLAIN_SR = "Pogledajte etiketu proizvoda";
const NOTE_EN = "For laboratory research use only. Not for human or veterinary use, not a drug, food or cosmetic.";
const NOTE_SR = "Isključivo za laboratorijska istraživanja. Nije za upotrebu kod ljudi ni životinja, nije lek, hrana ni kozmetika.";

// en/sr describe the compound; null = description intentionally left empty (compound not confirmed).
const COMPOUNDS = {
  bpc157: {
    en: "BPC-157 is a synthetic peptide of 15 amino acids, modelled on a sequence found in a gastric protein. It is used as a reference compound in laboratory research.",
    sr: "BPC-157 je sintetički peptid od 15 aminokiselina, nastao prema sekvenci iz proteina želudačnog soka. Koristi se kao referentno jedinjenje u laboratorijskim istraživanjima.",
  },
  blend: {
    en: "A research combination of two synthetic peptides, BPC-157 and TB-500, supplied together in one vial for laboratory use.",
    sr: "Istraživačka kombinacija dva sintetička peptida, BPC-157 i TB-500, u jednoj bočici za laboratorijsku upotrebu.",
  },
  ghkcu: {
    en: "GHK-Cu is the copper complex of the tripeptide glycyl-L-histidyl-L-lysine, a naturally occurring sequence studied in laboratory research.",
    sr: "GHK-Cu je kompleks bakra sa tripeptidom glicil-L-histidil-L-lizin, prirodno prisutnom sekvencom koja se proučava u laboratorijskim istraživanjima.",
  },
  lcarnitine: {
    plain: true,
    en: "L-carnitine is an amino acid derivative involved in the transport of fatty acids within cells, and a common compound in biochemical research.",
    sr: "L-karnitin je derivat aminokiselina koji učestvuje u transportu masnih kiselina u ćelijama i uobičajeno je jedinjenje u biohemijskim istraživanjima.",
  },
  motsc: {
    en: "MOTS-c is a short peptide of 16 amino acids encoded in mitochondrial DNA, studied in research on mitochondrial-derived peptides.",
    sr: "MOTS-c je kratak peptid od 16 aminokiselina kodiran u mitohondrijalnoj DNK, koji se proučava u istraživanjima peptida mitohondrijalnog porekla.",
  },
  nad: {
    plain: true,
    en: "NAD+ (nicotinamide adenine dinucleotide) is a coenzyme present in all living cells and a widely used compound in biochemical research.",
    sr: "NAD+ (nikotinamid adenin dinukleotid) je koenzim prisutan u svim živim ćelijama i široko korišćeno jedinjenje u biohemijskim istraživanjima.",
  },
  pt141: {
    en: "PT-141 (bremelanotide) is a synthetic cyclic peptide that acts on melanocortin receptors and is used in receptor research.",
    sr: "PT-141 (bremelanotid) je sintetički ciklični peptid koji deluje na melanokortinske receptore i koristi se u istraživanjima receptora.",
  },
  reta: {
    en: "Retatrutide is a synthetic peptide studied in laboratory research for its activity at several metabolic hormone receptors.",
    sr: "Retatrutid je sintetički peptid koji se u laboratorijskim istraživanjima proučava zbog aktivnosti na više receptora metaboličkih hormona.",
  },
  tb500: {
    en: "TB-500 is a synthetic peptide fragment related to thymosin beta-4, used as a reference compound in laboratory research.",
    sr: "TB-500 je sintetički fragment peptida srodan timozinu beta-4, koji se koristi kao referentno jedinjenje u laboratorijskim istraživanjima.",
  },
  tesa: {
    en: "Tesamorelin is a synthetic analogue of growth hormone-releasing hormone, used as a reference compound in laboratory research.",
    sr: "Tesamorelin je sintetički analog hormona koji oslobađa hormon rasta, koji se koristi kao referentno jedinjenje u laboratorijskim istraživanjima.",
  },
  unknown: null,
};

// [name, slug, strength, compound key]
const PRODUCTS = [
  ["BPC-157", "bpc-157-5mg", "5", "bpc157"],
  ["BPC157+TB500", "bpc157-tb500-10mg", "10", "blend"],
  ["GHK-CU", "ghk-cu-50mg", "50", "ghkcu"],
  ["GHK-CU", "ghk-cu-100mg", "100", "ghkcu"],
  ["GLOW", "glow-70mg", "70", "unknown"],
  ["KLOW", "klow-80mg", "80", "unknown"],
  ["L-carnitine", "lcarnitine-1000mg", "1000", "lcarnitine"],
  ["MOTS-C", "mots-c-50mg", "50", "motsc"],
  ["NAD+", "nad-plus-500mg", "500", "nad"],
  ["NAD+", "nad-plus-1000mg", "1000", "nad"],
  ["PT141", "pt141-10mg", "10", "pt141"],
  ["PT21", "pt21-10mg", "10", "unknown"],
  ["Retatrutide", "retatrutide-10mg", "10", "reta"],
  ["Retatrutide", "retatrutide-20mg", "20", "reta"],
  ["Retatrutide", "retatrutide-40mg", "40", "reta"],
  ["TB500", "tb500-5mg", "5", "tb500"],
  ["TI18", "ti18-18mg", "18", "unknown"],
  ["Tesamorelin", "tesamorelin-10mg", "10", "tesa"],
];

function content(name, strength, key) {
  const compound = COMPOUNDS[key];
  if (!compound) return { en: { short: null, full: null }, sr: { short: null, full: null } };
  const build = (text, labels, form, storage, note) => ({
    short: `${text} ${note}`,
    full: [
      text,
      "",
      `${labels.details}:`,
      `- ${labels.strength}: ${strength} mg`,
      `- ${labels.form}: ${form}`,
      `- ${labels.storage}: ${storage}`,
      "",
      labels.coa,
      "",
      note,
    ].join("\n"),
  });
  return {
    en: build(compound.en, { details: "Product details", strength: "Strength", form: "Form", storage: "Storage", coa: "Purity: see the batch-specific COA." }, compound.plain ? PLAIN_EN : FORM_EN, compound.plain ? PLAIN_EN : STORAGE_EN, NOTE_EN),
    sr: build(compound.sr, { details: "Detalji proizvoda", strength: "Jačina", form: "Oblik", storage: "Čuvanje", coa: "Čistoća: pogledajte COA za konkretnu seriju." }, compound.plain ? PLAIN_SR : FORM_SR, compound.plain ? PLAIN_SR : STORAGE_SR, NOTE_SR),
  };
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log(`Mode: ${apply ? "APPLY (writes)" : "DRY RUN"}`);
console.log(`Target: ${url ?? "(NEXT_PUBLIC_SUPABASE_URL not set)"}`);
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY; cannot check existing products.");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: existing, error: existingError } = await db.from("products").select("slug").in("slug", PRODUCTS.map(p => p[1]));
if (existingError) throw existingError;
const taken = new Set(existing.map(row => row.slug));

let created = 0;
const skipped = [];
const empty = [];
for (const [name, slug, strength, compound] of PRODUCTS) {
  if (taken.has(slug)) { skipped.push(slug); continue; }
  const text = content(name, strength, compound);
  if (!text.en.full) empty.push(slug);
  console.log(`${apply ? "create" : "would create"}: ${slug} (${name} ${strength} mg)${text.en.full ? "" : " [empty description]"}`);
  if (!apply) { created++; continue; }
  const { data, error } = await db.from("products").insert({
    slug, strength, unit: "mg", price_amount: null, compare_at_price_amount: null,
    stock_quantity: 0, stock_status: "DISABLED", visibility: "DRAFT", active: false, featured: false,
  }).select("id").single();
  if (error) throw new Error(`${slug}: ${error.message}`);
  const { error: translationError } = await db.from("product_translations").insert([
    { product_id: data.id, locale: "en", name, short_description: text.en.short, description: text.en.full },
    { product_id: data.id, locale: "sr", name, short_description: text.sr.short, description: text.sr.full },
  ]);
  if (translationError) throw new Error(`${slug} translations: ${translationError.message}`);
  created++;
}
console.log(`\n${apply ? "Created" : "Would create"}: ${created}. Skipped (already exist): ${skipped.length}${skipped.length ? ` [${skipped.join(", ")}]` : ""}. Empty description: ${empty.length} [${empty.join(", ")}]`);
