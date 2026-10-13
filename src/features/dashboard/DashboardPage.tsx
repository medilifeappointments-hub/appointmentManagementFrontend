import {
  ArchiveRounded,
  EventAvailableRounded,
  GroupRounded,
  PaymentsRounded,
  ReceiptLongRounded,
  TrendingUpRounded,
} from "@mui/icons-material";
import { Alert, Box, Card, CardHeader, Grid, LinearProgress, Typography } from "@mui/material";
import { useState } from "react";
import { DataTable, type DataTableColumn } from "../../components/DataTable";
import { DateRangeFields, type DateRange } from "../../components/DateRangeFields";
import { EmptyState } from "../../components/EmptyState";
import { ErrorAlert } from "../../components/ErrorAlert";
import { PageHeader } from "../../components/PageHeader";
import { StatCard } from "../../components/StatCard";
import { clinicMonthRange, clinicToday, timeZoneLabel } from "../../lib/clinicTime";
import { formatMoney } from "../../lib/money";
import { useSession } from "../auth/useSession";
import { useSummaryReport } from "./hooks/useSummaryReport";
import type { RecordedTotals } from "./types";

interface BreakdownRow extends RecordedTotals {
  key: string;
  label: string;
}

const numericCell = { fontVariantNumeric: "tabular-nums", fontWeight: 500 } as const;

function BreakdownTable({ title, labelHeader, rows }: { title: string; labelHeader: string; rows: BreakdownRow[] }) {
  const columns: DataTableColumn<BreakdownRow>[] = [
    {
      id: "label",
      label: labelHeader,
      minWidth: 150,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 650 }}>
          {row.label}
        </Typography>
      ),
    },
    { id: "records", label: "Appointments", align: "right", minWidth: 100, render: (row) => <Box sx={numericCell}>{row.records}</Box> },
    { id: "amount", label: "Amount", align: "right", minWidth: 95, render: (row) => <Box sx={numericCell}>{formatMoney(row.recordedAmount)}</Box> },
    { id: "cash", label: "Cash", align: "right", minWidth: 90, render: (row) => <Box sx={numericCell}>{formatMoney(row.recordedCash)}</Box> },
    { id: "card", label: "Card", align: "right", minWidth: 90, render: (row) => <Box sx={numericCell}>{formatMoney(row.recordedCard)}</Box> },
    { id: "collected", label: "Collected", align: "right", minWidth: 105, render: (row) => <Box sx={numericCell}>{formatMoney(row.recordedCollected)}</Box> },
    { id: "outstanding", label: "Outstanding", align: "right", minWidth: 115, render: (row) => <Box sx={numericCell}>{formatMoney(row.recordedOutstanding)}</Box> },
    { id: "cost", label: "Cost", align: "right", minWidth: 90, render: (row) => <Box sx={numericCell}>{formatMoney(row.recordedCost)}</Box> },
    { id: "net", label: "Net", align: "right", minWidth: 90, render: (row) => <Box sx={numericCell}>{formatMoney(row.recordedNet)}</Box> },
  ];

  return (
    <Card sx={{ height: "100%", overflow: "hidden" }}>
      <CardHeader title={title} slotProps={{ title: { variant: "h3", component: "h2" } }} sx={{ borderBottom: 1, borderColor: "divider" }} />
      {rows.length === 0 ? (
        <EmptyState title="No records" description="Nothing was recorded in this date range." />
      ) : (
        <DataTable
          ariaLabel={title}
          rows={rows}
          columns={columns}
          getRowId={(row) => row.key}
          minWidth={925}
          maxHeight={360}
        />
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
        Amount is the appointment charge. Collected is Cash plus Card. Outstanding is Amount minus Collected. Net is
        Amount minus Cost. Blank values and archived appointments are excluded.
      </Alert>

      <Box sx={{ height: 4, mb: 1 }}>{report.isFetching && <LinearProgress aria-label="Loading report" />}</Box>

      {rangeIncomplete ? (
        <Alert severity="warning">Choose both a From and a To date.</Alert>
      ) : report.error ? (
        <ErrorAlert error={report.error} title="Could not load the report" onRetry={() => void report.refetch()} />
      ) : !data ? null : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Appointments" value={data.totals.records} icon={<EventAvailableRounded />} caption="Active appointments in the selected period" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Total Amount"
              icon={<PaymentsRounded />}
              value={formatMoney(data.totals.recordedAmount)}
              caption={`Entered on ${data.totals.amountEntries} of ${data.totals.records} appointments`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Total Collected"
              icon={<PaymentsRounded />}
              value={formatMoney(data.totals.recordedCollected)}
              caption="Cash and card payments combined"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Outstanding"
              icon={<ReceiptLongRounded />}
              value={formatMoney(data.totals.recordedOutstanding)}
              caption="Amount not assigned to cash or card"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Cash Collected" value={formatMoney(data.totals.recordedCash)} icon={<PaymentsRounded />} caption="Cash portions recorded for the selected period" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Card Collected" value={formatMoney(data.totals.recordedCard)} icon={<PaymentsRounded />} caption="Card portions recorded for the selected period" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Total Cost"
              icon={<ReceiptLongRounded />}
              value={formatMoney(data.totals.recordedCost)}
              caption={`Entered on ${data.totals.costEntries} of ${data.totals.records} appointments`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Net" value={formatMoney(data.totals.recordedNet)} icon={<TrendingUpRounded />} caption="Total Amount minus Total Cost" />
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
