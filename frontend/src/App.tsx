import { IconSettings } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { api } from "./api";
import { ENTRY_META } from "./entryMeta";
import { EntryForm } from "./components/EntryForm";
import { EntryTypeButtons } from "./components/EntryTypeButtons";
import { Log } from "./components/Log";
import { Onboarding } from "./components/Onboarding";
import { SettingsPanel } from "./components/SettingsPanel";
import { ENTRY_TYPES, isCategoryEnabled, type AppSettings, type EnabledCategories, type Entry, type EntryType, type NewEntry } from "./types";
import { hasOnboarded, setOnboarded } from "./utils/onboarding";
import { getLastFetchedAt, setLastFetchedAt, STALE_THRESHOLD_MS } from "./utils/refresh";
import { getTheme, setTheme as persistTheme, type Theme } from "./utils/theme";
import { getWhoAmI, setWhoAmI as persistWhoAmI } from "./utils/whoami";

const EMPTY_SETTINGS: AppSettings = { defaults: {}, enabledCategories: {} };

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(EMPTY_SETTINGS);
  const [activeType, setActiveType] = useState<EntryType | null>(null);
  const [recentEntryId, setRecentEntryId] = useState<number | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [whoAmI, setWhoAmIState] = useState(getWhoAmI());
  const [theme, setThemeState] = useState<Theme>(getTheme());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [onboarded, setOnboardedState] = useState(hasOnboarded());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    const [entriesRes, settingsRes] = await Promise.all([api.getEntries(), api.getSettings()]);
    setEntries(entriesRes);
    setSettings({
      defaults: settingsRes.defaults ?? {},
      enabledCategories: settingsRes.enabledCategories ?? {},
    });
    setLastFetchedAt(Date.now());
  }

  useEffect(() => {
    loadData()
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);
    try {
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - getLastFetchedAt() < STALE_THRESHOLD_MS) return;
      handleRefresh();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const visibleTypes = ENTRY_TYPES.filter((t) => isCategoryEnabled(settings.enabledCategories, t));

  async function refreshEntries() {
    setEntries(await api.getEntries());
    setLastFetchedAt(Date.now());
  }

  async function handleCreate(entry: NewEntry) {
    const created = await api.createEntry(entry);
    setRecentEntryId(created.id);
    setActiveType(null);
    await refreshEntries();
  }

  async function handleDelete(id: number) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      await api.deleteEntry(id);
    } catch {
      await refreshEntries();
    }
  }

  async function handleUpdate(entry: NewEntry) {
    if (!editingEntry) return;
    await api.updateEntry(editingEntry.id, {
      occurredAt: entry.occurredAt,
      createdBy: entry.createdBy,
      data: entry.data,
    });
    setEditingEntry(null);
    await refreshEntries();
  }

  async function handleDeleteFromDrawer() {
    if (!editingEntry) return;
    const id = editingEntry.id;
    setEditingEntry(null);
    await handleDelete(id);
  }

  async function handleSaveSettings(newSettings: AppSettings) {
    const saved = await api.updateSettings(newSettings);
    setSettings(saved);
  }

  function handleChangeWhoAmI(name: string) {
    persistWhoAmI(name);
    setWhoAmIState(name.trim());
  }

  function handleChangeTheme(next: Theme) {
    persistTheme(next);
    setThemeState(next);
  }

  async function handleCompleteOnboarding(data: {
    whoAmI: string;
    enabledCategories: EnabledCategories;
  }) {
    persistWhoAmI(data.whoAmI);
    setWhoAmIState(data.whoAmI.trim());
    const saved = await api.updateSettings({
      defaults: settings.defaults,
      enabledCategories: data.enabledCategories,
    });
    setSettings(saved);
    setOnboarded();
    setOnboardedState(true);
  }

  const EditingIcon = editingEntry ? ENTRY_META[editingEntry.type].icon : null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <h1>Bean</h1>
          {(loading || refreshing) && (
            <span className="loading-indicator" aria-live="polite">
              {loading ? "Loading…" : "Updating…"}
            </span>
          )}
        </div>
        <button
          type="button"
          className="settings-btn"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
        >
          <IconSettings size={22} />
        </button>
      </header>

      <EntryTypeButtons
        types={visibleTypes}
        active={activeType}
        onSelect={(type) => setActiveType(activeType === type ? null : type)}
      />

      {activeType && (
        <EntryForm
          type={activeType}
          defaults={settings.defaults}
          whoAmI={whoAmI}
          onSubmit={handleCreate}
          onCancel={() => setActiveType(null)}
        />
      )}

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="log-empty">Loading…</p>
      ) : (
        <Log
          entries={entries}
          types={visibleTypes}
          recentEntryId={recentEntryId}
          onSelect={setEditingEntry}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onSave={handleSaveSettings}
          whoAmI={whoAmI}
          onChangeWhoAmI={handleChangeWhoAmI}
          theme={theme}
          onChangeTheme={handleChangeTheme}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {!loading && !onboarded && (
        <Onboarding
          initialEnabled={settings.enabledCategories}
          alreadyInUse={entries.length > 0}
          onComplete={handleCompleteOnboarding}
        />
      )}

      {editingEntry && (
        <div className="drawer-overlay" onClick={() => setEditingEntry(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <h2 className="drawer-heading">
              {EditingIcon && <EditingIcon size={20} />} Edit {ENTRY_META[editingEntry.type].label}
            </h2>
            <EntryForm
              type={editingEntry.type}
              defaults={settings.defaults}
              whoAmI={whoAmI}
              entry={editingEntry}
              onSubmit={handleUpdate}
              onCancel={() => setEditingEntry(null)}
              onDelete={handleDeleteFromDrawer}
            />
          </div>
        </div>
      )}
    </div>
  );
}
