import type { DateRange } from "../../components/DateRangeFields";

export interface RecordedTotals {
  records: number;
  recordedAmount: string;
  recordedCost: string;
  recordedNet: string;
  amountEntries: number;
  costEntries: number;
  recordedCash: string;
  recordedCard: string;
  recordedCollected: string;
  recordedOutstanding: string;
}

export interface SummaryReport {
  range: DateRange;
  totals: RecordedTotals;
  byReceptionist: Array<RecordedTotals & { userId: string; name: string }>;
  byTeam: Array<RecordedTotals & { team: string }>;
  byStatus: Array<RecordedTotals & { status: string }>;
  byProcedure: Array<RecordedTotals & { procedure: string }>;
  byLocation: Array<RecordedTotals & { location: string }>;
  byPatientType: Array<RecordedTotals & { patientType: string }>;
  byClinicNumber: Array<RecordedTotals & { clinicNumber: string }>;
  byPaymentMethod: Array<RecordedTotals & { paymentMethod: string }>;
  archivedRecords: number;
  staff: { activeReceptionists: number; totalReceptionists: number };
}
