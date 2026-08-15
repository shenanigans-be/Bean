const OCCURRED_AT_RE = /^(\d{2})\/(\d{2})\/(\d{4}) - (\d{2}):(\d{2})$/;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Formats a Date as "dd/mm/yyyy - HH:MM" using local time components. */
export function formatDateTime(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} - ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function formatNow(): string {
  return formatDateTime(new Date());
}

/** Validates the "dd/mm/yyyy - HH:MM" format and that the date is real (rejects e.g. 31/02). */
export function isValidDateTime(value: string): boolean {
  const match = OCCURRED_AT_RE.exec(value);
  if (!match) return false;
  const [, dd, mm, yyyy, hh, min] = match;
  const day = Number(dd);
  const month = Number(mm);
  const hour = Number(hh);
  const minute = Number(min);
  if (month < 1 || month > 12) return false;
  if (hour > 23 || minute > 59) return false;
  const daysInMonth = new Date(Number(yyyy), month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;
  return true;
}

/** Extracts a sortable/groupable "yyyy-mm-dd" key straight from the stored string, no Date parsing. */
export function dayKeyOf(occurredAt: string): string {
  const match = OCCURRED_AT_RE.exec(occurredAt);
  if (!match) return "unknown";
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

/** Extracts just the "HH:MM" portion for display in the log. */
export function timeOf(occurredAt: string): string {
  const match = OCCURRED_AT_RE.exec(occurredAt);
  if (!match) return occurredAt;
  const [, , , , hh, min] = match;
  return `${hh}:${min}`;
}

export function formatDayHeading(dayKey: string): string {
  const todayKey = dayKeyOf(formatNow());
  const yesterdayKey = dayKeyOf(formatDateTime(new Date(Date.now() - 86400000)));
  if (dayKey === todayKey) return "Today";
  if (dayKey === yesterdayKey) return "Yesterday";
  const [yyyy, mm, dd] = dayKey.split("-");
  return `${dd}/${mm}/${yyyy}`;
}
