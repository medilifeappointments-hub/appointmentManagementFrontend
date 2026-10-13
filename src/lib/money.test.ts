import { describe, expect, it } from "vitest";
import { formatMoney, isValidMoney, normalizeMoney } from "./money";

describe("money helpers", () => {
  it("formats decimal strings without floating-point conversion", () => {
    expect(formatMoney("1234567.5")).toBe("1,234,567.50");
    expect(formatMoney("9999999999.99")).toBe("9,999,999,999.99");
    expect(formatMoney("0")).toBe("0.00");
    expect(formatMoney(null)).toBe("—");
  });

  it("validates the same rule as the API", () => {
    expect(isValidMoney("150")).toBe(true);
    expect(isValidMoney("150.5")).toBe(true);
    expect(isValidMoney("150.555")).toBe(false);
    expect(isValidMoney("-1")).toBe(false);
    expect(isValidMoney("1,000")).toBe(false);
  });

  it("normalises for comparison", () => {
    expect(normalizeMoney("0150.5")).toBe("150.50");
    expect(normalizeMoney("  ")).toBeNull();
  });
});
