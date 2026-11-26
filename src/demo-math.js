/** Limits for an educational, local-only inventory arithmetic example. */
export const DEMO_LIMITS = Object.freeze({
  weekly: 1_000_000,
  stock: 1_000_000_000,
  onOrder: 1_000_000_000,
  leadWeeks: 104,
  safetyWeeks: 104,
});

// Use the entered decimal value, rather than binary floating-point residue,
// when rounding whole units. Scientific notation is supported as well.
function decimal(value) {
  const [coefficient, exponent = '0'] = value.toString().split('e');
  const [whole, fraction = ''] = coefficient.split('.');
  return { integer: BigInt(whole + fraction), exponent: Number(exponent) - fraction.length };
}

function add(a, b) {
  const exponent = Math.min(a.exponent, b.exponent);
  return {
    integer: a.integer * 10n ** BigInt(a.exponent - exponent)
      + b.integer * 10n ** BigInt(b.exponent - exponent),
    exponent,
  };
}

/**
 * Return whole additional units using an explicitly supplied weekly average.
 * No forecasting, persistence, or external data is involved.
 * @param {{weekly:number,stock:number,onOrder:number,leadWeeks:number,safetyWeeks:number}} input
 * @returns {number}
 */
export function calculateNeed(input) {
  if (!input || typeof input !== 'object') {
    throw new TypeError('Planner inputs must be an object.');
  }
  for (const [key, max] of Object.entries(DEMO_LIMITS)) {
    const value = input[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError(`${key} must be a finite number.`);
    }
    if (value < 0 || value > max) {
      throw new RangeError(`${key} must be between 0 and ${max}.`);
    }
  }
  const weekly = decimal(input.weekly);
  const weeks = add(decimal(input.leadWeeks), decimal(input.safetyWeeks));
  const target = { integer: weekly.integer * weeks.integer, exponent: weekly.exponent + weeks.exponent };
  const available = add(decimal(input.stock), decimal(input.onOrder));
  const shortfall = add(target, { integer: -available.integer, exponent: available.exponent });
  if (shortfall.integer <= 0n) return 0;
  if (shortfall.exponent >= 0) return Number(shortfall.integer * 10n ** BigInt(shortfall.exponent));
  const denominator = 10n ** BigInt(-shortfall.exponent);
  return Number((shortfall.integer + denominator - 1n) / denominator);
}
