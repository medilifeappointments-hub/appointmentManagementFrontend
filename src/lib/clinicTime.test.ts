import { describe, expect, it } from "vitest";
import { clinicMonthRange, clinicToday, formatClinicDateTime } from "./clinicTime";

describe("clinic time display", () => {
  it("returns the full clinic calendar month, including leap years", () => {
    expect(clinicMonthRange("2026-10-13")).toEqual({ from: "2026-10-01", to: "2026-10-31" });
    expect(clinicMonthRange("2028-02-10")).toEqual({ from: "2028-02-01", to: "2028-02-29" });
  });
  it("shows instants in the clinic timezone regardless of the browser timezone", () => {
    expect(formatClinicDateTime("2026-10-12T21:00:00.000Z", "Asia/Dubai")).toBe("13 Oct 2026, 01:00");
  });

  it("computes the clinic's today", () => {
    expect(clinicToday("Asia/Dubai", new Date("2026-10-12T22:30:00Z"))).toBe("2026-10-13");
    expect(clinicToday("America/New_York", new Date("2026-10-12T22:30:00Z"))).toBe("2026-10-12");
  });
});
