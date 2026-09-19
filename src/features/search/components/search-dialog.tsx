"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { CloseIcon, SearchIcon } from "@/components/icons/site-icons";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type SearchResult = Readonly<{ id: string; slug: string; name: string; strength: string; unit?: string }>;
type SearchDialogProps = Readonly<{ copy: Dictionary["search"]; instanceId: string; locale: Locale; triggerLabel: string }>;

export function SearchDialog({ copy, instanceId, locale, triggerLabel }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<readonly SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function search(value: string) {
    setQuery(value);
    requestRef.current?.abort();
    if (value.trim().length < 2) { setResults([]); setLoading(false); return; }
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    try {
      const response = await fetch(`/api/catalog/search?locale=${locale}&q=${encodeURIComponent(value)}`, { cache: "no-store", signal: controller.signal });
      const payload = await response.json() as { products?: SearchResult[] };
      setResults(response.ok ? payload.products ?? [] : []);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setResults([]);
    } finally {
      if (requestRef.current === controller) setLoading(false);
    }
  }

  return <>
    <button aria-label={triggerLabel} className="header-icon" onClick={() => setOpen(true)} type="button"><SearchIcon className="size-[1.15rem]" /></button>
    <dialog aria-labelledby={`${instanceId}-title`} className="search-dialog" onCancel={() => setOpen(false)} onClose={() => setOpen(false)} ref={dialogRef}>
      <div className="search-dialog__header">
        <p className="type-eyebrow text-accent" id={`${instanceId}-title`}>{copy.title}</p>
        <button aria-label="Close" className="header-icon" onClick={() => setOpen(false)} type="button"><CloseIcon className="size-5" /></button>
      </div>
      <div className="search-dialog__body">
        <label className="sr-only" htmlFor={`${instanceId}-input`}>{copy.label}</label>
        <div className="search-dialog__field"><SearchIcon className="size-6" /><input autoFocus id={`${instanceId}-input`} onChange={(event) => void search(event.target.value)} placeholder={copy.placeholder} type="search" value={query} /></div>
        <div aria-live="polite" className="search-dialog__empty">
          <span className="section-index">{loading ? "SEARCHING" : `CATALOGUE / ${String(results.length).padStart(3, "0")}`}</span>
          {results.length ? <div className="search-results">{results.map((product) => <Link href={`/${locale}/products/${product.slug}`} key={product.id} onClick={() => setOpen(false)}><span>{product.name}</span><small>{product.strength} {product.unit}</small></Link>)}</div> : <><h2>{copy.emptyTitle}</h2><p>{copy.emptyDescription}</p></>}
        </div>
      </div>
      <p className="search-dialog__hint">{copy.hint}</p>
    </dialog>
  </>;
}
