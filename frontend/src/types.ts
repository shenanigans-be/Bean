export const ENTRY_TYPES = ["diaper", "bottle", "pump", "breast"] as const;
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

export type EntryData = DiaperData | BottleData | BreastData | PumpData;

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
}>;
