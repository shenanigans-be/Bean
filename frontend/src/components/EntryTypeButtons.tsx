import { categoryVars, ENTRY_META } from "../entryMeta";
import type { EntryType } from "../types";

interface EntryTypeButtonsProps {
  types: EntryType[];
  active: EntryType | null;
  onSelect: (type: EntryType) => void;
}

export function EntryTypeButtons({ types, active, onSelect }: EntryTypeButtonsProps) {
  return (
    <div className="entry-type-row">
      {types.map((type) => {
        const meta = ENTRY_META[type];
        const Icon = meta.icon;
        return (
          <button
            key={type}
            type="button"
            data-type={type}
            style={categoryVars(type)}
            className={type === active ? "entry-type-btn entry-type-btn-active" : "entry-type-btn"}
            onClick={() => onSelect(type)}
          >
            <Icon className="entry-type-icon" size={28} />
            <span className="entry-type-label">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}
