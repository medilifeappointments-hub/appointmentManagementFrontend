import { api } from "../../../api/client";
import type { AppointmentFieldsPayload } from "../appointmentForm";
import type { Appointment, AppointmentFilters, AppointmentHistory, FilterOptions, PageMeta } from "../types";

export const appointmentsService = {
  list: (filters: AppointmentFilters, signal?: AbortSignal) =>
    api.get<Appointment[], PageMeta>(
      "/appointments",
      {
        from: filters.from,
        to: filters.to,
        q: filters.q.trim(),
        team: filters.team.trim(),
        location: filters.location.trim(),
        status: filters.status.trim(),
        archived: filters.archived === "active" ? undefined : filters.archived,
        page: filters.page,
        pageSize: filters.pageSize,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      },
      signal,
    ),
  filterOptions: () => api.get<FilterOptions>("/appointments/filter-options").then((result) => result.data),
  clinicNumbers: () => api.get<string[]>("/clinic-numbers").then((result) => result.data),
  addClinicNumber: (number: string) => api.post<{ number: string }>("/clinic-numbers", { number }).then((result) => result.data),
  history: (id: string) => api.get<AppointmentHistory>(`/admin/appointments/${id}/history`).then((result) => result.data),
  create: (payload: AppointmentFieldsPayload & { submissionKey: string }) =>
    api.post<Appointment, { replayed: boolean }>("/appointments", payload),
  update: ({ id, ...payload }: AppointmentFieldsPayload & { id: string; version: number }) =>
    api.put<Appointment>(`/appointments/${id}`, payload).then((result) => result.data),
  setArchived: ({ id, version, archive }: { id: string; version: number; archive: boolean }) =>
    api.post<Appointment>(`/admin/appointments/${id}/${archive ? "archive" : "restore"}`, { version }).then((result) => result.data),
};
