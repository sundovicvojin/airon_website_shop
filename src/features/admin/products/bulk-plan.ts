export const bulkActions = ["publish", "unpublish", "enable", "disable"] as const;
export type BulkAction = (typeof bulkActions)[number];
export type BulkPublishMode = "complete" | "all";

export const maxBulkProducts = 200;

export type BulkProduct = {
  id: string;
  name: string;
  slug: string;
  archived: boolean;
  visibility: string;
  active: boolean;
  stockStatus: string;
  stockQuantity: number;
  imageCount: number;
  hasEnDescription: boolean;
};

export type BulkPlan = {
  eligible: BulkProduct[];
  skipped: { id: string; name: string; reason: string }[];
};

export type BulkResult = {
  success: boolean;
  message: string;
  changed: number;
  skipped: { name: string; reason: string }[];
};

export const bulkChanges = {
  publish: { visibility: "PUBLIC", active: true },
  unpublish: { visibility: "DRAFT", active: false },
  enable: { stock_status: "IN_STOCK" },
  disable: { stock_status: "DISABLED" },
} as const satisfies Record<BulkAction, Record<string, string | boolean>>;

/** Pure decision logic shared by the confirm dialog (preview) and the server action (authoritative). */
export function planBulkAction(products: readonly BulkProduct[], action: BulkAction, mode: BulkPublishMode = "complete"): BulkPlan {
  const eligible: BulkProduct[] = [];
  const skipped: BulkPlan["skipped"] = [];
  for (const product of products) {
    const reasons: string[] = [];
    if (product.archived) reasons.push("archived");
    else if (action === "publish") {
      if (product.visibility === "PUBLIC" && product.active) reasons.push("already published");
      else if (mode === "complete") {
        if (!product.imageCount) reasons.push("no image");
        if (!product.hasEnDescription) reasons.push("no EN description");
      }
    } else if (action === "unpublish") {
      if (product.visibility === "DRAFT" && !product.active) reasons.push("already unpublished");
    } else if (action === "enable") {
      if (product.stockStatus !== "DISABLED") reasons.push(`stock status is ${product.stockStatus}`);
      else if (product.stockQuantity < 1) reasons.push("stock quantity is 0");
    } else if (product.stockStatus === "DISABLED") reasons.push("already disabled");
    if (reasons.length) skipped.push({ id: product.id, name: product.name, reason: reasons.join(", ") });
    else eligible.push(product);
  }
  return { eligible, skipped };
}
