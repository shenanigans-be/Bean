import { useState, type FormEvent } from "react";
import { categoryVars, ENTRY_META } from "../entryMeta";
import { ENTRY_TYPES, isCategoryEnabled, type EnabledCategories, type EntryType } from "../types";

interface OnboardingProps {
  initialEnabled: EnabledCategories;
  alreadyInUse: boolean;
  onComplete: (data: { whoAmI: string; enabledCategories: EnabledCategories }) => Promise<void>;
}

export function Onboarding({ initialEnabled, alreadyInUse, onComplete }: OnboardingProps) {
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState<EnabledCategories>(initialEnabled);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(type: EntryType) {
    setEnabled((prev) => ({ ...prev, [type]: !isCategoryEnabled(prev, type) }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onComplete({ whoAmI: name, enabledCategories: enabled });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSubmitting(false);
    }
  }

  return (
    <div className="drawer-overlay">
      <div className="drawer-panel">
        <h2>Welcome to Bean</h2>
        <p className="settings-hint">
          {alreadyInUse
            ? "Looks like someone's already logging entries here. Just tell us who you are — the categories are already set up and shared."
            : "A couple of quick questions to get set up. You can change any of this later in Settings."}
        </p>
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Who am I</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
            />
          </label>

          {!alreadyInUse && (
            <>
              <h3>Which categories do you want to track?</h3>
              <p className="settings-hint">
                You can also set an optional default value for each field in Settings later.
              </p>

              <div className="onboarding-categories">
                {ENTRY_TYPES.map((type) => {
                  const meta = ENTRY_META[type];
                  const Icon = meta.icon;
                  return (
                    <label key={type} className="onboarding-category" style={categoryVars(type)}>
                      <input
                        type="checkbox"
                        checked={isCategoryEnabled(enabled, type)}
                        onChange={() => toggle(type)}
                      />
                      <Icon size={18} />
                      <span>{meta.label}</span>
                    </label>
                  );
                })}
              </div>
            </>
          )}

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <div className="form-actions-right">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Saving…" : "Get started"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
