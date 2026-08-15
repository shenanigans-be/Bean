import type { EntryType } from "./types";

export const ENTRY_META: Record<EntryType, { icon: string; label: string }> = {
  diaper: { icon: "🧷", label: "Diaper" },
  bottle: { icon: "🍼", label: "Bottle" },
  pump: { icon: "🥛", label: "Pump" },
  breast: { icon: "🤱", label: "Breast" },
};
