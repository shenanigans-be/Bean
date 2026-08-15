import {
  IconBabyBottle,
  IconBowlSpoon,
  IconDiaper,
  IconDots,
  IconDroplet,
  IconHeart,
  IconMoon,
  IconPill,
  type Icon,
} from "@tabler/icons-react";
import type { CSSProperties } from "react";
import type { EntryType } from "./types";

export const ENTRY_META: Record<EntryType, { icon: Icon; label: string }> = {
  diaper: { icon: IconDiaper, label: "Diaper" },
  bottle: { icon: IconBabyBottle, label: "Bottle" },
  breast: { icon: IconHeart, label: "Breast" },
  solids: { icon: IconBowlSpoon, label: "Solids" },
  pump: { icon: IconDroplet, label: "Pump" },
  sleep: { icon: IconMoon, label: "Sleep" },
  meds: { icon: IconPill, label: "Meds" },
  misc: { icon: IconDots, label: "Misc" },
};

/**
 * Points the generic --cat-* custom properties at a category's actual tokens, so
 * CSS can style any category-colored element with one rule instead of one per type.
 */
export function categoryVars(type: EntryType): CSSProperties {
  return {
    "--cat-bg": `var(--${type}-bg)`,
    "--cat-bg-strong": `var(--${type}-bg-strong)`,
    "--cat-accent": `var(--${type}-accent)`,
    "--cat-fill": `var(--${type}-fill)`,
    "--cat-on-accent": `var(--${type}-on-accent)`,
  } as CSSProperties;
}
