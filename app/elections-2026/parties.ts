// Lists running for the 26th Knesset (27 Oct 2026), with their ballot letters.
// `id` is the stable key stored in Supabase — never rename an id once people have voted.
export type Party = { id: string; letters: string; name: string; color: string };

export const PARTIES: Party[] = [
  { id: "likud", letters: "מחל", name: "הליכוד", color: "#1f5fbf" },
  { id: "eisenkot", letters: "דרך", name: "ישר! – איזנקוט", color: "#0e8a8a" },
  { id: "bennett", letters: "רק", name: "ביחד – בנט", color: "#1b2f6e" },
  { id: "democrats", letters: "אמת", name: "הדמוקרטים", color: "#d23a3a" },
  { id: "otzma", letters: "ב", name: "עוצמה יהודית", color: "#e0a21b" },
  { id: "utj", letters: "ג", name: "יהדות התורה", color: "#4a4a4a" },
  { id: "shas", letters: "שס", name: "ש\"ס", color: "#2b3f8f" },
  { id: "ybeytenu", letters: "ל", name: "ישראל ביתנו", color: "#3a8fd6" },
  { id: "rzionism", letters: "ט", name: "הציונות הדתית", color: "#c46a1f" },
  { id: "joint", letters: "ודם", name: "הרשימה המשותפת", color: "#2e9e57" },
  { id: "raam", letters: "עם", name: "רע\"ם", color: "#5c8a2e" },
  { id: "winter", letters: "ך", name: "מפלגת עופר וינטר", color: "#7a4fb5" },
  { id: "reservists", letters: "די", name: "המילואימניקים והכלכלית", color: "#7d6a3a" },
  { id: "bluewhite", letters: "כן", name: "כחול לבן", color: "#5aa6d8" },
];

export const TOTAL_SEATS = 120;
export const THRESHOLD_SEATS = 4;
// Polls close 27 Oct 2026, 22:00 Israel time (UTC+2). Must match the SQL policy.
export const POLLS_CLOSE = new Date("2026-10-27T22:00:00+02:00");

/** 0 stays 0; 1–3 jump to the threshold (4); clamp to 0..120. */
export function normalizeSeats(v: number): number {
  if (!Number.isFinite(v) || v <= 0) return 0;
  const n = Math.round(v);
  if (n < THRESHOLD_SEATS) return THRESHOLD_SEATS;
  return Math.min(TOTAL_SEATS, n);
}

/** Largest-remainder rounding of averages to exactly 120 seats. */
export function roundToKnesset(avg: Record<string, number>): Record<string, number> {
  const sum = PARTIES.reduce((s, p) => s + (avg[p.id] || 0), 0);
  const out: Record<string, number> = {};
  if (!sum) return out;
  const rows = PARTIES.map((p) => {
    const q = ((avg[p.id] || 0) * TOTAL_SEATS) / sum;
    return { id: p.id, q, r: Math.floor(q) };
  });
  let left = TOTAL_SEATS - rows.reduce((s, x) => s + x.r, 0);
  [...rows]
    .sort((a, b) => b.q - b.r - (a.q - a.r))
    .forEach((x) => {
      if (left > 0 && x.q > 0) { x.r++; left--; }
    });
  rows.forEach((x) => (out[x.id] = x.r));
  return out;
}

/** 120 seat positions on a 6-row hemicycle, ordered right-to-left by angle. */
export function hemicycle(): { x: number; y: number }[] {
  const rows = 6, r0 = 80, r1 = 185, cx = 200, cy = 200;
  const radii = Array.from({ length: rows }, (_, k) => r0 + ((r1 - r0) * k) / (rows - 1));
  const sumR = radii.reduce((a, b) => a + b, 0);
  const counts = radii.map((r) => Math.round((TOTAL_SEATS * r) / sumR));
  counts[rows - 1] += TOTAL_SEATS - counts.reduce((a, b) => a + b, 0);
  const pts: { x: number; y: number; a: number; d: number }[] = [];
  radii.forEach((r, k) => {
    const n = counts[k];
    for (let j = 0; j < n; j++) {
      const a = Math.PI * (j / (n - 1));
      pts.push({ x: cx + r * Math.cos(a), y: cy - r * Math.sin(a), a, d: r });
    }
  });
  pts.sort((p, q) => p.a - q.a || p.d - q.d);
  return pts.map(({ x, y }) => ({ x, y }));
}
