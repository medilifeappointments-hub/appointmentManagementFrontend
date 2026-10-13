import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppointmentFilters } from "../types";
import { appointmentsService } from "../services/appointmentsService";

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
    queryFn: ({ signal }) => appointmentsService.list(filters, signal),
    placeholderData: keepPreviousData,
    refetchInterval: LIST_REFRESH_MS,
    refetchOnWindowFocus: true,
  });
}

export function useFilterOptions() {
  return useQuery({
    queryKey: appointmentKeys.filterOptions(),
    queryFn: appointmentsService.filterOptions,
    staleTime: 5 * 60_000,
  });
}

export function useClinicNumbers() {
  return useQuery({
    queryKey: appointmentKeys.clinicNumbers(),
    queryFn: appointmentsService.clinicNumbers,
  });
}

export function useAddClinicNumber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appointmentsService.addClinicNumber,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: appointmentKeys.clinicNumbers() }),
  });
}

export function useAppointmentHistory(id: string | null) {
  return useQuery({
    queryKey: appointmentKeys.history(id ?? ""),
    queryFn: () => appointmentsService.history(id!),
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
    mutationFn: appointmentsService.create,
    onSuccess: () => void invalidate(),
  });
}

export function useUpdateAppointment() {
  const invalidate = useInvalidateAppointments();
  return useMutation({
    mutationFn: appointmentsService.update,
    onSuccess: () => void invalidate(),
  });
}

export function useSetArchived() {
  const invalidate = useInvalidateAppointments();
  return useMutation({
    mutationFn: appointmentsService.setArchived,
    onSuccess: () => void invalidate(),
  });
}
