export const ENTRY_TYPES = ["diaper", "bottle", "breast", "pump"] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

export interface EntryRow {
  id: number;
  type: EntryType;
  occurred_at: string;
  occurred_at_sort: string;
  created_by: string | null;
  created_at: string;
  data: string;
}

export interface Entry {
  id: number;
  type: EntryType;
  occurredAt: string;
  createdBy: string | null;
  createdAt: string;
  data: Record<string, unknown>;
}

export function toEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    type: row.type,
    occurredAt: row.occurred_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    data: JSON.parse(row.data),
  };
}

const OCCURRED_AT_RE = /^(\d{2})\/(\d{2})\/(\d{4}) - (\d{2}):(\d{2})$/;

export function isValidOccurredAt(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = OCCURRED_AT_RE.exec(value);
  if (!match) return false;
  const [, dd, mm, yyyy, hh, min] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const hour = Number(hh);
  const minute = Number(min);
  if (month < 1 || month > 12) return false;
  if (hour > 23 || minute > 59) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;
  return true;
}

/** Converts "dd/mm/yyyy - HH:MM" into a lexicographically (= chronologically) sortable "yyyy-mm-dd HH:MM" key. */
export function toSortKey(occurredAt: string): string {
  const match = OCCURRED_AT_RE.exec(occurredAt);
  if (!match) return occurredAt;
  const [, dd, mm, yyyy, hh, min] = match;
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}
