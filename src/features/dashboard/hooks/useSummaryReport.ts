import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { DateRange } from "../../../components/DateRangeFields";
import { reportsService } from "../services/reportsService";

export const reportKeys = {
  all: ["reports"] as const,
  summary: (range: DateRange) => [...reportKeys.all, "summary", range] as const,
};

export function useSummaryReport(range: DateRange) {
  const valid = Boolean(range.from && range.to && range.from <= range.to);
  return useQuery({
    queryKey: reportKeys.summary(range),
    queryFn: () => reportsService.summary(range),
    enabled: valid,
    placeholderData: keepPreviousData,
  });
}
