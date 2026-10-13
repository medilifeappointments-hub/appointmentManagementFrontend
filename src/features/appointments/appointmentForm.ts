import { isValidMoney, normalizeMoney } from "../../lib/money";
import { FIELD_LABELS, FIELD_LIMITS } from "./fields";
import type { Appointment, PatientType, PaymentMethod } from "./types";

/** Form state: every field is a string so inputs stay controlled and blank is representable. */
export interface AppointmentFormValues {
  clinicNumber: string;
  patientType: PatientType | "";
  cs: string;
  team: string;
  mobileNo: string;
  patientName: string;
  location: string;
  appointmentLocal: string;
  procedure: string;
  amount: string;
  resultIssued: string;
  cost: string;
  paymentMethod: PaymentMethod | "";
  cashAmount: string;
  cardAmount: string;
  status: string;
  approvalCode: string;
}

export type FormField = keyof AppointmentFormValues;
export type FormErrors = Partial<Record<FormField, string>>;

/** Request body fields (the API trims, converts blanks to null and validates again). */
export type AppointmentFieldsPayload = AppointmentFormValues;

export const FORM_FIELDS: FormField[] = [
  "clinicNumber",
  "patientType",
  "cs",
  "team",
  "mobileNo",
  "patientName",
  "location",
  "appointmentLocal",
  "procedure",
  "amount",
  "resultIssued",
  "cost",
  "paymentMethod",
  "cashAmount",
  "cardAmount",
  "status",
  "approvalCode",
];

export function emptyFormValues(defaults: Partial<AppointmentFormValues> = {}): AppointmentFormValues {
  return {
    clinicNumber: "",
    patientType: "",
    cs: "",
    team: "",
    mobileNo: "",
    patientName: "",
    location: "",
    appointmentLocal: "",
    procedure: "",
    amount: "",
    resultIssued: "",
    cost: "",
    paymentMethod: "",
    cashAmount: "",
    cardAmount: "",
    status: "",
    approvalCode: "",
    ...defaults,
  };
}

export function formValuesFromAppointment(appointment: Appointment): AppointmentFormValues {
  return {
    clinicNumber: appointment.clinicNumber,
    patientType: appointment.patientType,
    cs: appointment.cs ?? "",
    team: appointment.team,
    mobileNo: appointment.mobileNo,
    patientName: appointment.patientName,
    location: appointment.location ?? "",
    appointmentLocal: appointment.appointmentLocal,
    procedure: appointment.procedure,
    amount: appointment.amount ?? "",
    resultIssued: appointment.resultIssued ?? "",
    cost: appointment.cost ?? "",
    paymentMethod: appointment.paymentMethod ?? "",
    cashAmount: appointment.cashAmount ?? "",
    cardAmount: appointment.cardAmount ?? "",
    status: appointment.status ?? "",
    approvalCode: appointment.approvalCode ?? "",
  };
}

const PHONE_SEPARATORS = /[\s\-().]/g;
const PHONE_PATTERN = /^\+?\d{6,15}$/;
const LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const PHONE_INPUT_PATTERN = /^\+?[\d\s\-().]*$/;
const MONEY_INPUT_PATTERN = /^\d{0,10}(?:\.\d{0,2})?$/;

export function normalizePhone(value: string): string {
  return value.trim().replace(PHONE_SEPARATORS, "");
}

/** Allows useful phone formatting while preventing letters, misplaced + signs and too many digits. */
export function isAllowedPhoneInput(value: string): boolean {
  return PHONE_INPUT_PATTERN.test(value) && normalizePhone(value).replace(/^\+/, "").length <= 15;
}

/** Partial money input accepted while typing. Empty and a trailing decimal point are intentionally allowed. */
export function isAllowedMoneyInput(value: string): boolean {
  return MONEY_INPUT_PATTERN.test(value);
}

function isRealLocalDateTime(value: string): boolean {
  if (!LOCAL_DATE_TIME.test(value)) return false;
  const [date, time] = value.split("T") as [string, string];
  const [year, month, day] = date.split("-").map(Number) as [number, number, number];
  const [hour, minute] = time.split(":").map(Number) as [number, number];
  if (hour > 23 || minute > 59) return false;
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

/** Validates one field, used on blur and to refresh an error as the user corrects it. */
export function validateAppointmentField(
  values: AppointmentFormValues,
  field: FormField,
  earliestAppointmentLocal?: string,
): string | undefined {
  const requiredFields: FormField[] = ["clinicNumber", "patientType", "team", "mobileNo", "patientName", "appointmentLocal", "procedure"];
  const value = values[field];

  if (requiredFields.includes(field) && !value.trim()) return `${FIELD_LABELS[field]} is required.`;

  if (field in FIELD_LIMITS) {
    const max = FIELD_LIMITS[field as keyof typeof FIELD_LIMITS];
    if (value.trim().length > max) return `${FIELD_LABELS[field]} must be at most ${max} characters.`;
  }

  if ((field === "mobileNo" || field === "clinicNumber") && !PHONE_PATTERN.test(normalizePhone(value))) {
    return "Enter 6–15 digits, optionally starting with + and the country code.";
  }
  if (field === "appointmentLocal" && !isRealLocalDateTime(value)) {
    return "Enter a valid, complete date and time.";
  }
  if (field === "appointmentLocal" && earliestAppointmentLocal && value < earliestAppointmentLocal) {
    return "Appointment date and time cannot be in the past.";
  }
  if ((field === "amount" || field === "cost" || field === "cashAmount" || field === "cardAmount") && value.trim() && !isValidMoney(value)) {
    return "Enter a non-negative amount with at most 2 decimal places (e.g. 150 or 150.50).";
  }
  return undefined;
}

/** Client-side checks mirroring the API, so most mistakes are caught before saving. */
export function validateAppointmentForm(values: AppointmentFormValues, earliestAppointmentLocal?: string): FormErrors {
  const errors: FormErrors = {};
  for (const field of FORM_FIELDS) {
    const error = validateAppointmentField(values, field, earliestAppointmentLocal);
    if (error) errors[field] = error;
  }
  if (values.paymentMethod === "MIXED" && (!values.cashAmount || !values.cardAmount)) {
    if (!values.cashAmount) errors.cashAmount = "Cash Amount is required for a split payment.";
    if (!values.cardAmount) errors.cardAmount = "Card Amount is required for a split payment.";
  }
  if (values.paymentMethod && values.amount && !errors.amount && !errors.cashAmount && !errors.cardAmount) {
    const cents = (value: string) => Math.round(Number(value || 0) * 100);
    if (cents(values.cashAmount) + cents(values.cardAmount) !== cents(values.amount)) {
      errors.amount = "Cash Amount and Card Amount must add up to Amount.";
    }
  }
  return errors;
}

/** Canonical comparable form of a field, matching how the server stores it. */
function canonical(field: FormField, value: string): string | null {
  if (field === "mobileNo" || field === "clinicNumber") return normalizePhone(value);
  if (field === "amount" || field === "cost" || field === "cashAmount" || field === "cardAmount") return normalizeMoney(value);
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** Fields where the form differs from a stored record (ignoring formatting-only differences). */
export function changedFields(values: AppointmentFormValues, appointment: Appointment): FormField[] {
  const stored = formValuesFromAppointment(appointment);
  return FORM_FIELDS.filter((field) => canonical(field, values[field]) !== canonical(field, stored[field]));
}

export function isFormDirty(values: AppointmentFormValues, initial: AppointmentFormValues): boolean {
  return FORM_FIELDS.some((field) => canonical(field, values[field]) !== canonical(field, initial[field]));
}
