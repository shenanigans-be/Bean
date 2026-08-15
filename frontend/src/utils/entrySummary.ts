import type { Entry } from "../types";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function summarizeEntry(entry: Entry): string {
  const data = entry.data;
  switch (entry.type) {
    case "diaper":
      return capitalize(String(data.kind ?? ""));
    case "bottle": {
      const parts = [capitalize(String(data.source ?? ""))];
      if (data.volume) parts.push(`${data.volume}ml`);
      if (data.notes) parts.push(String(data.notes));
      return parts.join(" · ");
    }
    case "breast": {
      const parts = [capitalize(String(data.side ?? ""))];
      if (data.duration) parts.push(`${data.duration} min`);
      if (data.notes) parts.push(String(data.notes));
      return parts.join(" · ");
    }
    case "pump": {
      const parts = [capitalize(String(data.side ?? ""))];
      if (data.volume) parts.push(`${data.volume}ml`);
      return parts.join(" · ");
    }
    default:
      return "";
  }
}
