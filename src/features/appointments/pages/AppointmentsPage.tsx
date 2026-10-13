import { AddRounded, RefreshRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Fab,
  IconButton,
  LinearProgress,
  Skeleton,
  Stack,
  TablePagination,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { EmptyState } from "../../../components/EmptyState";
import { ErrorAlert } from "../../../components/ErrorAlert";
import { PageHeader } from "../../../components/PageHeader";
import { clinicToday, formatLocalDate, timeZoneLabel } from "../../../lib/clinicTime";
import { useSession } from "../../auth/useSession";
import { AppointmentCardList } from "../components/AppointmentCardList";
import { AppointmentDetailsDialog } from "../components/AppointmentDetailsDialog";
import { AppointmentFilters } from "../components/AppointmentFilters";
import { AppointmentFormDialog } from "../components/AppointmentFormDialog";
import { AppointmentHistoryDialog } from "../components/AppointmentHistoryDialog";
import { AppointmentTable } from "../components/AppointmentTable";
import { useAppointmentList } from "../hooks/useAppointments";
import type { Appointment, AppointmentFilters as Filters, SortField } from "../types";
import { useAppointmentFilters } from "../useAppointmentFilters";

/** Which overlay is open. Records are snapshots taken on click, so list refreshes never alter them. */
type Overlay =
  | { kind: "create" }
  | { kind: "edit"; appointment: Appointment }
  | { kind: "details"; appointment: Appointment }
  | { kind: "history"; appointment: Appointment };

function describeRange(filters: Filters, today: string): string {
  if (!filters.from && !filters.to) return "All dates";
  if (filters.from === today && filters.to === today) return `Today, ${formatLocalDate(today)}`;
  if (filters.from === filters.to) return formatLocalDate(filters.from);
  return `${filters.from ? formatLocalDate(filters.from) : "Any date"} – ${filters.to ? formatLocalDate(filters.to) : "any date"}`;
}

function LoadingRows() {
  return (
    <Stack spacing={1.5} sx={{ p: 2 }} aria-hidden>
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} variant="rounded" height={36} />
      ))}
    </Stack>
  );
}

