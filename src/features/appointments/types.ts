export type PatientType = "NEW" | "OLD";
export type PaymentMethod = "CASH" | "CARD" | "MIXED";

export interface UserRef {
  id: string;
  name: string;
}

/** Mirrors the API's AppointmentDto. Money values are decimal strings. */
export interface Appointment {
  id: string;
  recordNumber: number;
  clinicNumber: string;
  patientType: PatientType;
  cs: string | null;
  team: string;
  mobileNo: string;
  patientName: string;
  location: string | null;
  /** UTC instant, ISO 8601. */
  appointmentAt: string;
  /** Clinic-local "YYYY-MM-DDTHH:mm". */
  appointmentLocal: string;
  procedure: string;
  amount: string | null;
  resultIssued: string | null;
  cost: string | null;
  paymentMethod: PaymentMethod | null;
  cashAmount: string | null;
  cardAmount: string | null;
  status: string | null;
  approvalCode: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  createdBy: UserRef;
  updatedBy: UserRef;
  archivedBy: UserRef | null;
}

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type ArchivedFilter = "active" | "archived" | "all";
export type SortField = "appointmentAt" | "recordNumber" | "patientName" | "createdAt" | "updatedAt";
export type SortOrder = "asc" | "desc";

export interface AppointmentFilters {
  from: string;
  to: string;
  q: string;
  team: string;
  location: string;
  status: string;
  archived: ArchivedFilter;
  page: number;
  pageSize: number;
  sortBy: SortField;
  sortOrder: SortOrder;
}

export interface FilterOptions {
  teams: string[];
  locations: string[];
  statuses: string[];
  procedures: string[];
}

export type AuditAction = "CREATE" | "UPDATE" | "ARCHIVE" | "RESTORE";

export interface AuditEvent {
  id: string;
  action: AuditAction;
  changes: Partial<Record<string, { from?: string | null; to: string | null }>>;
  version: number;
  createdAt: string;
  actor: UserRef;
}

export interface AppointmentHistory {
  appointment: Appointment;
  events: AuditEvent[];
}
