import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { clinicMonthRange } from "../../lib/clinicTime";
import type { AppointmentFilters, ArchivedFilter, SortField, SortOrder } from "./types";

const SORT_FIELDS: SortField[] = ["appointmentAt", "recordNumber", "patientName", "createdAt", "updatedAt"];
const PAGE_SIZES = [25, 50, 100];

/**
 * Filters live in the URL so a refresh, the back button or a shared link keeps them.
 * A missing date param means the current clinic calendar month; an empty one means "no limit".
 */
export function useAppointmentFilters(today: string, isAdmin: boolean) {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<AppointmentFilters>(() => {
    const month = clinicMonthRange(today);
    const archived = params.get("archived") as ArchivedFilter | null;
    const sortBy = params.get("sortBy") as SortField | null;
    const pageSize = Number(params.get("pageSize"));
    return {
      from: params.get("from") ?? month.from,
      to: params.get("to") ?? month.to,
      q: params.get("q") ?? "",
      team: params.get("team") ?? "",
      location: params.get("location") ?? "",
      status: params.get("status") ?? "",
      archived: isAdmin && (archived === "archived" || archived === "all") ? archived : "active",
      page: Math.max(1, Number(params.get("page")) || 1),
      pageSize: PAGE_SIZES.includes(pageSize) ? pageSize : 25,
      sortBy: sortBy && SORT_FIELDS.includes(sortBy) ? sortBy : "appointmentAt",
      sortOrder: (params.get("sortOrder") as SortOrder | null) === "asc" ? "asc" : "desc",
    };
  }, [params, today, isAdmin]);

  /** Applies changes; any change other than paging returns to page 1. */
  const update = useCallback(
    (changes: Partial<AppointmentFilters>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(changes)) next.set(key, String(value));
          if (!("page" in changes)) next.delete("page");
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams]);

  return { filters, update, reset, pageSizes: PAGE_SIZES };
}
