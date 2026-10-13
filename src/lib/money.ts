/**
 * Money values stay decimal strings end to end ("1250.50"); they are never parsed into
 * floating-point numbers. Mirrors the server rule: up to 10 integer digits, max 2 decimals.
 */
export const MONEY_PATTERN = /^\d{1,10}(\.\d{1,2})?$/;

export function isValidMoney(value: string): boolean {
  return MONEY_PATTERN.test(value.trim());
}

/** Adds thousands separators to a decimal string without float conversion: "1234567.5" → "1,234,567.50". */
export function formatMoney(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const [integer = "0", fraction = ""] = value.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${grouped}.${fraction.padEnd(2, "0").slice(0, 2)}`;
}

/** Canonical 2-decimal form used to compare user input with stored values. */
export function normalizeMoney(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  if (!isValidMoney(trimmed)) return trimmed;
  const [integer = "0", fraction = ""] = trimmed.split(".");
  return `${integer.replace(/^0+(?=\d)/, "")}.${fraction.padEnd(2, "0")}`;
}
