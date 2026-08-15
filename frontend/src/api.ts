import type { Defaults, Entry, NewEntry } from "./types";

const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getEntries: () => request<Entry[]>("/entries"),
  createEntry: (entry: NewEntry) =>
    request<Entry>("/entries", {
      method: "POST",
      body: JSON.stringify(entry),
    }),
  updateEntry: (id: number, entry: Omit<NewEntry, "type">) =>
    request<Entry>(`/entries/${id}`, {
      method: "PUT",
      body: JSON.stringify(entry),
    }),
  deleteEntry: (id: number) =>
    request<void>(`/entries/${id}`, { method: "DELETE" }),
  getSettings: () => request<Defaults>("/settings"),
  updateSettings: (defaults: Defaults) =>
    request<Defaults>("/settings", {
      method: "PUT",
      body: JSON.stringify(defaults),
    }),
};
