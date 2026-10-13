/**
 * Display helpers that always use the clinic's IANA timezone (from the server),
 * never the timezone of the laptop running the browser.
 */

function parts(instant: Date, timeZone: string) {
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) => formatted.find((part) => part.type === type)?.value ?? "";
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute") };
}

/** "YYYY-MM-DD" for the clinic's current calendar day. */
export function clinicToday(timeZone: string, now: Date = new Date()): string {
  const p = parts(now, timeZone);
  return `${p.year}-${p.month}-${p.day}`;
}

/** Current clinic-local minute in the value format required by datetime-local inputs. */
export function clinicNowLocal(timeZone: string, now: Date = new Date()): string {
  const p = parts(now, timeZone);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** First and last calendar dates for the month containing a YYYY-MM-DD value. */
export function clinicMonthRange(today: string): { from: string; to: string } {
  const [year, month] = today.split("-").map(Number) as [number, number];
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const finalDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { from: `${prefix}-01`, to: `${prefix}-${String(finalDay).padStart(2, "0")}` };
}

const dateFormatters = new Map<string, Intl.DateTimeFormat>();
function dateFormatter(timeZone: string) {
  let formatter = dateFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    dateFormatters.set(timeZone, formatter);
  }
  return formatter;
}

const timeFormatters = new Map<string, Intl.DateTimeFormat>();
function timeFormatter(timeZone: string) {
  let formatter = timeFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    timeFormatters.set(timeZone, formatter);
  }
  return formatter;
}

/** e.g. "13 Oct 2026" in the clinic timezone. */
export function formatClinicDate(iso: string | null | undefined, timeZone: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter(timeZone).format(date);
}

/** e.g. "01:00 AM" in the clinic timezone. */
export function formatClinicTime(iso: string | null | undefined, timeZone: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : timeFormatter(timeZone).format(date);
}

/** e.g. "13 Oct 2026, 01:00 AM" in the clinic timezone. */
export function formatClinicDateTime(iso: string | null | undefined, timeZone: string): string {
  const date = formatClinicDate(iso, timeZone);
  if (date === "—") return date;
  return `${date}, ${formatClinicTime(iso, timeZone)}`;
}

/** "2026-10-13" → "13 Oct 2026" (calendar date, no timezone conversion). */
export function formatLocalDate(localDate: string): string {
  const [y, m, d] = localDate.split("-").map(Number) as [number, number, number];
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

/** Short label for a timezone, e.g. "Asia/Dubai (GMT+4)". */
export function timeZoneLabel(timeZone: string): string {
  const offset = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" })
    .formatToParts(new Date())
    .find((part) => part.type === "timeZoneName")?.value;
  return offset ? `${timeZone} (${offset})` : timeZone;
}
