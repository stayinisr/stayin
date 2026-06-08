// World Cup 2026 prediction tool — pure logic (no React).

export type Mode = "full" | "partial" | "quick";

export type GroupLetter =
  | "A" | "B" | "C" | "D" | "E" | "F"
  | "G" | "H" | "I" | "J" | "K" | "L";

export const GROUP_LETTERS: GroupLetter[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];

export type MatchItem = {
  id: string;
  fifa_match_number: number;
  stage: string;
  match_date: string;
  match_time: string;
  stadium: string;
  city: string;
  home_team_name: string | null;
  away_team_name: string | null;
};

export type FullScore = { home: number; away: number };
export type PartialResult = "H" | "D" | "A";

export type TeamRow = {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

export type GroupTable = {
  group: GroupLetter;
  rows: TeamRow[]; // 1st..4th
};

export type PredictionState = {
  mode: Mode | null;
  scores: Record<string, FullScore>;
  results: Record<string, PartialResult>;
  quickRanks: Partial<Record<GroupLetter, [string, string, string, string]>>;
  tiebreaks: Partial<Record<GroupLetter, string[]>>;
  bestThird: GroupLetter[];
  knockoutWinners: Record<string, "home" | "away">;
};

export const EMPTY_STATE: PredictionState = {
  mode: null,
  scores: {},
  results: {},
  quickRanks: {},
  tiebreaks: {},
  bestThird: [],
  knockoutWinners: {},
};

// ── Group helpers ─────────────────────────────────────────────────────────────

export function stageGroupLetter(stage: string): GroupLetter | null {
  const m = stage.match(/^Group ([A-L])$/);
  return m ? (m[1] as GroupLetter) : null;
}

export function isGroupStage(stage: string): boolean {
  return /^Group [A-L]$/.test(stage);
}

export function groupMatches(matches: MatchItem[], letter: GroupLetter): MatchItem[] {
  return matches
    .filter((m) => m.stage === `Group ${letter}`)
    .sort((a, b) => a.fifa_match_number - b.fifa_match_number);
}

export function groupTeams(matches: MatchItem[], letter: GroupLetter): string[] {
  const set = new Set<string>();
  for (const m of groupMatches(matches, letter)) {
    if (m.home_team_name) set.add(m.home_team_name);
    if (m.away_team_name) set.add(m.away_team_name);
  }
  return [...set];
}

// ── Group table computation ───────────────────────────────────────────────────

function emptyRow(team: string): TeamRow {
  return { team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
}

function sortRows(rows: TeamRow[], tiebreakOrder?: string[]): TeamRow[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    if (tiebreakOrder) {
      const ai = tiebreakOrder.indexOf(a.team);
      const bi = tiebreakOrder.indexOf(b.team);
      if (ai !== -1 && bi !== -1) return ai - bi;
    }
    return a.team.localeCompare(b.team);
  });
}

export function computeGroupTable(
  state: PredictionState,
  matches: MatchItem[],
  letter: GroupLetter,
): GroupTable {
  const teams = groupTeams(matches, letter);
  const rows = new Map<string, TeamRow>();
  for (const t of teams) rows.set(t, emptyRow(t));

  if (state.mode === "quick") {
    // No scores; just use the user's manual ranking.
    const ranks = state.quickRanks[letter];
    const order = ranks && ranks.every(Boolean) ? ranks : teams;
    return { group: letter, rows: order.map(emptyRow) };
  }

  for (const m of groupMatches(matches, letter)) {
    const h = m.home_team_name, a = m.away_team_name;
    if (!h || !a) continue;
    const rh = rows.get(h)!, ra = rows.get(a)!;

    if (state.mode === "full") {
      const s = state.scores[m.id];
      if (!s || s.home == null || s.away == null) continue;
      rh.played++; ra.played++;
      rh.gf += s.home; rh.ga += s.away; rh.gd = rh.gf - rh.ga;
      ra.gf += s.away; ra.ga += s.home; ra.gd = ra.gf - ra.ga;
      if (s.home > s.away)      { rh.won++; rh.points += 3; ra.lost++; }
      else if (s.home < s.away) { ra.won++; ra.points += 3; rh.lost++; }
      else                      { rh.drawn++; ra.drawn++; rh.points += 1; ra.points += 1; }
    } else if (state.mode === "partial") {
      const r = state.results[m.id];
      if (!r) continue;
      rh.played++; ra.played++;
      if (r === "H")      { rh.won++; rh.points += 3; ra.lost++; }
      else if (r === "A") { ra.won++; ra.points += 3; rh.lost++; }
      else                { rh.drawn++; ra.drawn++; rh.points += 1; ra.points += 1; }
    }
  }

  return {
    group: letter,
    rows: sortRows([...rows.values()], state.tiebreaks[letter]),
  };
}

export function computeAllGroupTables(
  state: PredictionState,
  matches: MatchItem[],
): GroupTable[] {
  return GROUP_LETTERS.map((g) => computeGroupTable(state, matches, g));
}

