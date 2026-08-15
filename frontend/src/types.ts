export const ENTRY_TYPES = [
  "diaper",
  "bottle",
  "breast",
  "solids",
  "pump",
  "sleep",
  "meds",
  "misc",
] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

export type DiaperKind = "wet" | "dirty" | "both";
export type Side = "left" | "right" | "both";
export type BottleSource = "formula" | "pumped";

export interface DiaperData {
  kind: DiaperKind;
}

export interface BottleData {
  source: BottleSource;
  volume: number | null;
  notes: string;
}

export interface BreastData {
  duration: number | null;
  side: Side;
  notes: string;
}

export interface PumpData {
  side: Side;
  volume: number | null;
}

export interface SolidsData {
  contents: string;
  weight: number | null;
}

export interface SleepData {
  duration: number | null;
}

export interface MedsData {
  name: string;
  amount: string;
}

export interface MiscData {
  notes: string;
}

export type EntryData =
  | DiaperData
  | BottleData
  | BreastData
  | PumpData
  | SolidsData
  | SleepData
  | MedsData
  | MiscData;

export interface Entry {
  id: number;
  type: EntryType;
  occurredAt: string;
  createdBy: string | null;
  createdAt: string;
  data: Record<string, unknown>;
}

export interface NewEntry {
  type: EntryType;
  occurredAt: string;
  createdBy: string | null;
  data: Record<string, unknown>;
}

export type Defaults = Partial<{
  diaper: Partial<DiaperData>;
  bottle: Partial<BottleData>;
  breast: Partial<BreastData>;
  pump: Partial<PumpData>;
  solids: Partial<SolidsData>;
  sleep: Partial<SleepData>;
  meds: Partial<MedsData>;
  misc: Partial<MiscData>;
}>;

export type EnabledCategories = Partial<Record<EntryType, boolean>>;

export interface AppSettings {
  defaults: Defaults;
  enabledCategories: EnabledCategories;
}

export function isCategoryEnabled(enabled: EnabledCategories, type: EntryType): boolean {
  return enabled[type] !== false;
}
