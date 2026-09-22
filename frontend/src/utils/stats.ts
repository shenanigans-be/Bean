import type { Entry, EntryType } from "../types";
import { dayKeyOf, formatDateTime } from "./datetime";

const DAYS_PER_WEEK = 7;

function dayKeyDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dayKeyOf(formatDateTime(d));
}

/** The set of "yyyy-mm-dd" keys for a 7-day window starting `offsetDays` ago. */
function weekDayKeys(offsetDays: number): Set<string> {
  const keys = new Set<string>();
  for (let i = 0; i < DAYS_PER_WEEK; i++) keys.add(dayKeyDaysAgo(offsetDays + i));
  return keys;
}

function splitByWeek(entries: Entry[], type: EntryType): { thisWeek: Entry[]; lastWeek: Entry[] } {
  const thisWeekKeys = weekDayKeys(0);
  const lastWeekKeys = weekDayKeys(DAYS_PER_WEEK);
  const thisWeek: Entry[] = [];
  const lastWeek: Entry[] = [];
  for (const entry of entries) {
    if (entry.type !== type) continue;
    const key = dayKeyOf(entry.occurredAt);
    if (thisWeekKeys.has(key)) thisWeek.push(entry);
    else if (lastWeekKeys.has(key)) lastWeek.push(entry);
  }
  return { thisWeek, lastWeek };
}

function numberField(entry: Entry, field: string): number {
  const value = entry.data[field];
  return typeof value === "number" ? value : 0;
}

export interface DiaperInsight {
  kind: "diaper";
  wetThisWeek: number;
  dirtyThisWeek: number;
  wetLastWeek: number;
  dirtyLastWeek: number;
}

export interface AmountInsight {
  kind: "amount";
  unit: string;
  amountLabel: string;
  countLabel: string;
  countThisWeek: number;
  totalThisWeek: number;
  countLastWeek: number;
  totalLastWeek: number;
}

export interface CountInsight {
  kind: "count";
  countLabel: string;
  countThisWeek: number;
  countLastWeek: number;
}

export type CategoryInsight = DiaperInsight | AmountInsight | CountInsight;

const AMOUNT_CONFIG: Partial<
  Record<EntryType, { field: string; unit: string; amountLabel: string; countLabel: string }>
> = {
  bottle: { field: "volume", unit: "ml", amountLabel: "Volume", countLabel: "Feeds" },
  pump: { field: "volume", unit: "ml", amountLabel: "Volume", countLabel: "Pumps" },
  breast: { field: "duration", unit: "min", amountLabel: "Duration", countLabel: "Feeds" },
  sleep: { field: "duration", unit: "min", amountLabel: "Duration", countLabel: "Sleeps" },
};

const COUNT_LABEL: Partial<Record<EntryType, string>> = {
  solids: "Meals",
  meds: "Doses",
  misc: "Entries",
};

export function getCategoryInsight(entries: Entry[], type: EntryType): CategoryInsight {
  const { thisWeek, lastWeek } = splitByWeek(entries, type);

  if (type === "diaper") {
    const count = (list: Entry[], kind: string) =>
      list.filter((e) => {
        const k = String(e.data.kind ?? "");
        return k === kind || k === "both";
      }).length;
    return {
      kind: "diaper",
      wetThisWeek: count(thisWeek, "wet"),
      dirtyThisWeek: count(thisWeek, "dirty"),
      wetLastWeek: count(lastWeek, "wet"),
      dirtyLastWeek: count(lastWeek, "dirty"),
    };
  }

  const amountConfig = AMOUNT_CONFIG[type];
  if (amountConfig) {
    return {
      kind: "amount",
      unit: amountConfig.unit,
      amountLabel: amountConfig.amountLabel,
      countLabel: amountConfig.countLabel,
      countThisWeek: thisWeek.length,
      totalThisWeek: thisWeek.reduce((sum, e) => sum + numberField(e, amountConfig.field), 0),
      countLastWeek: lastWeek.length,
      totalLastWeek: lastWeek.reduce((sum, e) => sum + numberField(e, amountConfig.field), 0),
    };
  }

  return {
    kind: "count",
    countLabel: COUNT_LABEL[type] ?? "Entries",
    countThisWeek: thisWeek.length,
    countLastWeek: lastWeek.length,
  };
}

/** Formats a weekly count as a per-day rate, or "1 every N days" when it's under one a day. */
export function formatRate(count: number): string {
  if (count === 0) return "none";
  const perDay = count / DAYS_PER_WEEK;
  if (perDay < 1) {
    const every = Math.round(DAYS_PER_WEEK / count);
    if (every > 1) return `1 every ${every} days`;
  }
  return `${Number.isInteger(perDay) ? perDay : perDay.toFixed(1)}/day`;
}

/** Formats a weekly total as a rounded per-day amount, e.g. "420ml/day". */
export function formatAmountPerDay(total: number, unit: string): string {
  return `${Math.round(total / DAYS_PER_WEEK)}${unit}/day`;
}
