import { useEffect, useState } from "react";
import { api } from "./api";
import { ENTRY_META } from "./entryMeta";
import { EntryForm } from "./components/EntryForm";
import { EntryTypeButtons } from "./components/EntryTypeButtons";
import { Log } from "./components/Log";
import { SettingsPanel } from "./components/SettingsPanel";
import type { Defaults, Entry, EntryType, NewEntry } from "./types";
import { getWhoAmI, setWhoAmI as persistWhoAmI } from "./utils/whoami";

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [defaults, setDefaults] = useState<Defaults>({});
  const [activeType, setActiveType] = useState<EntryType | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [whoAmI, setWhoAmIState] = useState(getWhoAmI());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getEntries(), api.getSettings()])
      .then(([entriesRes, defaultsRes]) => {
        setEntries(entriesRes);
        setDefaults(defaultsRes);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function refreshEntries() {
    setEntries(await api.getEntries());
  }

  async function handleCreate(entry: NewEntry) {
    await api.createEntry(entry);
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

  async function handleSaveDefaults(newDefaults: Defaults) {
    const saved = await api.updateSettings(newDefaults);
    setDefaults(saved);
  }

  function handleChangeWhoAmI(name: string) {
    persistWhoAmI(name);
    setWhoAmIState(name.trim());
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Bean</h1>
        <button
          type="button"
          className="settings-btn"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
        >
          ⚙️
        </button>
      </header>

      <EntryTypeButtons
        active={activeType}
        onSelect={(type) => setActiveType(activeType === type ? null : type)}
      />

      {activeType && (
        <EntryForm
          type={activeType}
          defaults={defaults}
          whoAmI={whoAmI}
          onSubmit={handleCreate}
          onCancel={() => setActiveType(null)}
        />
      )}

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="log-empty">Loading…</p>
      ) : (
        <Log entries={entries} onSelect={setEditingEntry} />
      )}

      {settingsOpen && (
        <SettingsPanel
          defaults={defaults}
          onSaveDefaults={handleSaveDefaults}
          whoAmI={whoAmI}
          onChangeWhoAmI={handleChangeWhoAmI}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {editingEntry && (
        <div className="drawer-overlay" onClick={() => setEditingEntry(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <h2>
              {ENTRY_META[editingEntry.type].icon} Edit {ENTRY_META[editingEntry.type].label}
            </h2>
            <EntryForm
              type={editingEntry.type}
              defaults={defaults}
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
