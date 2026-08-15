import type { Entry } from "../types";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function summarizeEntry(entry: Entry): string {
  const data = entry.data;
  switch (entry.type) {
    case "diaper": {
      const parts = [capitalize(String(data.kind ?? ""))];
      if (data.notes) parts.push(String(data.notes));
      return parts.join(" · ");
    }
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
      if (data.notes) parts.push(String(data.notes));
      return parts.join(" · ");
    }
    case "solids": {
      const parts = [];
      if (data.contents) parts.push(String(data.contents));
      if (data.weight) parts.push(`${data.weight}g`);
      if (data.notes) parts.push(String(data.notes));
      return parts.join(" · ");
    }
    case "sleep": {
      const parts = [];
      if (data.duration) parts.push(`${data.duration} min`);
      if (data.notes) parts.push(String(data.notes));
      return parts.join(" · ");
    }
    case "meds": {
      const parts = [];
      if (data.name) parts.push(String(data.name));
      if (data.amount) parts.push(String(data.amount));
      if (data.notes) parts.push(String(data.notes));
      return parts.join(" · ");
    }
    case "misc":
      return String(data.notes ?? "");
    default:
      return "";
  }
}
