const KEY = "bean.onboarded";

export function hasOnboarded(): boolean {
  return localStorage.getItem(KEY) === "true";
}

export function setOnboarded(): void {
  localStorage.setItem(KEY, "true");
}
