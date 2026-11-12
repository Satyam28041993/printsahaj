/** Indian-numeral formatting helpers (₹ 2,13,528). */

const safe = (value: number): number => (Number.isFinite(value) ? value : 0);

export function formatInr(value: number, decimals = 2): string {
  return `₹${safe(value).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatNumber(value: number, decimals = 2): string {
  return safe(value).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatInt(value: number): string {
  return Math.round(safe(value)).toLocaleString("en-IN");
}
