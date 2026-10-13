import { describe, expect, it } from "vitest";
import {
  changedFields,
  emptyFormValues,
  formValuesFromAppointment,
  isAllowedMoneyInput,
  isAllowedPhoneInput,
  isFormDirty,
  validateAppointmentForm,
} from "./appointmentForm";
import type { Appointment } from "./types";

const valid = emptyFormValues({
  clinicNumber: "+971523452646",
  patientType: "NEW",
  team: "SHIM/ZUBAIR",
  mobileNo: "+971 50 123 4567",
  patientName: "Aisha",
  appointmentLocal: "2026-10-13T01:00",
  procedure: "Consultation",
});

const stored: Appointment = {
  id: "1",
  recordNumber: 7,
  clinicNumber: "+971523452646",
  patientType: "NEW",
  cs: null,
  team: "SHIM/ZUBAIR",
  mobileNo: "+971501234567",
  patientName: "Aisha",
  location: null,
  appointmentAt: "2026-10-12T21:00:00.000Z",
  appointmentLocal: "2026-10-13T01:00",
  procedure: "Consultation",
  amount: "150.50",
  resultIssued: null,
  cost: null,
  paymentMethod: null,
  cashAmount: null,
  cardAmount: null,
  status: null,
  approvalCode: "000123",
  version: 1,
  createdAt: "",
  updatedAt: "",
  archivedAt: null,
  createdBy: { id: "u", name: "U" },
  updatedBy: { id: "u", name: "U" },
  archivedBy: null,
};

describe("appointment form", () => {
  it("accepts a complete entry", () => {
    expect(validateAppointmentForm(valid)).toEqual({});
  });

  it("flags required fields, bad phone numbers and money with 3 decimals", () => {
    const errors = validateAppointmentForm(emptyFormValues({ mobileNo: "12ab", amount: "1.005" }));
    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining(["patientType", "team", "mobileNo", "patientName", "appointmentLocal", "procedure", "amount"]),
    );
  });

  it("rejects impossible calendar dates", () => {
    expect(validateAppointmentForm({ ...valid, appointmentLocal: "2026-02-30T10:00" }).appointmentLocal).toBeDefined();
  });

  it("rejects past dates when creating a booking", () => {
    expect(validateAppointmentForm(valid, "2026-10-13T01:01").appointmentLocal).toBe(
      "Appointment date and time cannot be in the past.",
    );
    expect(validateAppointmentForm(valid, "2026-10-13T01:00").appointmentLocal).toBeUndefined();
  });

  it("only permits valid partial phone and money input while typing", () => {
    expect(isAllowedPhoneInput("+971 (50) 123-4567")).toBe(true);
    expect(isAllowedPhoneInput("+971 call me")).toBe(false);
    expect(isAllowedPhoneInput("++971501234567")).toBe(false);
    expect(isAllowedMoneyInput("1250.")).toBe(true);
    expect(isAllowedMoneyInput("1250.50")).toBe(true);
    expect(isAllowedMoneyInput("-1")).toBe(false);
    expect(isAllowedMoneyInput("1.005")).toBe(false);
  });

  it("ignores formatting-only differences when comparing with the stored record", () => {
    const values = { ...formValuesFromAppointment(stored), mobileNo: "+971 50 123 4567", amount: "150.5" };
    expect(changedFields(values, stored)).toEqual([]);
    expect(changedFields({ ...values, status: "Seen" }, stored)).toEqual(["status"]);
  });

  it("keeps leading zeros and detects real edits", () => {
    const initial = formValuesFromAppointment(stored);
    expect(initial.approvalCode).toBe("000123");
    expect(isFormDirty(initial, initial)).toBe(false);
    expect(isFormDirty({ ...initial, approvalCode: "123" }, initial)).toBe(true);
  });
});
