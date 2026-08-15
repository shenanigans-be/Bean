import { ENTRY_META } from "../entryMeta";
import { ENTRY_TYPES, type EntryType } from "../types";

interface EntryTypeButtonsProps {
  active: EntryType | null;
  onSelect: (type: EntryType) => void;
}

export function EntryTypeButtons({ active, onSelect }: EntryTypeButtonsProps) {
  return (
    <div className="entry-type-row">
      {ENTRY_TYPES.map((type) => {
        const meta = ENTRY_META[type];
        return (
          <button
            key={type}
            type="button"
            className={type === active ? "entry-type-btn entry-type-btn-active" : "entry-type-btn"}
            onClick={() => onSelect(type)}
          >
            <span className="entry-type-icon">{meta.icon}</span>
            <span className="entry-type-label">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}
