import { useState, type FormEvent } from "react";
import { ENTRY_META } from "../entryMeta";
import type { BottleSource, Defaults, DiaperKind, Side } from "../types";
import type { Theme } from "../utils/theme";
import { SegmentedControl } from "./SegmentedControl";

const DiaperIcon = ENTRY_META.diaper.icon;
const BottleIcon = ENTRY_META.bottle.icon;
const BreastIcon = ENTRY_META.breast.icon;
const PumpIcon = ENTRY_META.pump.icon;

interface SettingsPanelProps {
  defaults: Defaults;
  onSaveDefaults: (defaults: Defaults) => Promise<void>;
  whoAmI: string;
  onChangeWhoAmI: (name: string) => void;
  theme: Theme;
  onChangeTheme: (theme: Theme) => void;
  onClose: () => void;
}

export function SettingsPanel({
  defaults,
  onSaveDefaults,
  whoAmI,
  onChangeWhoAmI,
  theme,
  onChangeTheme,
  onClose,
}: SettingsPanelProps) {
  const [diaperKind, setDiaperKind] = useState<DiaperKind | null>(
    defaults.diaper?.kind ?? null
  );
  const [bottleSource, setBottleSource] = useState<BottleSource | null>(
    defaults.bottle?.source ?? null
  );
  const [bottleVolume, setBottleVolume] = useState(
    defaults.bottle?.volume != null ? String(defaults.bottle.volume) : ""
  );
  const [breastSide, setBreastSide] = useState<Side | null>(defaults.breast?.side ?? null);
  const [breastDuration, setBreastDuration] = useState(
    defaults.breast?.duration != null ? String(defaults.breast.duration) : ""
  );
  const [pumpSide, setPumpSide] = useState<Side | null>(defaults.pump?.side ?? null);
  const [pumpVolume, setPumpVolume] = useState(
    defaults.pump?.volume != null ? String(defaults.pump.volume) : ""
  );
  const [localWhoAmI, setLocalWhoAmI] = useState(whoAmI);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const newDefaults: Defaults = {
      diaper: diaperKind ? { kind: diaperKind } : {},
      bottle: {
        ...(bottleSource ? { source: bottleSource } : {}),
        ...(bottleVolume ? { volume: Number(bottleVolume) } : {}),
      },
      breast: {
        ...(breastSide ? { side: breastSide } : {}),
        ...(breastDuration ? { duration: Number(breastDuration) } : {}),
      },
      pump: {
        ...(pumpSide ? { side: pumpSide } : {}),
        ...(pumpVolume ? { volume: Number(pumpVolume) } : {}),
      },
    };
    try {
      await onSaveDefaults(newDefaults);
      onChangeWhoAmI(localWhoAmI);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>
        <form onSubmit={handleSave}>
          <label className="field">
            <span>Who am I</span>
            <input
              type="text"
              value={localWhoAmI}
              onChange={(e) => setLocalWhoAmI(e.target.value)}
              placeholder="Your name"
            />
          </label>

          <h3>Default values</h3>

          <div className="settings-group" data-type="diaper">
            <span className="settings-group-label">
              <DiaperIcon size={16} /> Diaper — kind
            </span>
            <SegmentedControl
              options={[
                { value: "wet", label: "Wet" },
                { value: "dirty", label: "Dirty" },
                { value: "both", label: "Both" },
              ]}
              value={diaperKind}
              onChange={setDiaperKind}
            />
          </div>

          <div className="settings-group" data-type="bottle">
            <span className="settings-group-label">
              <BottleIcon size={16} /> Bottle — source
            </span>
            <SegmentedControl
              options={[
                { value: "formula", label: "Formula" },
                { value: "pumped", label: "Pumped" },
              ]}
              value={bottleSource}
              onChange={setBottleSource}
            />
          </div>
          <label className="field">
            <span className="settings-group-label">
              <BottleIcon size={16} /> Bottle — volume (ml)
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={bottleVolume}
              onChange={(e) => setBottleVolume(e.target.value)}
            />
          </label>

          <div className="settings-group" data-type="breast">
            <span className="settings-group-label">
              <BreastIcon size={16} /> Breast — side
            </span>
            <SegmentedControl
              options={[
                { value: "left", label: "Left" },
                { value: "right", label: "Right" },
                { value: "both", label: "Both" },
              ]}
              value={breastSide}
              onChange={setBreastSide}
            />
          </div>
          <label className="field">
            <span className="settings-group-label">
              <BreastIcon size={16} /> Breast — duration (min)
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={breastDuration}
              onChange={(e) => setBreastDuration(e.target.value)}
            />
          </label>

          <div className="settings-group" data-type="pump">
            <span className="settings-group-label">
              <PumpIcon size={16} /> Pump — side
            </span>
            <SegmentedControl
              options={[
                { value: "left", label: "Left" },
                { value: "right", label: "Right" },
                { value: "both", label: "Both" },
              ]}
              value={pumpSide}
              onChange={setPumpSide}
            />
          </div>
          <label className="field">
            <span className="settings-group-label">
              <PumpIcon size={16} /> Pump — volume (ml)
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={pumpVolume}
              onChange={(e) => setPumpVolume(e.target.value)}
            />
          </label>

          <div className="settings-group">
            <span className="settings-group-label">Theme</span>
            <SegmentedControl
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "auto", label: "Auto" },
              ]}
              value={theme}
              onChange={onChangeTheme}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
