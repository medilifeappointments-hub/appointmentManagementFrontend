import { EditRounded, VisibilityRounded } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { formatClinicDate, formatClinicTime } from "../../lib/clinicTime";
import { formatMoney } from "../../lib/money";
import { AppointmentStatusChip, ArchivedChip, PatientTypeChip, PaymentMethodChip } from "./appointmentBadges";
import { FIELD_LABELS } from "./fields";
import type { Appointment, SortField, SortOrder } from "./types";

interface Column {
  id: string;
  label: string;
  render: (row: Appointment) => ReactNode;
  sortField?: SortField;
  align?: "left" | "right";
  minWidth?: number;
}

const muted = (value: string | null) =>
  value ?? (
    <Box component="span" sx={{ color: "text.disabled" }}>
      —
    </Box>
  );

const money = (value: string | null) => (value === null ? muted(null) : formatMoney(value));

const numeric = { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } as const;

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
      sortField: "patientName",
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
      sortField: "appointmentAt",
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
    <TableContainer sx={{ width: "100%", maxWidth: "100%", maxHeight: "calc(100vh - 340px)", overflowX: "auto" }}>
      <Table stickyHeader size="small" aria-label="Appointments" sx={{ width: "max-content" }}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                sx={{ minWidth: column.minWidth }}
                sortDirection={column.sortField && sortBy === column.sortField ? sortOrder : false}
              >
                {column.sortField ? (
                  <TableSortLabel
                    active={sortBy === column.sortField}
                    direction={sortBy === column.sortField ? sortOrder : "desc"}
                    onClick={() => onSort(column.sortField!)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
            <TableCell
              align="right"
              sx={{ width: 88, minWidth: 88, maxWidth: 88 }}
            >
              <Box component="span" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                Actions
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover onClick={() => onView(row)} sx={{ cursor: "pointer", opacity: row.archivedAt ? 0.65 : 1 }}>
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align} sx={{ whiteSpace: "nowrap" }}>
                  {column.render(row)}
                </TableCell>
              ))}
              <TableCell
                align="right"
                onClick={(event) => event.stopPropagation()}
                sx={{
                  width: 88,
                  minWidth: 88,
                  maxWidth: 88,
                  py: 0.5,
                }}
              >
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
