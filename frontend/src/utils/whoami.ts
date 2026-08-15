const KEY = "bean.whoami";

export function getWhoAmI(): string {
  return localStorage.getItem(KEY) ?? "";
}

export function setWhoAmI(name: string): void {
  localStorage.setItem(KEY, name.trim());
}
