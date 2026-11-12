/**
 * One rounding rule for the whole product: half-up (half away from zero).
 *
 * `Math.round(value * 100) / 100` is NOT reliable half-up: 2.135 × 100 is
 * 213.49999999999997 in binary, so it gives 2.13. Shifting the decimal point
 * through the number's shortest decimal text ("2.135e2" → 213.5) avoids the
 * multiplication error, so 2.135 → 2.14, 9.995 → 10.00, 1.005 → 1.01.
 */
export function roundHalfUp(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return value;
  const places = Math.max(0, Math.floor(decimals));
  const magnitude = Math.abs(value);
  const text = String(magnitude);
  // Exponent notation (below 1e-6, or 1e21 and above): the decimal point cannot
  // be shifted through the text, and plain arithmetic is exact enough there.
  const whole = text.includes("e") ? Number.NaN : Math.round(Number(`${text}e${places}`));
  const rounded = Number.isFinite(whole) && whole < 1e21 ? Number(`${whole}e-${places}`) : Math.round(magnitude * 10 ** places) / 10 ** places;
  return value < 0 && rounded !== 0 ? -rounded : rounded;
}

/** Display rounding for rupees: 2 decimals, half-up. */
export const roundPaisa = (value: number): number => roundHalfUp(value, 2);
