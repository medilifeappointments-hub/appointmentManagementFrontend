import { Chip } from "@mui/material";
import { PATIENT_TYPE_LABELS, PAYMENT_METHOD_LABELS } from "../fields";
import type { PatientType, PaymentMethod } from "../types";

/** Small, consistent badges shared by the table, mobile cards and details view. */
export function PatientTypeChip({ value }: { value: PatientType }) {
  return (
    <Chip
      size="small"
      label={PATIENT_TYPE_LABELS[value]}
      color={value === "NEW" ? "primary" : "default"}
      variant={value === "NEW" ? "filled" : "outlined"}
      sx={value === "NEW" ? { bgcolor: "action.selected", color: "primary.main" } : undefined}
    />
  );
}

export function PaymentMethodChip({ value }: { value: PaymentMethod }) {
  return <Chip size="small" variant="outlined" label={PAYMENT_METHOD_LABELS[value]} />;
}

export function ArchivedChip() {
  return <Chip size="small" label="Archived" sx={{ bgcolor: "warning.light", color: "warning.main" }} />;
}

const STATUS_STYLES: Record<string, { color: "default" | "primary" | "success" | "warning" | "error"; label: string }> = {
  pending: { color: "warning", label: "Pending" },
  confirmed: { color: "primary", label: "Confirmed" },
  "checked in": { color: "primary", label: "Checked in" },
  "in progress": { color: "primary", label: "In progress" },
  completed: { color: "success", label: "Completed" },
  cancelled: { color: "error", label: "Cancelled" },
  canceled: { color: "error", label: "Cancelled" },
  "no-show": { color: "default", label: "No-show" },
  "no show": { color: "default", label: "No-show" },
};

/** Gives common appointment statuses a consistent treatment while preserving custom statuses. */
export function AppointmentStatusChip({ value }: { value: string | null }) {
  if (!value) return <Chip size="small" variant="outlined" label="Not provided" />;
  const known = STATUS_STYLES[value.trim().toLowerCase()];
  return (
    <Chip
      size="small"
      color={known?.color ?? "default"}
      variant={known ? "filled" : "outlined"}
      label={known?.label ?? value}
    />
  );
}
