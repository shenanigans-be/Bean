const KEY = "bean.lastFetchedAt";

export const STALE_THRESHOLD_MS = 5 * 60 * 1000;

export function getLastFetchedAt(): number {
  const raw = localStorage.getItem(KEY);
  return raw ? Number(raw) : 0;
}

export function setLastFetchedAt(timestamp: number): void {
  localStorage.setItem(KEY, String(timestamp));
}
