import { formatClinicDateTime } from "../../lib/clinicTime";
import { formatMoney } from "../../lib/money";
import type { PatientType, PaymentMethod } from "./types";

/** Spreadsheet column labels, shared by the table, form, details and history views. */
export const FIELD_LABELS = {
  recordNumber: "Number",
  clinicNumber: "Clinic Number",
  patientType: "New/Old",
  cs: "C-S",
  team: "Team",
  mobileNo: "Mobile No",
  patientName: "Patient Name",
  location: "Location",
  appointmentAt: "Appointment Date & Time",
  appointmentLocal: "Appointment Date & Time",
  procedure: "Procedure",
  amount: "Amount",
  resultIssued: "Result Issued",
  cost: "Cost",
  paymentMethod: "Cash/Card",
  cashAmount: "Cash Amount",
  cardAmount: "Card Amount",
  status: "Status",
  approvalCode: "Approval Code",
} as const;

export const PATIENT_TYPE_LABELS: Record<PatientType, string> = { NEW: "New", OLD: "Old" };
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = { CASH: "Cash", CARD: "Card", MIXED: "Cash + Card" };
export const APPOINTMENT_STATUS_OPTIONS = ["Pending", "Confirmed", "Completed", "Cancelled", "No-show"] as const;
export const RESULT_ISSUED_OPTIONS = ["Pending", "Issued"] as const;

/** Text limits mirrored from the API so users see problems before saving. */
export const FIELD_LIMITS = {
  cs: 50,
  team: 100,
  patientName: 150,
  location: 150,
  procedure: 200,
  resultIssued: 100,
  status: 50,
  approvalCode: 50,
} as const;

export function fieldLabel(field: string): string {
  return (FIELD_LABELS as Record<string, string>)[field] ?? field;
}

/** Display form of a raw audit value for a given field. */
export function formatAuditValue(field: string, value: string | null | undefined, timeZone: string): string {
  if (value === null || value === undefined || value === "") return "(blank)";
  switch (field) {
    case "appointmentAt":
      return formatClinicDateTime(value, timeZone);
    case "amount":
    case "cost":
    case "cashAmount":
    case "cardAmount":
      return formatMoney(value);
    case "patientType":
      return PATIENT_TYPE_LABELS[value as PatientType] ?? value;
    case "paymentMethod":
      return PAYMENT_METHOD_LABELS[value as PaymentMethod] ?? value;
    default:
      return value;
  }
}
