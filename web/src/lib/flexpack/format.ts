/** Indian-numeral formatting helpers (₹ 2,13,528). */

const safe = (value: number): number => (Number.isFinite(value) ? value : 0);

/** Half-up to `decimals` places, so the screen agrees with `roundPaisa` (1.005 → 1.01). */
function halfUp(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  const rounded = Math.round((Math.abs(safe(value)) + Number.EPSILON) * factor) / factor;
  return value < 0 ? -rounded : rounded;
}

export function formatInr(value: number, decimals = 2): string {
  return `₹${halfUp(value, decimals).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatNumber(value: number, decimals = 2): string {
  return halfUp(value, decimals).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatInt(value: number): string {
  return Math.round(safe(value)).toLocaleString("en-IN");
}
