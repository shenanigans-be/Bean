import { IconFilter, IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
import { categoryVars, ENTRY_META } from "../entryMeta";
import type { Entry, EntryType } from "../types";
import { dayKeyOf, formatDayHeading, timeOf } from "../utils/datetime";
import { summarizeEntry } from "../utils/entrySummary";

const DAYS_PER_PAGE = 2;

interface LogProps {
  entries: Entry[];
  types: EntryType[];
  recentEntryId: number | null;
  onSelect: (entry: Entry) => void;
  onRefresh: () => void;
  refreshing: boolean;
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

export function Log({ entries, types, recentEntryId, onSelect, onRefresh, refreshing }: LogProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Set<EntryType>>(new Set());
  const [visibleDays, setVisibleDays] = useState(DAYS_PER_PAGE);

  function toggleFilter(type: EntryType) {
    setActiveFilter((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
    setVisibleDays(DAYS_PER_PAGE);
  }

  const filtered =
    activeFilter.size === 0 ? entries : entries.filter((e) => activeFilter.has(e.type));
  const groups = groupByDay(filtered);
  const visibleGroups = groups.slice(0, visibleDays);
  const hasMore = groups.length > visibleDays;

  return (
    <div className="log">
      <div className="log-toolbar">
        <button
          type="button"
          className="refresh-btn"
          aria-label="Refresh"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <IconRefresh className={refreshing ? "spin" : undefined} size={18} />
        </button>
        <button
          type="button"
          className={
            filterOpen || activeFilter.size > 0
              ? "filter-toggle-btn filter-toggle-btn-active"
              : "filter-toggle-btn"
          }
          onClick={() => setFilterOpen((open) => !open)}
        >
          <IconFilter /> Filter
        </button>
      </div>

      {filterOpen && (
        <div className="filter-chips">
          {types.map((type) => {
            const meta = ENTRY_META[type];
            const Icon = meta.icon;
            const active = activeFilter.has(type);
            return (
              <button
                key={type}
                type="button"
                style={categoryVars(type)}
                className={active ? "filter-chip filter-chip-active" : "filter-chip"}
                onClick={() => toggleFilter(type)}
              >
                <Icon /> {meta.label}
              </button>
            );
          })}
        </div>
      )}

      {entries.length === 0 ? (
        <p className="log-empty">No entries yet.</p>
      ) : visibleGroups.length === 0 ? (
        <p className="log-empty">No entries match this filter.</p>
      ) : (
        visibleGroups.map((group) => (
          <section key={group.dayKey} className="log-day">
            <h2 className="log-day-heading">{formatDayHeading(group.dayKey)}</h2>
            <ul className="log-entries">
              {group.entries.map((entry) => {
                const Icon = ENTRY_META[entry.type].icon;
                const isRecent = entry.id === recentEntryId;
                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className={isRecent ? "log-entry log-entry-recent" : "log-entry"}
                      data-type={entry.type}
                      style={categoryVars(entry.type)}
                      onClick={() => onSelect(entry)}
                    >
                      <Icon className="log-entry-icon" size={20} />
                      <span className="log-entry-time">{timeOf(entry.occurredAt)}</span>
                      <span className="log-entry-summary">{summarizeEntry(entry)}</span>
                      {isRecent && <span className="log-entry-badge">New</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}

      {hasMore && (
        <button
          type="button"
          className="btn-secondary load-more"
          onClick={() => setVisibleDays((d) => d + DAYS_PER_PAGE)}
        >
          Load more
        </button>
      )}
    </div>
  );
}
