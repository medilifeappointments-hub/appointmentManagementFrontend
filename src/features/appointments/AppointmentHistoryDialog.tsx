import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
  type ChipProps,
} from "@mui/material";
import { DialogHeader } from "../../components/DialogHeader";
import { EmptyState } from "../../components/EmptyState";
import { ErrorAlert } from "../../components/ErrorAlert";
import { formatClinicDateTime } from "../../lib/clinicTime";
import { useAppointmentHistory } from "./hooks/useAppointments";
import { fieldLabel, formatAuditValue } from "./fields";
import type { AuditAction, AuditEvent } from "./types";

const ACTION_DISPLAY: Record<AuditAction, { label: string; color: ChipProps["color"] }> = {
  CREATE: { label: "Created", color: "success" },
  UPDATE: { label: "Updated", color: "primary" },
  ARCHIVE: { label: "Archived", color: "warning" },
  RESTORE: { label: "Restored", color: "info" },
};

interface AppointmentHistoryDialogProps {
  appointmentId: string;
  recordNumber: number;
  timeZone: string;
  onClose: () => void;
}

function ChangesTable({ event, timeZone }: { event: AuditEvent; timeZone: string }) {
  const entries = Object.entries(event.changes);
  if (entries.length === 0) {
    return event.action === "UPDATE" ? (
      <Typography variant="body2" color="text.secondary">
        Saved without changing any field.
      </Typography>
    ) : null;
  }
  const showFrom = event.action !== "CREATE";
  return (
    <Table size="small" aria-label="Changed fields" sx={{ "& td, & th": { px: 1 } }}>
      <TableHead>
        <TableRow>
          <TableCell>Field</TableCell>
          {showFrom && <TableCell>Before</TableCell>}
          <TableCell>{showFrom ? "After" : "Value"}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {entries.map(([field, change]) => (
          <TableRow key={field}>
            <TableCell sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>{fieldLabel(field)}</TableCell>
            {showFrom && (
              <TableCell sx={{ color: "text.secondary", overflowWrap: "anywhere" }}>
                {formatAuditValue(field, change?.from, timeZone)}
              </TableCell>
            )}
            <TableCell sx={{ overflowWrap: "anywhere" }}>{formatAuditValue(field, change?.to, timeZone)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** Super-admin view of who created or changed a record, when, and what changed. */
export function AppointmentHistoryDialog({ appointmentId, recordNumber, timeZone, onClose }: AppointmentHistoryDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const history = useAppointmentHistory(appointmentId);
  const events = history.data ? [...history.data.events].reverse() : [];

  return (
    <Dialog open onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="md" scroll="paper" aria-labelledby="history-title">
      <DialogHeader id="history-title" title={`History · Record #${recordNumber}`} subtitle="Newest changes first" onClose={onClose} />
      <DialogContent>
        {history.isPending ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 6 }} role="status" aria-label="Loading history">
            <CircularProgress size={28} />
          </Box>
        ) : history.error ? (
          <ErrorAlert error={history.error} onRetry={() => void history.refetch()} />
        ) : events.length === 0 ? (
          <EmptyState title="No history recorded" />
        ) : (
          <Stack component="ol" spacing={2.5} sx={{ listStyle: "none", p: 0, m: 0 }}>
            {events.map((event) => {
              const display = ACTION_DISPLAY[event.action];
              return (
                <Box component="li" key={event.id} sx={{ border: 1, borderColor: "divider", borderRadius: 2.5, p: 2 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", mb: 1 }}>
                    <Chip size="small" label={display.label} color={display.color} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {event.actor.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatClinicDateTime(event.createdAt, timeZone)} · version {event.version}
                    </Typography>
                  </Stack>
                  <ChangesTable event={event} timeZone={timeZone} />
                </Box>
              );
            })}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ borderTop: 1, borderColor: "divider" }}>
        <Button variant="outlined" onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
