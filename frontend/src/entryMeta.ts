import { IconBabyBottle, IconDiaper, IconDroplet, IconHeart, type Icon } from "@tabler/icons-react";
import type { EntryType } from "./types";

export const ENTRY_META: Record<EntryType, { icon: Icon; label: string }> = {
  diaper: { icon: IconDiaper, label: "Diaper" },
  bottle: { icon: IconBabyBottle, label: "Bottle" },
  breast: { icon: IconHeart, label: "Breast" },
  pump: { icon: IconDroplet, label: "Pump" },
};
