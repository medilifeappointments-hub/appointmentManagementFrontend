import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { AppointmentFieldsPayload } from "./appointmentForm";
import type { Appointment, AppointmentFilters, AppointmentHistory, FilterOptions, PageMeta } from "./types";

/** How often the visible list refreshes so receptionists see each other's entries. */
export const LIST_REFRESH_MS = 30_000;

export const appointmentKeys = {
  all: ["appointments"] as const,
  list: (filters: AppointmentFilters) => [...appointmentKeys.all, "list", filters] as const,
  filterOptions: () => [...appointmentKeys.all, "filter-options"] as const,
  clinicNumbers: () => [...appointmentKeys.all, "clinic-numbers"] as const,
  history: (id: string) => [...appointmentKeys.all, "history", id] as const,
};

export function useAppointmentList(filters: AppointmentFilters) {
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: ({ signal }) =>
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
    placeholderData: keepPreviousData,
    refetchInterval: LIST_REFRESH_MS,
    refetchOnWindowFocus: true,
  });
}

export function useFilterOptions() {
  return useQuery({
    queryKey: appointmentKeys.filterOptions(),
    queryFn: () => api.get<FilterOptions>("/appointments/filter-options").then((result) => result.data),
    staleTime: 5 * 60_000,
  });
}

export function useClinicNumbers() {
  return useQuery({
    queryKey: appointmentKeys.clinicNumbers(),
    queryFn: () => api.get<string[]>("/clinic-numbers").then((result) => result.data),
  });
}

export function useAddClinicNumber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (number: string) => api.post<{ number: string }>("/clinic-numbers", { number }).then((result) => result.data),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: appointmentKeys.clinicNumbers() }),
  });
}

export function useAppointmentHistory(id: string | null) {
  return useQuery({
    queryKey: appointmentKeys.history(id ?? ""),
    queryFn: () => api.get<AppointmentHistory>(`/admin/appointments/${id}/history`).then((result) => result.data),
    enabled: Boolean(id),
  });
}

function useInvalidateAppointments() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
}

export function useCreateAppointment() {
  const invalidate = useInvalidateAppointments();
  return useMutation({
    mutationFn: (payload: AppointmentFieldsPayload & { submissionKey: string }) =>
      api.post<Appointment, { replayed: boolean }>("/appointments", payload),
    onSuccess: () => void invalidate(),
  });
}

export function useUpdateAppointment() {
  const invalidate = useInvalidateAppointments();
  return useMutation({
    mutationFn: ({ id, ...payload }: AppointmentFieldsPayload & { id: string; version: number }) =>
      api.put<Appointment>(`/appointments/${id}`, payload).then((result) => result.data),
    onSuccess: () => void invalidate(),
  });
}

export function useSetArchived() {
  const invalidate = useInvalidateAppointments();
  return useMutation({
    mutationFn: ({ id, version, archive }: { id: string; version: number; archive: boolean }) =>
      api
        .post<Appointment>(`/admin/appointments/${id}/${archive ? "archive" : "restore"}`, { version })
        .then((result) => result.data),
    onSuccess: () => void invalidate(),
  });
}
