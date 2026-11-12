/** Indian-numeral formatting helpers (₹2,13,528). Rounding is half-up, shared with `roundPaisa`. */

import { roundHalfUp } from "./rounding";

/** Shown instead of a number when a result cannot be computed (never "₹0.00" for NaN). */
export const NOT_AVAILABLE = "—";

function formatted(value: number, decimals: number): string | null {
  if (!Number.isFinite(value)) return null;
  return roundHalfUp(value, decimals).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatInr(value: number, decimals = 2): string {
  const text = formatted(value, decimals);
  return text === null ? NOT_AVAILABLE : `₹${text}`;
}

export function formatNumber(value: number, decimals = 2): string {
  return formatted(value, decimals) ?? NOT_AVAILABLE;
}

export function formatInt(value: number): string {
  return formatted(value, 0) ?? NOT_AVAILABLE;
}
