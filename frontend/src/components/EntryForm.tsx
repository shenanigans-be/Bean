import { useState, type FormEvent } from "react";
import { categoryVars, ENTRY_META } from "../entryMeta";
import type {
  BottleSource,
  Defaults,
  DiaperKind,
  Entry,
  EntryType,
  NewEntry,
  Side,
} from "../types";
import { formatDateTimeInput, formatNow, isValidDateTime } from "../utils/datetime";
import { SegmentedControl } from "./SegmentedControl";

interface EntryFormProps {
  type: EntryType;
  defaults: Defaults;
  whoAmI: string;
  entry?: Entry;
  onSubmit: (entry: NewEntry) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
}

export function EntryForm({
  type,
  defaults,
  whoAmI,
  entry,
  onSubmit,
  onCancel,
  onDelete,
}: EntryFormProps) {
  const initial = (entry?.data as Record<string, unknown> | undefined) ?? (defaults[type] as Record<string, unknown> | undefined);

  const [occurredAt, setOccurredAt] = useState(entry?.occurredAt ?? formatNow());
  const [kind, setKind] = useState<DiaperKind>((initial?.kind as DiaperKind) ?? "wet");
  const [source, setSource] = useState<BottleSource>((initial?.source as BottleSource) ?? "formula");
  const [side, setSide] = useState<Side>((initial?.side as Side) ?? "both");
  const [volume, setVolume] = useState(initial?.volume != null ? String(initial.volume) : "");
  const [duration, setDuration] = useState(initial?.duration != null ? String(initial.duration) : "");
  const [notes, setNotes] = useState((initial?.notes as string) ?? "");
  const [contents, setContents] = useState((initial?.contents as string) ?? "");
  const [weight, setWeight] = useState(initial?.weight != null ? String(initial.weight) : "");
  const [medsName, setMedsName] = useState((initial?.name as string) ?? "");
  const [medsAmount, setMedsAmount] = useState((initial?.amount as string) ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function buildData(): Record<string, unknown> {
    switch (type) {
      case "diaper":
        return { kind, notes };
      case "bottle":
        return { source, volume: volume ? Number(volume) : null, notes };
      case "breast":
        return { duration: duration ? Number(duration) : null, side, notes };
      case "pump":
        return { side, volume: volume ? Number(volume) : null, notes };
      case "solids":
        return { contents, weight: weight ? Number(weight) : null, notes };
      case "sleep":
        return { duration: duration ? Number(duration) : null, notes };
      case "meds":
        return { name: medsName, amount: medsAmount, notes };
      case "misc":
        return { notes };
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidDateTime(occurredAt)) {
      setError("Time must be in dd/mm/yyyy - HH:MM format");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const createdBy = entry ? entry.createdBy : whoAmI || null;
      await onSubmit({ type, occurredAt, createdBy, data: buildData() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSubmitting(false);
    }
  }

  function handleDelete() {
    if (window.confirm(`Delete this ${ENTRY_META[type].label.toLowerCase()} entry?`)) {
      onDelete?.();
    }
  }

  return (
    <form className="entry-form" data-type={type} style={categoryVars(type)} onSubmit={handleSubmit}>
      <label className="field">
        <span>Time</span>
        <input
          type="text"
          value={occurredAt}
          onChange={(e) => setOccurredAt(formatDateTimeInput(e.target.value))}
          placeholder="dd/mm/yyyy - HH:MM"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </label>

      {type === "diaper" && (
        <>
          <label className="field">
            <span>Kind</span>
            <SegmentedControl
              options={[
                { value: "wet", label: "Wet" },
                { value: "dirty", label: "Dirty" },
                { value: "both", label: "Both" },
              ]}
              value={kind}
              onChange={setKind}
            />
          </label>
          <label className="field">
            <span>Notes</span>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </>
      )}

      {type === "bottle" && (
        <>
          <label className="field">
            <span>Source</span>
            <SegmentedControl
              options={[
                { value: "formula", label: "Formula" },
                { value: "pumped", label: "Pumped" },
              ]}
              value={source}
              onChange={setSource}
            />
          </label>
          <label className="field">
            <span>Volume (ml)</span>
            <input
              type="number"
              inputMode="numeric"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Notes</span>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </>
      )}

      {type === "breast" && (
        <>
          <label className="field">
            <span>Side</span>
            <SegmentedControl
              options={[
                { value: "left", label: "Left" },
                { value: "right", label: "Right" },
                { value: "both", label: "Both" },
              ]}
              value={side}
              onChange={setSide}
            />
          </label>
          <label className="field">
            <span>Duration (min)</span>
            <input
              type="number"
              inputMode="numeric"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Notes</span>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </>
      )}

      {type === "pump" && (
        <>
          <label className="field">
            <span>Side</span>
            <SegmentedControl
              options={[
                { value: "left", label: "Left" },
                { value: "right", label: "Right" },
                { value: "both", label: "Both" },
              ]}
              value={side}
              onChange={setSide}
            />
          </label>
          <label className="field">
            <span>Volume (ml)</span>
            <input
              type="number"
              inputMode="numeric"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Notes</span>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </>
      )}

      {type === "solids" && (
        <>
          <label className="field">
            <span>Contents</span>
            <input type="text" value={contents} onChange={(e) => setContents(e.target.value)} />
          </label>
          <label className="field">
            <span>Weight (g)</span>
            <input
              type="number"
              inputMode="numeric"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Notes</span>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </>
      )}

      {type === "sleep" && (
        <>
          <label className="field">
            <span>Duration (min)</span>
            <input
              type="number"
              inputMode="numeric"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Notes</span>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </>
      )}

      {type === "meds" && (
        <>
          <label className="field">
            <span>Name</span>
            <input type="text" value={medsName} onChange={(e) => setMedsName(e.target.value)} />
          </label>
          <label className="field">
            <span>Amount</span>
            <input
              type="text"
              value={medsAmount}
              onChange={(e) => setMedsAmount(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Notes</span>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </>
      )}

      {type === "misc" && (
        <label className="field">
          <span>Notes</span>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        {onDelete && (
          <button type="button" className="btn-danger" onClick={handleDelete}>
            Delete
          </button>
        )}
        <div className="form-actions-right">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
