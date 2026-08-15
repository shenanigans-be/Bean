export type Theme = "light" | "dark" | "auto";

const KEY = "bean.theme";

export function getTheme(): Theme {
  const value = localStorage.getItem(KEY);
  return value === "light" || value === "dark" ? value : "auto";
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(KEY, theme);
}
