import { ENTRY_META } from "../entryMeta";
import type { Entry } from "../types";
import { dayKeyOf, formatDayHeading, timeOf } from "../utils/datetime";
import { summarizeEntry } from "../utils/entrySummary";

interface LogProps {
  entries: Entry[];
  onSelect: (entry: Entry) => void;
}

interface DayGroup {
  dayKey: string;
  entries: Entry[];
}

function groupByDay(entries: Entry[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const entry of entries) {
    const dayKey = dayKeyOf(entry.occurredAt);
    const last = groups[groups.length - 1];
    if (last && last.dayKey === dayKey) {
      last.entries.push(entry);
    } else {
      groups.push({ dayKey, entries: [entry] });
    }
  }
  return groups;
}

export function Log({ entries, onSelect }: LogProps) {
  if (entries.length === 0) {
    return <p className="log-empty">No entries yet.</p>;
  }

  const groups = groupByDay(entries);

  return (
    <div className="log">
      {groups.map((group) => (
        <section key={group.dayKey} className="log-day">
          <h2 className="log-day-heading">{formatDayHeading(group.dayKey)}</h2>
          <ul className="log-entries">
            {group.entries.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className="log-entry"
                  data-type={entry.type}
                  onClick={() => onSelect(entry)}
                >
                  <span className="log-entry-icon">{ENTRY_META[entry.type].icon}</span>
                  <span className="log-entry-time">{timeOf(entry.occurredAt)}</span>
                  <span className="log-entry-summary">{summarizeEntry(entry)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
