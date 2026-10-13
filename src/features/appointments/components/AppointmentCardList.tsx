import { CallRounded, EditRounded, GroupsRounded, ScheduleRounded } from "@mui/icons-material";
import { Box, ButtonBase, Divider, IconButton, Stack, Typography } from "@mui/material";
import { Fragment, type ReactNode } from "react";
import { formatClinicDateTime } from "../../../lib/clinicTime";
import { AppointmentStatusChip, ArchivedChip, PatientTypeChip } from "./appointmentBadges";
import type { Appointment } from "../types";

interface AppointmentCardListProps {
  rows: Appointment[];
  timeZone: string;
  onView: (row: Appointment) => void;
  onEdit: (row: Appointment) => void;
}

/** Phone layout: one tappable summary per appointment with the essential fields. */
export function AppointmentCardList({ rows, timeZone, onView, onEdit }: AppointmentCardListProps) {
  return (
    <Box component="ul" aria-label="Appointments" sx={{ listStyle: "none", m: 0, p: 0 }}>
      {rows.map((row, index) => (
        <Fragment key={row.id}>
          {index > 0 && <Divider component="li" aria-hidden />}
          <Box component="li" sx={{ position: "relative", opacity: row.archivedAt ? 0.65 : 1 }}>
            <ButtonBase
              onClick={() => onView(row)}
              aria-label={`Record ${row.recordNumber}, ${row.patientName}. View details`}
              sx={{ display: "block", width: "100%", textAlign: "left", px: 2, py: 1.75, pr: 7 }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 650, color: "primary.main", fontVariantNumeric: "tabular-nums" }}>
                  {row.clinicNumber}
                </Typography>
                <PatientTypeChip value={row.patientType} />
                <AppointmentStatusChip value={row.status} />
                {row.archivedAt && <ArchivedChip />}
              </Stack>
              <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>
                {row.patientName}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {row.procedure}
              </Typography>
              <Stack direction="row" spacing={2} useFlexGap sx={{ mt: 1, flexWrap: "wrap", color: "text.secondary" }}>
                <Meta icon={<ScheduleRounded sx={{ fontSize: 16 }} />} text={formatClinicDateTime(row.appointmentAt, timeZone)} strong />
                <Meta icon={<CallRounded sx={{ fontSize: 16 }} />} text={row.mobileNo} />
                <Meta icon={<GroupsRounded sx={{ fontSize: 16 }} />} text={row.team} />
              </Stack>
            </ButtonBase>
            {!row.archivedAt && (
              <IconButton
                aria-label={`Edit record ${row.recordNumber}`}
                onClick={() => onEdit(row)}
                sx={{ position: "absolute", top: 10, right: 8 }}
              >
                <EditRounded fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Fragment>
      ))}
    </Box>
  );
}

function Meta({ icon, text, strong }: { icon: ReactNode; text: string; strong?: boolean }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", minWidth: 0 }}>
      {icon}
      <Typography variant="caption" sx={{ color: strong ? "text.primary" : "text.secondary", fontWeight: strong ? 600 : 400, fontVariantNumeric: "tabular-nums" }}>
        {text}
      </Typography>
    </Stack>
  );
}
