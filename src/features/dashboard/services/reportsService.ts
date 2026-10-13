import { api } from "../../../api/client";
import type { DateRange } from "../../../components/DateRangeFields";
import type { SummaryReport } from "../types";

export const reportsService = {
  summary: (range: DateRange) =>
    api.get<SummaryReport>("/admin/reports/summary", { from: range.from, to: range.to }).then((result) => result.data),
};