export function AppointmentsPage() {
  const theme = useTheme();
  // The appointment table has many business columns. Use the compact card
  // presentation on phones and tablets, including widths constrained by the
  // desktop sidebar, and reserve the full table for wide screens.
  const compactView = useMediaQuery(theme.breakpoints.down("lg"));
  const { clinic, isAdmin } = useSession();
  const timeZone = clinic.timezone;
  const today = clinicToday(timeZone);
  const { filters, update, reset, pageSizes } = useAppointmentFilters(today, isAdmin);
  const list = useAppointmentList(filters);
  const [overlay, setOverlay] = useState<Overlay | null>(null);

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta;
  const hasFilters = Boolean(filters.q || filters.team || filters.location || filters.status);
  const openCreate = () => setOverlay({ kind: "create" });
  const view = (appointment: Appointment) => setOverlay({ kind: "details", appointment });
  const edit = (appointment: Appointment) => setOverlay({ kind: "edit", appointment });

  const handleSort = (field: SortField) => {
    const sameField = filters.sortBy === field;
    update({ sortBy: field, sortOrder: sameField && filters.sortOrder === "desc" ? "asc" : "desc" });
  };

  const renderResults = () => {
    if (list.isPending) return <LoadingRows />;
    if (rows.length === 0) {
      return (
        <EmptyState
          title="No appointments found"
          description={
            hasFilters
              ? "No records match these filters. Try a different search or clear the filters."
              : "Nothing is recorded for this date range yet."
          }
          action={
            hasFilters ? (
              <Button onClick={reset}>Clear filters</Button>
            ) : (
              <Button variant="outlined" startIcon={<AddRounded />} onClick={openCreate}>
                Add appointment
              </Button>
            )
          }
        />
      );
    }
    return compactView ? (
      <AppointmentCardList rows={rows} timeZone={timeZone} onView={view} onEdit={edit} />
    ) : (
      <AppointmentTable
        rows={rows}
        timeZone={timeZone}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSort={handleSort}
        onView={view}
        onEdit={edit}
      />
    );
  };

  return (
    <>
      <PageHeader
        title="Appointments"
        description={`Shared front-desk records · times in ${timeZoneLabel(timeZone)}`}
        actions={
          <Button variant="contained" startIcon={<AddRounded />} onClick={openCreate} sx={{ display: { xs: "none", md: "inline-flex" } }}>
            Add appointment
          </Button>
        }
      />

      <Card sx={{ p: { xs: 2, sm: 2.5 }, mb: 2.5 }}>
        <AppointmentFilters filters={filters} onChange={update} onReset={reset} today={today} isAdmin={isAdmin} />
      </Card>

      <Card sx={{ overflow: "hidden" }}>
        <Stack direction="row" spacing={1} sx={{ px: { xs: 2, sm: 2.5 }, py: 1.5, alignItems: "center", justifyContent: "space-between" }}>
          <Box aria-live="polite">
            <Typography variant="h3" component="h2">
              {describeRange(filters, today)}
            </Typography>
            <Typography variant="caption" component="div">
              {meta ? `${meta.total} ${meta.total === 1 ? "record" : "records"}` : "Loading…"}
              {list.dataUpdatedAt > 0 &&
                ` · updated ${new Date(list.dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
            </Typography>
          </Box>
          <Tooltip title="Refresh now (also refreshes automatically every 30 seconds)">
            <span>
              <IconButton aria-label="Refresh list" onClick={() => void list.refetch()} disabled={list.isFetching}>
                <RefreshRounded fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
        <Box sx={{ height: 2, borderTop: 1, borderColor: "divider" }}>
          {list.isFetching && !list.isPending && <LinearProgress aria-label="Refreshing appointments" />}
        </Box>

        {list.error && (
          <Box sx={{ p: 2 }}>
            <ErrorAlert
              error={list.error}
              title={list.data ? "Refresh failed — showing the last loaded data" : "Could not load appointments"}
              onRetry={() => void list.refetch()}
            />
          </Box>
        )}
        {!(list.error && !list.data) && renderResults()}

        {meta && meta.total > 0 && (
          <TablePagination
            component="div"
            count={meta.total}
            page={Math.max(0, meta.page - 1)}
            rowsPerPage={filters.pageSize}
            rowsPerPageOptions={compactView ? [] : pageSizes}
            labelRowsPerPage="Rows"
            onPageChange={(_event, page) => update({ page: page + 1 })}
            onRowsPerPageChange={(event) => update({ pageSize: Number(event.target.value) })}
          />
        )}
      </Card>

      <Fab
        color="primary"
        aria-label="Add appointment"
        onClick={openCreate}
        sx={{ display: { md: "none" }, position: "fixed", right: 20, bottom: 20, zIndex: (t) => t.zIndex.speedDial }}
      >
        <AddRounded />
      </Fab>

      {(overlay?.kind === "create" || overlay?.kind === "edit") && (
        <AppointmentFormDialog
          key={overlay.kind === "edit" ? overlay.appointment.id : "create"}
          appointment={overlay.kind === "edit" ? overlay.appointment : undefined}
          timeZone={timeZone}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay?.kind === "details" && (
        <AppointmentDetailsDialog
          appointment={overlay.appointment}
          timeZone={timeZone}
          isAdmin={isAdmin}
          onClose={() => setOverlay(null)}
          onEdit={edit}
          onShowHistory={(appointment) => setOverlay({ kind: "history", appointment })}
        />
      )}
      {overlay?.kind === "history" && (
        <AppointmentHistoryDialog
          appointmentId={overlay.appointment.id}
          recordNumber={overlay.appointment.recordNumber}
          timeZone={timeZone}
          onClose={() => setOverlay({ kind: "details", appointment: overlay.appointment })}
        />
      )}
    </>
  );
}