// True if 2+ teams in this group are tied on pts/GD/GF and the user has not
// resolved with an explicit tiebreak order. Only relevant for "partial" mode.
export function partialHasUnresolvedTie(
  state: PredictionState,
  matches: MatchItem[],
  letter: GroupLetter,
): boolean {
  if (state.mode !== "partial") return false;
  const table = computeGroupTable(state, matches, letter);
  const tieKey = (r: TeamRow) => `${r.points}|${r.gd}|${r.gf}`;
  const seen = new Map<string, number>();
  for (const r of table.rows) seen.set(tieKey(r), (seen.get(tieKey(r)) || 0) + 1);
  const tiedKeys = [...seen.entries()].filter(([, n]) => n > 1).map(([k]) => k);
  if (tiedKeys.length === 0) return false;
  const order = state.tiebreaks[letter];
  if (!order) return true;
  // Require explicit order to cover every team in a tie group.
  for (const k of tiedKeys) {
    const teamsInTie = table.rows.filter((r) => tieKey(r) === k).map((r) => r.team);
    if (!teamsInTie.every((t) => order.includes(t))) return true;
  }
  return false;
}

// ── Best third-placed teams ───────────────────────────────────────────────────

// Returns the top N=8 group letters whose 3rd-placed team qualifies.
// Auto for full mode (by pts/GD/GF). For partial, also uses computed pts.
// For quick mode, the user picks manually — function returns letters already
// in state.bestThird if it has 8 items, else uses simple alphabetical fallback.
export function autoBestThird(
  state: PredictionState,
  matches: MatchItem[],
): GroupLetter[] {
  if (state.mode === "quick") {
    if (state.bestThird.length === 8) return state.bestThird;
    return GROUP_LETTERS.slice(0, 8);
  }
  const tables = computeAllGroupTables(state, matches);
  const thirds = tables
    .map((t) => ({ letter: t.group, row: t.rows[2] }))
    .filter((x) => !!x.row);
  thirds.sort((a, b) => {
    const A = a.row!, B = b.row!;
    if (B.points !== A.points) return B.points - A.points;
    if (B.gd !== A.gd) return B.gd - A.gd;
    if (B.gf !== A.gf) return B.gf - A.gf;
    return a.letter.localeCompare(b.letter);
  });
  return thirds.slice(0, 8).map((x) => x.letter);
}

// ── Knockout slot resolution ──────────────────────────────────────────────────

// Slot codes seen in matches.home_team_name / away_team_name for knockout games:
//   "1A"        → winner of Group A
//   "2B"        → runner-up of Group B
//   "3ABCDF"    → 3rd-placed team from one of these 5 groups (FIFA pool)
//   "W74"       → winner of match #74
//   "L101"      → loser of match #101

export type SlotRef =
  | { kind: "first"; group: GroupLetter }
  | { kind: "second"; group: GroupLetter }
  | { kind: "third"; pool: GroupLetter[] }
  | { kind: "winner"; matchNumber: number }
  | { kind: "loser"; matchNumber: number }
  | { kind: "named"; team: string };

export function parseSlot(raw: string | null | undefined): SlotRef {
  if (!raw) return { kind: "named", team: "TBD" };
  let m = raw.match(/^1([A-L])$/);
  if (m) return { kind: "first", group: m[1] as GroupLetter };
  m = raw.match(/^2([A-L])$/);
  if (m) return { kind: "second", group: m[1] as GroupLetter };
  m = raw.match(/^3([A-L]+)$/);
  if (m) return { kind: "third", pool: m[1].split("") as GroupLetter[] };
  m = raw.match(/^W(\d+)$/);
  if (m) return { kind: "winner", matchNumber: parseInt(m[1], 10) };
  m = raw.match(/^L(\d+)$/);
  if (m) return { kind: "loser", matchNumber: parseInt(m[1], 10) };
  return { kind: "named", team: raw };
}

