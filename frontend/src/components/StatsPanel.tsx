import { IconArrowLeft } from "@tabler/icons-react";
import { useMemo } from "react";
import { categoryVars, ENTRY_META } from "../entryMeta";
import type { Entry, EntryType } from "../types";
import {
  formatAmountPerDay,
  formatRate,
  getCategoryInsight,
  hasEnoughHistory,
  type CategoryInsight,
} from "../utils/stats";

interface StatsPanelProps {
  entries: Entry[];
  types: EntryType[];
  onClose: () => void;
}

function StatRow({ label, thisWeek, lastWeek }: { label: string; thisWeek: string; lastWeek: string }) {
  return (
    <div className="stats-row">
      <span className="stats-row-label">{label}</span>
      <span className="stats-row-values">
        <span className="stats-row-value">{thisWeek}</span>
        <span className="stats-row-compare">
          {lastWeek === thisWeek ? "same as last week" : `${lastWeek} last week`}
        </span>
      </span>
    </div>
  );
}

function isEmpty(insight: CategoryInsight): boolean {
  if (insight.kind === "diaper") {
    return insight.wetThisWeek + insight.dirtyThisWeek + insight.wetLastWeek + insight.dirtyLastWeek === 0;
  }
  return insight.countThisWeek + insight.countLastWeek === 0;
}

function InsightCard({ type, insight }: { type: EntryType; insight: CategoryInsight }) {
  const meta = ENTRY_META[type];
  const Icon = meta.icon;

  return (
    <div className="settings-category stats-category" style={categoryVars(type)}>
      <div className="settings-category-header">
        <span className="settings-group-label">
          <Icon size={16} /> {meta.label}
        </span>
      </div>
      {insight.kind === "diaper" ? (
        <>
          <StatRow label="Wet" thisWeek={formatRate(insight.wetThisWeek)} lastWeek={formatRate(insight.wetLastWeek)} />
          <StatRow
            label="Dirty"
            thisWeek={formatRate(insight.dirtyThisWeek)}
            lastWeek={formatRate(insight.dirtyLastWeek)}
          />
        </>
      ) : insight.kind === "amount" ? (
        <>
          <StatRow
            label={insight.amountLabel}
            thisWeek={formatAmountPerDay(insight.totalThisWeek, insight.unit)}
            lastWeek={formatAmountPerDay(insight.totalLastWeek, insight.unit)}
          />
          <StatRow
            label={insight.countLabel}
            thisWeek={formatRate(insight.countThisWeek)}
            lastWeek={formatRate(insight.countLastWeek)}
          />
          {insight.groupedCountThisWeek !== undefined && insight.groupedCountLastWeek !== undefined && (
            <>
              <StatRow
                label={insight.groupedCountLabel ?? "Feeds (grouped)"}
                thisWeek={formatRate(insight.groupedCountThisWeek)}
                lastWeek={formatRate(insight.groupedCountLastWeek)}
              />
              <p className="stats-explainer">
                Entries logged less than an hour apart are counted as one feed here.
              </p>
            </>
          )}
        </>
      ) : (
        <StatRow
          label={insight.countLabel}
          thisWeek={formatRate(insight.countThisWeek)}
          lastWeek={formatRate(insight.countLastWeek)}
        />
      )}
    </div>
  );
}

export function StatsPanel({ entries, types, onClose }: StatsPanelProps) {
  const enoughHistory = useMemo(() => hasEnoughHistory(entries), [entries]);

  const insights = useMemo(
    () =>
      types
        .filter((type) => type !== "misc")
        .map((type) => ({ type, insight: getCategoryInsight(entries, type) }))
        .filter(({ insight }) => !isEmpty(insight)),
    [entries, types]
  );

  return (
    <div className="fullscreen-panel">
      <div className="fullscreen-panel-inner">
        <div className="fullscreen-header">
          <button type="button" className="back-btn" aria-label="Back" onClick={onClose}>
            <IconArrowLeft size={22} />
          </button>
          <h2>Insights</h2>
        </div>

        {!enoughHistory ? (
          <p className="stats-empty">
            Not enough entries yet. Once there is 7 days of data you'll be able to see
            some stats here.
          </p>
        ) : (
          <>
            <p className="settings-hint">
              The last 7 full days vs. the 7 before that, by category. Today isn't
              counted yet — it's still in progress.
            </p>

            {insights.length === 0 ? (
              <p className="stats-empty">Nothing logged in the last two weeks.</p>
            ) : (
              <div className="stats-list">
                {insights.map(({ type, insight }) => (
                  <InsightCard key={type} type={type} insight={insight} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
