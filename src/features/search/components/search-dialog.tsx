"use client";

import { useEffect, useRef, useState } from "react";

import { CloseIcon, SearchIcon } from "@/components/icons/site-icons";
import type { Dictionary } from "@/i18n/dictionaries";

type SearchDialogProps = Readonly<{ copy: Dictionary["search"]; instanceId: string; triggerLabel: string }>;

export function SearchDialog({ copy, instanceId, triggerLabel }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return <>
    <button aria-label={triggerLabel} className="header-icon" onClick={() => setOpen(true)} type="button"><SearchIcon className="size-[1.15rem]" /></button>
    <dialog aria-labelledby={`${instanceId}-title`} className="search-dialog" onCancel={() => setOpen(false)} onClose={() => setOpen(false)} ref={dialogRef}>
      <div className="search-dialog__header">
        <p className="type-eyebrow text-accent" id={`${instanceId}-title`}>{copy.title}</p>
        <button aria-label="Close" className="header-icon" onClick={() => setOpen(false)} type="button"><CloseIcon className="size-5" /></button>
      </div>
      <div className="search-dialog__body">
        <label className="sr-only" htmlFor={`${instanceId}-input`}>{copy.label}</label>
        <div className="search-dialog__field"><SearchIcon className="size-6" /><input autoFocus id={`${instanceId}-input`} onChange={(event) => setQuery(event.target.value)} placeholder={copy.placeholder} type="search" value={query} /></div>
        <div aria-live="polite" className="search-dialog__empty">
          <span className="section-index">{query ? `QUERY / ${query}` : "CATALOGUE / 000"}</span>
          <h2>{copy.emptyTitle}</h2><p>{copy.emptyDescription}</p>
        </div>
      </div>
      <p className="search-dialog__hint">{copy.hint}</p>
    </dialog>
  </>;
}
