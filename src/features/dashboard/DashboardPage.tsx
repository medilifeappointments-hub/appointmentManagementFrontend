import {
  ArchiveRounded,
  EventAvailableRounded,
  GroupRounded,
  PaymentsRounded,
  ReceiptLongRounded,
  TrendingUpRounded,
} from "@mui/icons-material";
import { Alert, Box, Card, CardHeader, Grid, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DateRangeFields, type DateRange } from "../../components/DateRangeFields";
import { EmptyState } from "../../components/EmptyState";
import { ErrorAlert } from "../../components/ErrorAlert";
import { PageHeader } from "../../components/PageHeader";
import { StatCard } from "../../components/StatCard";
import { api } from "../../lib/api";
import { clinicMonthRange, clinicToday, timeZoneLabel } from "../../lib/clinicTime";
import { formatMoney } from "../../lib/money";
import { useSession } from "../auth/useSession";

interface RecordedTotals {
  records: number;
  recordedAmount: string;
  recordedCost: string;
  recordedNet: string;
  amountEntries: number;
  costEntries: number;
  recordedCash: string;
  recordedCard: string;
}

interface SummaryReport {
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

function useSummaryReport(range: DateRange) {
  const valid = Boolean(range.from && range.to && range.from <= range.to);
  return useQuery({
    queryKey: ["reports", "summary", range],
    queryFn: () => api.get<SummaryReport>("/admin/reports/summary", { from: range.from, to: range.to }).then((r) => r.data),
    enabled: valid,
    placeholderData: keepPreviousData,
  });
}

interface BreakdownRow extends RecordedTotals {
  key: string;
  label: string;
}

function BreakdownTable({ title, labelHeader, rows }: { title: string; labelHeader: string; rows: BreakdownRow[] }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title={title} slotProps={{ title: { variant: "h3", component: "h2" } }} sx={{ borderBottom: 1, borderColor: "divider" }} />
      {rows.length === 0 ? (
        <EmptyState title="No records" description="Nothing was recorded in this date range." />
      ) : (
        <TableContainer>
          <Table size="small" aria-label={title}>
            <TableHead>
              <TableRow>
                <TableCell>{labelHeader}</TableCell>
                <TableCell align="right">Records</TableCell>
                <TableCell align="right">Recorded Amount</TableCell>
                <TableCell align="right">Recorded Cost</TableCell>
                <TableCell align="right">Net</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell sx={{ fontWeight: 500 }}>{row.label}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {row.records}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatMoney(row.recordedAmount)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatMoney(row.recordedCost)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatMoney(row.recordedNet)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}

export function DashboardPage() {
  const { clinic } = useSession();
  const today = clinicToday(clinic.timezone);
  const [range, setRange] = useState<DateRange>(() => clinicMonthRange(today));
  const report = useSummaryReport(range);
  const data = report.data;
  const rangeIncomplete = !range.from || !range.to;

  return (
    <>
      <PageHeader title="Dashboard" description={`Active records by appointment date, clinic time: ${timeZoneLabel(clinic.timezone)}`} />

      <Card sx={{ p: 2, mb: 2 }}>
        <DateRangeFields value={range} onChange={setRange} today={today} required />
      </Card>

      <Alert severity="info" sx={{ mb: 2 }}>
        Totals are sums of the values staff entered and exclude blank (unknown) amounts and costs. They are recorded
        figures, not confirmed collections, and archived records are not included.
      </Alert>

      <Box sx={{ height: 4, mb: 1 }}>{report.isFetching && <LinearProgress aria-label="Loading report" />}</Box>

      {rangeIncomplete ? (
        <Alert severity="warning">Choose both a From and a To date.</Alert>
      ) : report.error ? (
        <ErrorAlert error={report.error} title="Could not load the report" onRetry={() => void report.refetch()} />
      ) : !data ? null : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total active records" value={data.totals.records} icon={<EventAvailableRounded />} caption="Archived records are not counted" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Recorded Amount"
              icon={<PaymentsRounded />}
              value={formatMoney(data.totals.recordedAmount)}
              caption={`From ${data.totals.amountEntries} of ${data.totals.records} records with an amount entered`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Recorded Cost"
              icon={<ReceiptLongRounded />}
              value={formatMoney(data.totals.recordedCost)}
              caption={`From ${data.totals.costEntries} of ${data.totals.records} records with a cost entered`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Recorded Net" value={formatMoney(data.totals.recordedNet)} icon={<TrendingUpRounded />} caption="Recorded amount minus recorded cost" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Cash Collected" value={formatMoney(data.totals.recordedCash)} icon={<PaymentsRounded />} caption="Cash portions recorded for the selected period" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Card Collected" value={formatMoney(data.totals.recordedCard)} icon={<PaymentsRounded />} caption="Card portions recorded for the selected period" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Archived records" value={data.archivedRecords} icon={<ArchiveRounded />} caption="Archived during the selected appointment period" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Active receptionists" value={`${data.staff.activeReceptionists}/${data.staff.totalReceptionists}`} icon={<GroupRounded />} caption="Active and total receptionist accounts" />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <BreakdownTable
              title="Records by receptionist"
              labelHeader="Entered by"
              rows={data.byReceptionist.map((row) => ({ ...row, key: row.userId, label: row.name }))}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <BreakdownTable title="Records by status" labelHeader="Status" rows={data.byStatus.map((row) => ({ ...row, key: row.status, label: row.status }))} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <BreakdownTable title="Records by procedure" labelHeader="Procedure" rows={data.byProcedure.map((row) => ({ ...row, key: row.procedure, label: row.procedure }))} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <BreakdownTable title="Records by location" labelHeader="Location" rows={data.byLocation.map((row) => ({ ...row, key: row.location, label: row.location }))} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <BreakdownTable title="Records by patient type" labelHeader="Patient type" rows={data.byPatientType.map((row) => ({ ...row, key: row.patientType, label: row.patientType === "NEW" ? "New" : "Old" }))} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <BreakdownTable title="Records by clinic number" labelHeader="Clinic number" rows={data.byClinicNumber.map((row) => ({ ...row, key: row.clinicNumber, label: row.clinicNumber }))} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <BreakdownTable title="Records by payment method" labelHeader="Payment method" rows={data.byPaymentMethod.map((row) => ({ ...row, key: row.paymentMethod, label: row.paymentMethod === "CASH" ? "Cash" : row.paymentMethod === "CARD" ? "Card" : row.paymentMethod === "MIXED" ? "Cash + Card" : row.paymentMethod }))} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <BreakdownTable
              title="Records by team"
              labelHeader="Team"
              rows={data.byTeam.map((row) => ({ ...row, key: row.team, label: row.team }))}
            />
          </Grid>
        </Grid>
      )}
    </>
  );
}
