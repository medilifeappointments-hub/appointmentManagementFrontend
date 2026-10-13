import { ArchiveRounded, CallRounded, EditRounded, GroupsRounded, HistoryRounded, ScheduleRounded, UnarchiveRounded } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState, type ReactNode } from "react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { DetailField } from "../../components/DetailField";
import { DialogHeader } from "../../components/DialogHeader";
import { useNotify } from "../../components/NotificationProvider";
import { ApiError, errorMessage } from "../../api/client";
import { formatClinicDateTime, timeZoneLabel } from "../../lib/clinicTime";
import { formatMoney } from "../../lib/money";
import { AppointmentStatusChip, ArchivedChip, PatientTypeChip } from "./appointmentBadges";
import { useSetArchived } from "./hooks/useAppointments";
import { FIELD_LABELS, PATIENT_TYPE_LABELS, PAYMENT_METHOD_LABELS } from "./fields";
import type { Appointment } from "./types";

interface AppointmentDetailsDialogProps {
  appointment: Appointment;
  timeZone: string;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: (appointment: Appointment) => void;
  onShowHistory: (appointment: Appointment) => void;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2.5, p: { xs: 2, sm: 2.5 } }}>
      <Typography variant="overline" color="text.secondary" component="h3" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        {children}
      </Grid>
    </Box>
  );
}

const cell = (label: string, value: ReactNode) => (
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <DetailField label={label} value={value} />
  </Grid>
);

function SummaryItem({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", color: "text.secondary" }}>
      {icon}
      <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
        {text}
      </Typography>
    </Stack>
  );
}

export function AppointmentDetailsDialog({ appointment, timeZone, isAdmin, onClose, onEdit, onShowHistory }: AppointmentDetailsDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const notify = useNotify();
  const setArchived = useSetArchived();
  const [record, setRecord] = useState(appointment);
  const [confirming, setConfirming] = useState(false);
  const archived = Boolean(record.archivedAt);

  const toggleArchive = () => {
    setArchived.mutate(
      { id: record.id, version: record.version, archive: !archived },
      {
        onSuccess: (updated) => {
          setRecord(updated);
          setConfirming(false);
          notify(`Record #${updated.recordNumber} ${updated.archivedAt ? "archived" : "restored"}.`);
        },
        onError: (error) => {
          setConfirming(false);
          if (error instanceof ApiError && error.code === "VERSION_CONFLICT") {
            setRecord((error.details as { current: Appointment }).current);
          }
        },
      },
    );
  };

  const archiveError =
    setArchived.error instanceof ApiError && setArchived.error.code === "VERSION_CONFLICT"
      ? "This record was changed by someone else. The latest version is now shown; review it and try again."
      : setArchived.error
        ? errorMessage(setArchived.error)
        : null;

  return (
    <>
      <Dialog open onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="md" scroll="paper" aria-labelledby="details-title">
        <DialogHeader
          id="details-title"
          title={`Appointment ${record.clinicNumber}`}
          adornment={
            <>
              <PatientTypeChip value={record.patientType} />
              <AppointmentStatusChip value={record.status} />
              {archived && <ArchivedChip />}
            </>
          }
          subtitle={`All dates and times shown in ${timeZoneLabel(timeZone)}`}
          onClose={onClose}
        />
        <DialogContent>
          <Stack spacing={3}>
            {archiveError && <Alert severity="error">{archiveError}</Alert>}

            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2.5,
                bgcolor: "action.selected",
                border: 1,
                borderColor: "primary.light",
              }}
            >
              <Typography variant="h2" component="p">
                {record.patientName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {record.procedure}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1, sm: 3 }} sx={{ mt: 1.5 }}>
                <SummaryItem icon={<ScheduleRounded fontSize="small" />} text={formatClinicDateTime(record.appointmentAt, timeZone)} />
                <SummaryItem icon={<CallRounded fontSize="small" />} text={record.mobileNo} />
                <SummaryItem icon={<GroupsRounded fontSize="small" />} text={record.team} />
              </Stack>
            </Box>

            <Section title="Patient details">
              {cell(FIELD_LABELS.clinicNumber, record.clinicNumber)}
              {cell(FIELD_LABELS.patientName, record.patientName)}
              {cell(FIELD_LABELS.mobileNo, record.mobileNo)}
              {cell(FIELD_LABELS.patientType, PATIENT_TYPE_LABELS[record.patientType])}
              {cell(FIELD_LABELS.location, record.location)}
            </Section>
            <Section title="Appointment details">
              {cell(FIELD_LABELS.appointmentAt, formatClinicDateTime(record.appointmentAt, timeZone))}
              {cell(FIELD_LABELS.team, record.team)}
              {cell(FIELD_LABELS.procedure, record.procedure)}
              {cell(FIELD_LABELS.cs, record.cs)}
              {cell(FIELD_LABELS.status, <AppointmentStatusChip value={record.status} />)}
              {cell(FIELD_LABELS.resultIssued, record.resultIssued)}
            </Section>
            <Section title="Financial / other details">
              {cell(FIELD_LABELS.amount, record.amount === null ? null : formatMoney(record.amount))}
              {cell(FIELD_LABELS.cost, record.cost === null ? null : formatMoney(record.cost))}
              {cell(FIELD_LABELS.paymentMethod, record.paymentMethod ? PAYMENT_METHOD_LABELS[record.paymentMethod] : null)}
              {cell(FIELD_LABELS.cashAmount, record.cashAmount === null ? null : formatMoney(record.cashAmount))}
              {cell(FIELD_LABELS.cardAmount, record.cardAmount === null ? null : formatMoney(record.cardAmount))}
              {cell(FIELD_LABELS.approvalCode, record.approvalCode)}
            </Section>

            <Box sx={{ pt: 2, borderTop: 1, borderColor: "divider" }}>
              <Grid container spacing={2}>
                {cell("Created by", `${record.createdBy.name} · ${formatClinicDateTime(record.createdAt, timeZone)}`)}
                {cell("Last updated by", `${record.updatedBy.name} · ${formatClinicDateTime(record.updatedAt, timeZone)}`)}
                {archived
                  ? cell("Archived by", `${record.archivedBy?.name ?? "—"} · ${formatClinicDateTime(record.archivedAt, timeZone)}`)
                  : cell("Version", record.version)}
              </Grid>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexWrap: "wrap", borderTop: 1, borderColor: "divider" }}>
          {isAdmin && (
            <>
              <Button startIcon={<HistoryRounded />} onClick={() => onShowHistory(record)}>
                History
              </Button>
              <Button
                color={archived ? "primary" : "warning"}
                startIcon={archived ? <UnarchiveRounded /> : <ArchiveRounded />}
                onClick={() => setConfirming(true)}
              >
                {archived ? "Restore" : "Archive"}
              </Button>
            </>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
          {!archived && (
            <Button variant="contained" startIcon={<EditRounded />} onClick={() => onEdit(record)}>
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirming}
        title={archived ? "Restore this record?" : "Archive this record?"}
        message={
          archived
            ? "The record will be visible to all staff again and included in reports."
            : "Archived records are hidden from receptionists and excluded from reports. Nothing is deleted, and you can restore it later."
        }
        confirmLabel={archived ? "Restore" : "Archive"}
        destructive={!archived}
        busy={setArchived.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={toggleArchive}
      />
    </>
  );
}
