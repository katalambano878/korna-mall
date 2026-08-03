/** KORNA MALL runs as a pre-order store — all listed products are pre-order unless opted out. */

export const PREORDER_STORE = process.env.NEXT_PUBLIC_PREORDER_STORE !== 'false';

export const DEFAULT_PREORDER_SHIPPING =
  process.env.NEXT_PUBLIC_PREORDER_SHIPPING_NOTE?.trim() ||
  'Pre-order — ships when stock arrives. Pay in full or 50% now at checkout.';

export type ProductMetadata = {
  is_preorder?: boolean;
  preorder_shipping?: string | null;
  [key: string]: unknown;
} | null | undefined;

export function isPreorderProduct(metadata?: ProductMetadata): boolean {
  if (metadata?.is_preorder === false) return false;
  if (PREORDER_STORE) return true;
  return Boolean(metadata?.is_preorder || metadata?.preorder_shipping);
}

export function getPreorderShippingNote(metadata?: ProductMetadata): string | null {
  if (!isPreorderProduct(metadata)) return null;
  const custom =
    typeof metadata?.preorder_shipping === 'string' ? metadata.preorder_shipping.trim() : '';
  return custom || DEFAULT_PREORDER_SHIPPING;
}

export function normalizeProductMetadata(
  metadata: ProductMetadata,
  preorderShippingInput?: string
): Record<string, unknown> {
  const base =
    metadata && typeof metadata === 'object' && !Array.isArray(metadata)
      ? { ...metadata }
      : {};

  if (!isPreorderProduct(base) && !PREORDER_STORE) {
    return base;
  }

  const note = (preorderShippingInput ?? String(base.preorder_shipping ?? '')).trim();
  return {
    ...base,
    is_preorder: true,
    preorder_shipping: note || DEFAULT_PREORDER_SHIPPING,
  };
}
