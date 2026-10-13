"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { StatusPill } from "@/features/admin/components/admin-ui";
import { runBulkProductAction } from "@/features/admin/products/bulk-actions";
import { planBulkAction, maxBulkProducts, type BulkAction, type BulkProduct, type BulkPublishMode, type BulkResult } from "@/features/admin/products/bulk-plan";
import { deleteProduct, setProductState } from "@/features/admin/products/actions";

export type ProductRow = BulkProduct & {
  sku: string | null;
  strength: string;
  unit: string;
  priceLabel: string;
  featured: boolean;
  updatedAt: string;
};

const actionLabels: Record<BulkAction, string> = { publish: "Publish", unpublish: "Unpublish", enable: "Enable", disable: "Disable" };

export function ProductsTable({ products }: { products: ProductRow[] }) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);
  const [mode, setMode] = useState<BulkPublishMode>("complete");
  const [result, setResult] = useState<BulkResult | null>(null);
  const [pending, startTransition] = useTransition();
  const dialog = useRef<HTMLDialogElement>(null);

  const selectable = products.filter(product => !product.archived).slice(0, maxBulkProducts);
  const chosen = products.filter(product => selected.has(product.id));
  const allSelected = selectable.length > 0 && selectable.every(product => selected.has(product.id));
  const incomplete = pendingAction === "publish" ? chosen.filter(product => !product.imageCount || !product.hasEnDescription) : [];

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (pendingAction && !element.open) element.showModal();
    if (!pendingAction && element.open) element.close();
  }, [pendingAction]);

  function toggle(id: string) {
    setSelected(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function open(action: BulkAction) {
    setMode("complete");
    setResult(null);
    setPendingAction(action);
  }

  function confirm() {
    if (!pendingAction) return;
    const action = pendingAction;
    startTransition(async () => {
      const outcome = await runBulkProductAction({ action, mode, ids: [...selected] });
      setResult(outcome);
      setPendingAction(null);
      if (outcome.success) setSelected(new Set());
    });
  }

  const plan = pendingAction ? planBulkAction(chosen, pendingAction, mode) : null;
  const summary = pendingAction ? `${actionLabels[pendingAction]} ${chosen.length} product${chosen.length === 1 ? "" : "s"}` : "";

  return <>
    {result ? <div className="admin-bulk-result" role="status">
      <p className="admin-bulk-result__title" data-ok={result.success}>{result.message} {result.skipped.length ? `Skipped ${result.skipped.length}.` : ""}</p>
      {result.skipped.length ? <ul>{result.skipped.map((item, index) => <li key={`${item.name}-${index}`}>{item.name}: {item.reason}</li>)}</ul> : null}
    </div> : null}
    {selected.size ? <div className="admin-bulk-bar" role="toolbar" aria-label="Bulk product actions">
      <strong>{selected.size} selected</strong>
      <div className="admin-row-actions">
        {(Object.keys(actionLabels) as BulkAction[]).map(action => <button className="admin-button admin-button--secondary" disabled={pending} key={action} onClick={() => open(action)} type="button">{actionLabels[action]}</button>)}
        <button className="admin-button admin-button--secondary" disabled={pending} onClick={() => setSelected(new Set())} type="button">Clear selection</button>
      </div>
    </div> : null}
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr>
      <th><input aria-label="Select all products on this page" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(selectable.map(product => product.id)))} type="checkbox" /></th>
      <th>Name</th><th>Strength</th><th>SKU</th><th>Price</th><th>Stock</th><th>Status</th><th>Visibility</th><th>Flags</th><th>Updated</th><th>Actions</th>
    </tr></thead><tbody>{products.map(product => <tr key={product.id}>
      <td><input aria-label={`Select ${product.name}`} checked={selected.has(product.id)} disabled={product.archived} onChange={() => toggle(product.id)} type="checkbox" /></td>
      <td><Link href={`/admin/products/${product.id}`}>{product.name}</Link></td>
      <td>{product.strength} {product.unit}</td><td>{product.sku ?? "—"}</td><td>{product.priceLabel}</td><td>{product.stockQuantity}</td>
      <td><StatusPill tone={product.stockStatus === "IN_STOCK" ? "good" : product.stockStatus === "LOW_STOCK" ? "warning" : "neutral"}>{product.stockStatus}</StatusPill></td>
      <td>{product.visibility}</td>
      <td>{product.active ? "Active" : "Disabled"}{product.featured ? " · Featured" : ""}{product.archived ? " · Archived" : ""}</td>
      <td>{new Date(product.updatedAt).toLocaleDateString()}</td>
      <td><div className="admin-row-actions"><Link href={`/admin/products/${product.id}`}>Edit</Link>
        <form action={setProductState.bind(null, product.id, "disable")}><button type="submit">Disable</button></form>
        <form action={setProductState.bind(null, product.id, "archive")}><button type="submit">Archive</button></form>
        <form action={deleteProduct.bind(null, product.id)}><button type="submit">Safe delete</button></form></div></td>
    </tr>)}</tbody></table></div>
    <dialog aria-labelledby="bulk-dialog-title" className="admin-dialog" onCancel={() => setPendingAction(null)} ref={dialog}>
      {pendingAction && plan ? <div className="admin-dialog__body">
        <h2 id="bulk-dialog-title">{summary}</h2>
        <p className="admin-help">{chosen.map(product => `${product.name} ${product.strength} ${product.unit}`).join(", ")}</p>
        {pendingAction === "publish" && incomplete.length ? <fieldset className="admin-dialog__warning">
          <legend>{incomplete.length} incomplete product{incomplete.length === 1 ? "" : "s"}</legend>
          <ul>{incomplete.map(product => <li key={product.id}>{product.name} {product.strength}: {[!product.imageCount ? "no image" : null, !product.hasEnDescription ? "no EN description" : null].filter(Boolean).join(", ")}</li>)}</ul>
          <label><input checked={mode === "complete"} name="publish-mode" onChange={() => setMode("complete")} type="radio" /> Publish only complete products (skip incomplete)</label>
          <label><input checked={mode === "all"} name="publish-mode" onChange={() => setMode("all")} type="radio" /> Publish all selected anyway (incomplete products go live without {incomplete.some(product => !product.imageCount) ? "an image or " : ""}full copy)</label>
        </fieldset> : null}
        <p>{plan.eligible.length} will change{plan.skipped.length ? `, ${plan.skipped.length} will be skipped` : ""}.</p>
        {plan.skipped.length ? <ul className="admin-dialog__skipped">{plan.skipped.map(item => <li key={item.id}>{item.name}: {item.reason}</li>)}</ul> : null}
        <div className="admin-row-actions">
          <button className="admin-button" disabled={pending || !plan.eligible.length} onClick={confirm} type="button">{pending ? "Working…" : `Confirm ${actionLabels[pendingAction].toLowerCase()}`}</button>
          <button className="admin-button admin-button--secondary" disabled={pending} onClick={() => setPendingAction(null)} type="button">Cancel</button>
        </div>
      </div> : null}
    </dialog>
  </>;
}
