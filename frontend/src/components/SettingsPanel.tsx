import { useState, type FormEvent, type ReactNode } from "react";
import { categoryVars, ENTRY_META } from "../entryMeta";
import { ENTRY_TYPES, isCategoryEnabled, type AppSettings, type Defaults, type EnabledCategories, type EntryType } from "../types";
import type { Theme } from "../utils/theme";
import { SegmentedControl } from "./SegmentedControl";

interface SettingsPanelProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => Promise<void>;
  whoAmI: string;
  onChangeWhoAmI: (name: string) => void;
  theme: Theme;
  onChangeTheme: (theme: Theme) => void;
  onClose: () => void;
}

interface CategorySectionProps {
  type: EntryType;
  enabled: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function CategorySection({ type, enabled, onToggle, children }: CategorySectionProps) {
  const meta = ENTRY_META[type];
  const Icon = meta.icon;
  return (
    <div className="settings-category" style={categoryVars(type)}>
      <div className="settings-category-header">
        <span className="settings-group-label">
          <Icon size={16} /> {meta.label}
        </span>
        <label className="category-toggle">
          <input type="checkbox" checked={enabled} onChange={onToggle} />
          {enabled ? "Shown" : "Hidden"}
        </label>
      </div>
      {enabled && <div className="settings-category-fields">{children}</div>}
    </div>
  );
}

export function SettingsPanel({
  settings,
  onSave,
  whoAmI,
  onChangeWhoAmI,
  theme,
  onChangeTheme,
  onClose,
}: SettingsPanelProps) {
  const [localDefaults, setLocalDefaults] = useState<Defaults>(settings.defaults);
  const [localEnabled, setLocalEnabled] = useState<EnabledCategories>(settings.enabledCategories);
  const [localWhoAmI, setLocalWhoAmI] = useState(whoAmI);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getDefault(type: EntryType): Record<string, unknown> {
    return (localDefaults[type] as Record<string, unknown> | undefined) ?? {};
  }

  function updateDefault(type: EntryType, patch: Record<string, unknown>) {
    setLocalDefaults(
      (prev) =>
        ({
          ...prev,
          [type]: { ...(prev[type] as Record<string, unknown> | undefined), ...patch },
        }) as Defaults
    );
  }

  function toggleCategory(type: EntryType) {
    setLocalEnabled((prev) => ({ ...prev, [type]: !isCategoryEnabled(prev, type) }));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({ defaults: localDefaults, enabledCategories: localEnabled });
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
          <p className="settings-hint">Saved on this device only.</p>

          <h3>Categories &amp; default values</h3>
          <p className="settings-hint settings-hint-shared">
            Shared with everyone using this Bean. You can show/hide each category and
            specify an (optional) default value for everything.
          </p>

          {ENTRY_TYPES.map((type) => {
            const d = getDefault(type);
            const enabled = isCategoryEnabled(localEnabled, type);
            const toggle = () => toggleCategory(type);

            return (
              <CategorySection key={type} type={type} enabled={enabled} onToggle={toggle}>
                {type === "diaper" && (
                  <div className="settings-group">
                    <span className="settings-group-label">Kind</span>
                    <SegmentedControl
                      options={[
                        { value: "wet", label: "Wet" },
                        { value: "dirty", label: "Dirty" },
                        { value: "both", label: "Both" },
                      ]}
                      value={(d.kind as string) ?? null}
                      onChange={(v) => updateDefault(type, { kind: v })}
                    />
                  </div>
                )}

                {type === "bottle" && (
                  <>
                    <div className="settings-group">
                      <span className="settings-group-label">Source</span>
                      <SegmentedControl
                        options={[
                          { value: "formula", label: "Formula" },
                          { value: "pumped", label: "Pumped" },
                        ]}
                        value={(d.source as string) ?? null}
                        onChange={(v) => updateDefault(type, { source: v })}
                      />
                    </div>
                    <label className="field">
                      <span>Volume (ml)</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={d.volume != null ? String(d.volume) : ""}
                        onChange={(e) =>
                          updateDefault(type, {
                            volume: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                      />
                    </label>
                  </>
                )}

                {type === "breast" && (
                  <>
                    <div className="settings-group">
                      <span className="settings-group-label">Side</span>
                      <SegmentedControl
                        options={[
                          { value: "left", label: "Left" },
                          { value: "right", label: "Right" },
                          { value: "both", label: "Both" },
                        ]}
                        value={(d.side as string) ?? null}
                        onChange={(v) => updateDefault(type, { side: v })}
                      />
                    </div>
                    <label className="field">
                      <span>Duration (min)</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={d.duration != null ? String(d.duration) : ""}
                        onChange={(e) =>
                          updateDefault(type, {
                            duration: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                      />
                    </label>
                  </>
                )}

                {type === "solids" && (
                  <>
                    <label className="field">
                      <span>Contents</span>
                      <input
                        type="text"
                        value={(d.contents as string) ?? ""}
                        onChange={(e) => updateDefault(type, { contents: e.target.value })}
                      />
                    </label>
                    <label className="field">
                      <span>Weight (g)</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={d.weight != null ? String(d.weight) : ""}
                        onChange={(e) =>
                          updateDefault(type, {
                            weight: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                      />
                    </label>
                  </>
                )}

                {type === "pump" && (
                  <>
                    <div className="settings-group">
                      <span className="settings-group-label">Side</span>
                      <SegmentedControl
                        options={[
                          { value: "left", label: "Left" },
                          { value: "right", label: "Right" },
                          { value: "both", label: "Both" },
                        ]}
                        value={(d.side as string) ?? null}
                        onChange={(v) => updateDefault(type, { side: v })}
                      />
                    </div>
                    <label className="field">
                      <span>Volume (ml)</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={d.volume != null ? String(d.volume) : ""}
                        onChange={(e) =>
                          updateDefault(type, {
                            volume: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                      />
                    </label>
                  </>
                )}

                {type === "sleep" && (
                  <label className="field">
                    <span>Duration (min)</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={d.duration != null ? String(d.duration) : ""}
                      onChange={(e) =>
                        updateDefault(type, {
                          duration: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                  </label>
                )}

                {type === "meds" && (
                  <>
                    <label className="field">
                      <span>Name</span>
                      <input
                        type="text"
                        value={(d.name as string) ?? ""}
                        onChange={(e) => updateDefault(type, { name: e.target.value })}
                      />
                    </label>
                    <label className="field">
                      <span>Amount</span>
                      <input
                        type="text"
                        value={(d.amount as string) ?? ""}
                        onChange={(e) => updateDefault(type, { amount: e.target.value })}
                      />
                    </label>
                  </>
                )}

                {type === "misc" && (
                  <label className="field">
                    <span>Notes</span>
                    <input
                      type="text"
                      value={(d.notes as string) ?? ""}
                      onChange={(e) => updateDefault(type, { notes: e.target.value })}
                    />
                  </label>
                )}
              </CategorySection>
            );
          })}

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
            <p className="settings-hint">This device only.</p>
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