// Map of 3rd-placed group → R32 slot, computed via backtracking.
//
// The 2026 R32 has 8 "third-place" slots, each with a candidate pool of 5
// groups. We must assign 8 distinct groups (from the qualifying `bestThird`
// set) to those slots, one per slot. A naive alphabetical greedy can dead-end
// when the qualifying set is skewed (e.g. all A–H), so we backtrack with
// "most-constrained slot first" heuristic which always finds an assignment
// when one exists.
export function assignThirdsToR32(
  matches: MatchItem[],
  bestThird: GroupLetter[],
): Record<number, GroupLetter> {
  const r32 = matches
    .filter((m) => m.stage === "Round of 32")
    .sort((a, b) => a.fifa_match_number - b.fifa_match_number);

  // Collect every (matchNumber, side) slot that needs a third-place team.
  type Slot = { key: number; pool: GroupLetter[] };
  const slots: Slot[] = [];
  for (const m of r32) {
    for (let side = 0; side < 2; side++) {
      const raw = side === 0 ? m.home_team_name : m.away_team_name;
      const s = parseSlot(raw);
      if (s.kind !== "third") continue;
      const pool = s.pool.filter((g) => bestThird.includes(g));
      slots.push({ key: m.fifa_match_number * 10 + side, pool });
    }
  }

  // Solve with backtracking — sort remaining slots by candidate count ascending.
  const out: Record<number, GroupLetter> = {};
  const used = new Set<GroupLetter>();

  function solve(remaining: Slot[]): boolean {
    if (remaining.length === 0) return true;
    // Pick the most-constrained slot among those still unresolved.
    const ranked = remaining
      .map((s) => ({ s, avail: s.pool.filter((g) => !used.has(g)) }))
      .sort((a, b) => a.avail.length - b.avail.length);
    const head = ranked[0]!;
    if (head.avail.length === 0) return false;
    const rest = remaining.filter((x) => x !== head.s);
    for (const g of head.avail) {
      used.add(g);
      out[head.s.key] = g;
      if (solve(rest)) return true;
      used.delete(g);
      delete out[head.s.key];
    }
    return false;
  }
  solve(slots);
  return out;
}

// Resolve a knockout match's two teams to actual team names (or stable
// placeholders if upstream not decided). Returns labels suitable for UI.
export function resolveKnockoutTeams(
  match: MatchItem,
  matches: MatchItem[],
  tables: GroupTable[],
  knockoutWinners: Record<string, "home" | "away">,
  thirdsAssignment: Record<number, GroupLetter>,
  isHe: boolean,
): { home: string | null; away: string | null; homeLabel: string; awayLabel: string } {
  const tableByLetter = new Map(tables.map((t) => [t.group, t]));
  const matchByNumber = new Map(matches.map((m) => [m.fifa_match_number, m]));

  function resolveSide(raw: string | null, side: 0 | 1): { team: string | null; label: string } {
    const slot = parseSlot(raw);
    if (slot.kind === "named") {
      if (!slot.team || slot.team === "TBD" || slot.team === "TBC") {
        return { team: null, label: isHe ? "טרם נקבע" : "TBD" };
      }
      return { team: slot.team, label: slot.team };
    }
    if (slot.kind === "first") {
      const t = tableByLetter.get(slot.group);
      const team = t?.rows[0]?.team || null;
      return { team, label: team || (isHe ? `מנצחת ${slot.group}` : `Winner ${slot.group}`) };
    }
    if (slot.kind === "second") {
      const t = tableByLetter.get(slot.group);
      const team = t?.rows[1]?.team || null;
      return { team, label: team || (isHe ? `שניה ${slot.group}` : `Runner-up ${slot.group}`) };
    }
    if (slot.kind === "third") {
      const key = match.fifa_match_number * 10 + side;
      const letter = thirdsAssignment[key];
      if (letter) {
        const t = tableByLetter.get(letter);
        const team = t?.rows[2]?.team || null;
        return { team, label: team || (isHe ? `שלישית ${letter}` : `3rd ${letter}`) };
      }
      return {
        team: null,
        label: isHe ? `שלישית (${slot.pool.join("/")})` : `3rd ${slot.pool.join("/")}`,
      };
    }
    if (slot.kind === "winner" || slot.kind === "loser") {
      const upstream = matchByNumber.get(slot.matchNumber);
      if (!upstream) return { team: null, label: `${slot.kind === "winner" ? "W" : "L"}${slot.matchNumber}` };
      const pick = knockoutWinners[upstream.id];
      if (!pick) {
        return {
          team: null,
          label: isHe
            ? `${slot.kind === "winner" ? "מנצחת" : "מפסידה"} #${slot.matchNumber}`
            : `${slot.kind === "winner" ? "Winner" : "Loser"} #${slot.matchNumber}`,
        };
      }
      const resolved = resolveKnockoutTeams(
        upstream, matches, tables, knockoutWinners, thirdsAssignment, isHe,
      );
      const wantWinner = slot.kind === "winner";
      const team = pick === "home"
        ? (wantWinner ? resolved.home : resolved.away)
        : (wantWinner ? resolved.away : resolved.home);
      const label = pick === "home"
        ? (wantWinner ? resolved.homeLabel : resolved.awayLabel)
        : (wantWinner ? resolved.awayLabel : resolved.homeLabel);
      return { team, label };
    }
    return { team: null, label: isHe ? "טרם נקבע" : "TBD" };
  }

  const h = resolveSide(match.home_team_name, 0);
  const a = resolveSide(match.away_team_name, 1);
  return { home: h.team, away: a.team, homeLabel: h.label, awayLabel: a.label };
}

// ── Storage ───────────────────────────────────────────────────────────────────

export const STORAGE_KEY = "stayin_wc2026_prediction_v1";

export function loadState(): PredictionState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    return { ...EMPTY_STATE, ...JSON.parse(raw) };
  } catch {
    return EMPTY_STATE;
  }
}

export function saveState(state: PredictionState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}
