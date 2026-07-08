export function cn(...values) {
  const out = [];
  for (const v of values) {
    if (!v) continue;
    if (typeof v === "string" || typeof v === "number") {
      out.push(String(v));
    } else if (Array.isArray(v)) {
      const inner = cn(...v);
      if (inner) out.push(inner);
    } else if (typeof v === "object") {
      for (const k in v) if (v[k]) out.push(k);
    }
  }
  return out.join(" ");
}
