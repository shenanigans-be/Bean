import { useState, type FormEvent } from "react";
import type {
  BottleSource,
  Defaults,
  DiaperKind,
  EntryType,
  NewEntry,
  Side,
} from "../types";
import { formatNow, isValidDateTime } from "../utils/datetime";
import { SegmentedControl } from "./SegmentedControl";

interface EntryFormProps {
  type: EntryType;
  defaults: Defaults;
  whoAmI: string;
  onSubmit: (entry: NewEntry) => Promise<void>;
  onCancel: () => void;
}

export function EntryForm({ type, defaults, whoAmI, onSubmit, onCancel }: EntryFormProps) {
  const d = defaults[type] as Record<string, unknown> | undefined;

  const [occurredAt, setOccurredAt] = useState(formatNow());
  const [kind, setKind] = useState<DiaperKind>((d?.kind as DiaperKind) ?? "wet");
  const [source, setSource] = useState<BottleSource>((d?.source as BottleSource) ?? "formula");
  const [side, setSide] = useState<Side>((d?.side as Side) ?? "both");
  const [volume, setVolume] = useState(d?.volume != null ? String(d.volume) : "");
  const [duration, setDuration] = useState(d?.duration != null ? String(d.duration) : "");
  const [notes, setNotes] = useState((d?.notes as string) ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function buildData(): Record<string, unknown> {
    switch (type) {
      case "diaper":
        return { kind };
      case "bottle":
        return { source, volume: volume ? Number(volume) : null, notes };
      case "breast":
        return { duration: duration ? Number(duration) : null, side, notes };
      case "pump":
        return { side, volume: volume ? Number(volume) : null };
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
      await onSubmit({ type, occurredAt, createdBy: whoAmI || null, data: buildData() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSubmitting(false);
    }
  }

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Time</span>
        <input
          type="text"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          placeholder="dd/mm/yyyy - HH:MM"
          inputMode="numeric"
        />
      </label>

      {type === "diaper" && (
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
        </>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
