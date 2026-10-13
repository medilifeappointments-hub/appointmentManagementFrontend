import { EditRounded, VisibilityRounded } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataTable, type DataTableColumn } from "../../components/DataTable";
import { formatClinicDate, formatClinicTime } from "../../lib/clinicTime";
import { formatMoney } from "../../lib/money";
import { AppointmentStatusChip, ArchivedChip, PatientTypeChip, PaymentMethodChip } from "./appointmentBadges";
import { FIELD_LABELS } from "./fields";
import type { Appointment, SortField, SortOrder } from "./types";

type Column = DataTableColumn<Appointment, SortField>;

const muted = (value: string | null) =>
  value ?? (
    <Box component="span" sx={{ color: "text.disabled" }}>
      —
    </Box>
  );

const money = (value: string | null) => (value === null ? muted(null) : formatMoney(value));

const numeric = { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } as const;
// Fits inside a typical large desktop content area after the sidebar, while
// remaining wide enough to keep every business column readable.
const desktopTableMinWidth = 1560;

/** Columns in spreadsheet order. */
function buildColumns(timeZone: string): Column[] {
  return [
    { id: "recordNumber", label: FIELD_LABELS.recordNumber, minWidth: 90, render: (row) => <Box sx={numeric}>#{row.recordNumber}</Box> },
    {
      id: "clinicNumber",
      label: FIELD_LABELS.clinicNumber,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 650, color: "primary.main", ...numeric }}>
          {row.clinicNumber}
        </Typography>
      ),
    },
    { id: "patientType", label: FIELD_LABELS.patientType, render: (row) => <PatientTypeChip value={row.patientType} /> },
    { id: "cs", label: FIELD_LABELS.cs, render: (row) => muted(row.cs) },
    { id: "team", label: FIELD_LABELS.team, minWidth: 120, render: (row) => row.team },
    { id: "mobileNo", label: FIELD_LABELS.mobileNo, render: (row) => <Box sx={numeric}>{row.mobileNo}</Box> },
    {
      id: "patientName",
      label: FIELD_LABELS.patientName,
      sortKey: "patientName",
      minWidth: 170,
      render: (row) => (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.patientName}
          </Typography>
          {row.archivedAt && <ArchivedChip />}
        </Stack>
      ),
    },
    { id: "location", label: FIELD_LABELS.location, minWidth: 120, render: (row) => muted(row.location) },
    {
      id: "appointmentDate",
      label: "Date",
      sortKey: "appointmentAt",
      minWidth: 120,
      render: (row) => <Box sx={{ ...numeric, fontWeight: 500 }}>{formatClinicDate(row.appointmentAt, timeZone)}</Box>,
    },
    {
      id: "appointmentTime",
      label: "Time",
      minWidth: 100,
      render: (row) => <Box sx={{ ...numeric, fontWeight: 500 }}>{formatClinicTime(row.appointmentAt, timeZone)}</Box>,
    },
    { id: "procedure", label: FIELD_LABELS.procedure, minWidth: 160, render: (row) => row.procedure },
    { id: "amount", label: FIELD_LABELS.amount, align: "right", minWidth: 100, render: (row) => <Box sx={numeric}>{money(row.amount)}</Box> },
    { id: "cashAmount", label: FIELD_LABELS.cashAmount, align: "right", minWidth: 110, render: (row) => <Box sx={numeric}>{money(row.cashAmount)}</Box> },
    { id: "cardAmount", label: FIELD_LABELS.cardAmount, align: "right", minWidth: 110, render: (row) => <Box sx={numeric}>{money(row.cardAmount)}</Box> },
    { id: "resultIssued", label: FIELD_LABELS.resultIssued, render: (row) => muted(row.resultIssued) },
    { id: "cost", label: FIELD_LABELS.cost, align: "right", render: (row) => <Box sx={numeric}>{money(row.cost)}</Box> },
    { id: "paymentMethod", label: FIELD_LABELS.paymentMethod, render: (row) => (row.paymentMethod ? <PaymentMethodChip value={row.paymentMethod} /> : muted(null)) },
    { id: "status", label: FIELD_LABELS.status, render: (row) => <AppointmentStatusChip value={row.status} /> },
    { id: "approvalCode", label: FIELD_LABELS.approvalCode, render: (row) => <Box sx={numeric}>{muted(row.approvalCode)}</Box> },
  ];
}

interface AppointmentTableProps {
  rows: Appointment[];
  timeZone: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onView: (row: Appointment) => void;
  onEdit: (row: Appointment) => void;
}

/** Desktop/tablet table with a sticky header and natural horizontal scrolling. */
export function AppointmentTable({ rows, timeZone, sortBy, sortOrder, onSort, onView, onEdit }: AppointmentTableProps) {
  const columns = buildColumns(timeZone);

  return (
    <DataTable
      ariaLabel="Appointments"
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      minWidth={desktopTableMinWidth}
      maxHeight="calc(100vh - 340px)"
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      onRowClick={onView}
      getRowOpacity={(row) => (row.archivedAt ? 0.65 : 1)}
      renderActions={(row) => (
        <Stack direction="row" spacing={0.25} sx={{ justifyContent: "flex-end" }}>
          <Tooltip title="View details">
            <IconButton size="small" aria-label={`View record ${row.recordNumber}`} onClick={() => onView(row)}>
              <VisibilityRounded fontSize="small" />
            </IconButton>
          </Tooltip>
          {!row.archivedAt && (
            <Tooltip title="Edit">
              <IconButton size="small" aria-label={`Edit record ${row.recordNumber}`} onClick={() => onEdit(row)}>
                <EditRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      )}
    />
  );
}
