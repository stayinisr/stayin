"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { useLanguage } from "../../../../lib/LanguageContext";
import { teamName, flagImgSrc } from "../../../../lib/teams";
import {
  EMPTY_STATE,
  GROUP_LETTERS,
  type GroupLetter,
  type MatchItem,
  type Mode,
  type PredictionState,
  assignThirdsToR32,
  autoBestThird,
  computeAllGroupTables,
  computeBracketLayout,
  computeGroupTable,
  getChampionPath,
  groupMatches,
  groupTeams,
  loadState,
  partialHasUnresolvedTie,
  resolveKnockoutTeams,
  saveState,
} from "./logic";

// ── Palette (aligned with the WC 2026 page) ───────────────────────────────────
const C = {
  usa: "#1a3a6b",
  canada: "#e63946",
  mexico: "#006847",
  bg: "#f8f9fc",
  white: "#ffffff",
  border: "#e8edf5",
  text: "#0d1b3e",
  muted: "#64748b",
  hint: "#94a3b8",
  faint: "#cbd5e1",
  gold: "#d4a017",
  navy: "#1a3a8f",
} as const;

const fSyne = "var(--font-syne,'Syne',sans-serif)";
const fHe = "var(--font-he,'Heebo',sans-serif)";
const fEn = "var(--font-dm,'DM Sans',sans-serif)";
const fBody = (isHe: boolean) => (isHe ? fHe : fEn);

type KOStage =
  | "Round of 32" | "Round of 16" | "Quarter Finals"
  | "Semi Finals" | "Third Place" | "Final";

type Step =
  | { kind: "mode" }
  | { kind: "group"; index: number }
  | { kind: "tiebreak" }
  | { kind: "bestthird" }
  | { kind: "knockout"; stage: KOStage }
  | { kind: "summary" };

const KO_STAGES: KOStage[] = [
  "Round of 32", "Round of 16", "Quarter Finals", "Semi Finals", "Third Place", "Final",
];

function stageLabel(stage: string, isHe: boolean): string {
  if (!isHe) return stage;
  const map: Record<string, string> = {
    "Round of 32": "32 האחרונות",
    "Round of 16": "16 האחרונות",
    "Quarter Finals": "רבע הגמר",
    "Semi Finals": "חצי הגמר",
    "Third Place": "מקום שלישי",
    "Final": "הגמר",
  };
  return map[stage] || stage;
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function PredictPage() {
  const { lang } = useLanguage();
  const isHe = lang === "he";

  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<PredictionState>(EMPTY_STATE);
  const [step, setStep] = useState<Step>({ kind: "mode" });

  // Load matches once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("id,fifa_match_number,stage,match_date,match_time,stadium,city,home_team_name,away_team_name")
        .order("fifa_match_number", { ascending: true });
      if (cancelled) return;
      if (error || !data) {
        setLoading(false);
        return;
      }
      setMatches(data as MatchItem[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Restore prior state.
  useEffect(() => {
    const s = loadState();
    setState(s);
    if (s.mode) {
      // Resume at the first group whose data isn't complete, else summary.
      // Keep simple: land on mode picker; user clicks "continue" to resume.
    }
  }, []);

  // Persist on every change.
  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateState = useCallback((mut: (s: PredictionState) => PredictionState) => {
    setState((prev) => mut(prev));
  }, []);

  const resetAll = useCallback(() => {
    setState(EMPTY_STATE);
    setStep({ kind: "mode" });
    saveState(EMPTY_STATE);
  }, []);

  // ── Derived ─────────────────────────────────────────────────────────────────

  const tables = useMemo(
    () => (matches.length ? computeAllGroupTables(state, matches) : []),
    [state, matches],
  );
  const bestThird = useMemo(
    () => (matches.length ? autoBestThird(state, matches) : []),
    [state, matches],
  );
  const thirdsAssignment = useMemo(
    () => (matches.length ? assignThirdsToR32(matches, bestThird) : {}),
    [matches, bestThird],
  );

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", color: C.muted }}>
        {isHe ? "טוען..." : "Loading..."}
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: 60 }}>
      <Header
        isHe={isHe}
        step={step}
        setStep={setStep}
        onReset={resetAll}
        hasState={!!state.mode}
      />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>
        {step.kind === "mode" && (
          <ModeScreen
            isHe={isHe}
            state={state}
            onPick={(mode) => {
              updateState((s) => ({ ...s, mode }));
              setStep({ kind: "group", index: 0 });
            }}
            onContinue={() => setStep({ kind: "group", index: 0 })}
          />
        )}

        {step.kind === "group" && (
          <GroupScreen
            isHe={isHe}
            matches={matches}
            state={state}
            setState={setState}
            tables={tables}
            index={step.index}
            onPrev={() =>
              step.index === 0
                ? setStep({ kind: "mode" })
                : setStep({ kind: "group", index: step.index - 1 })
            }
            onNext={() => {
              if (step.index < GROUP_LETTERS.length - 1) {
                setStep({ kind: "group", index: step.index + 1 });
              } else {
                // After last group: check for unresolved ties (partial) or
                // need to pick best 8 thirds (quick).
                const hasTie = GROUP_LETTERS.some((g) =>
                  partialHasUnresolvedTie(state, matches, g),
                );
                if (hasTie) setStep({ kind: "tiebreak" });
                else if (state.mode === "quick") setStep({ kind: "bestthird" });
                else setStep({ kind: "bestthird" }); // also let user confirm in full/partial
              }
            }}
          />
        )}

        {step.kind === "tiebreak" && (
          <TiebreakScreen
            isHe={isHe}
            matches={matches}
            state={state}
            setState={setState}
            tables={tables}
            onBack={() => setStep({ kind: "group", index: GROUP_LETTERS.length - 1 })}
            onNext={() => setStep({ kind: "bestthird" })}
          />
        )}

        {step.kind === "bestthird" && (
          <BestThirdScreen
            isHe={isHe}
            matches={matches}
            state={state}
            setState={setState}
            tables={tables}
            autoBest={bestThird}
            onBack={() => setStep({ kind: "group", index: GROUP_LETTERS.length - 1 })}
            onNext={() => setStep({ kind: "knockout", stage: "Round of 32" })}
          />
        )}

        {step.kind === "knockout" && (
          <KnockoutScreen
            isHe={isHe}
            stage={step.stage}
            matches={matches}
            tables={tables}
            state={state}
            setState={setState}
            thirdsAssignment={thirdsAssignment}
            onPrev={() => {
              const i = KO_STAGES.indexOf(step.stage);
              if (i <= 0) setStep({ kind: "bestthird" });
              else setStep({ kind: "knockout", stage: KO_STAGES[i - 1]! });
            }}
            onNext={() => {
              const i = KO_STAGES.indexOf(step.stage);
              if (i < KO_STAGES.length - 1) {
                setStep({ kind: "knockout", stage: KO_STAGES[i + 1]! });
              } else {
                setStep({ kind: "summary" });
              }
            }}
          />
        )}

        {step.kind === "summary" && (
          <SummaryScreen
            isHe={isHe}
            matches={matches}
            tables={tables}
            state={state}
            thirdsAssignment={thirdsAssignment}
            onReset={resetAll}
            onEdit={() => setStep({ kind: "knockout", stage: "Final" })}
          />
        )}
      </main>
    </div>
  );
}

// ── Header / progress ────────────────────────────────────────────────────────

function Header({
  isHe, step, setStep, onReset, hasState,
}: {
  isHe: boolean;
  step: Step;
  setStep: (s: Step) => void;
  onReset: () => void;
  hasState: boolean;
}) {
  const title = isHe ? "סימולטור מונדיאל 2026" : "World Cup 2026 Simulator";
  const sub = isHe
    ? "בנה את הטורניר המושלם שלך — מבתי הקבוצות ועד גמר 2026"
    : "Build your perfect tournament — from groups to the 2026 final";

  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.usa} 0%, ${C.navy} 60%, ${C.canada} 100%)`,
      color: C.white,
      padding: "28px 16px 20px",
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Link
          href="/sports/world-cup-2026"
          style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.7)", textDecoration: "none",
          }}
        >
          ← {isHe ? "חזרה למשחקים" : "Back to matches"}
        </Link>
        <span style={{ flex: 1 }} />
        {hasState && (
          <button
            onClick={onReset}
            style={{
              padding: "5px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
              borderRadius: 4, border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(0,0,0,0.15)", color: C.white, cursor: "pointer",
            }}
          >
            {isHe ? "התחל מחדש" : "Reset"}
          </button>
        )}
      </div>
      <div style={{ maxWidth: 1100, margin: "16px auto 0" }}>
        <div style={{
          fontFamily: fSyne, fontSize: "clamp(28px,4vw,40px)", fontWeight: 900,
          letterSpacing: "-0.03em", lineHeight: 1.05,
        }}>{title}</div>
        <div style={{ fontFamily: fBody(isHe), fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 6 }}>{sub}</div>
      </div>

      {step.kind !== "mode" && (
        <div style={{ maxWidth: 1100, margin: "20px auto 0", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {[
            { key: "groups", label: isHe ? "בתים" : "Groups", active: step.kind === "group" || step.kind === "tiebreak", done: step.kind !== "group" && step.kind !== "tiebreak" },
            { key: "third", label: isHe ? "8 הטובות ביותר" : "Best 3rd", active: step.kind === "bestthird", done: step.kind === "knockout" || step.kind === "summary" },
            { key: "ko", label: isHe ? "נוקאאוט" : "Knockout", active: step.kind === "knockout", done: step.kind === "summary" },
            { key: "sum", label: isHe ? "סיכום" : "Summary", active: step.kind === "summary", done: false },
          ].map((c) => (
            <span
              key={c.key}
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "4px 10px", borderRadius: 3,
                background: c.active ? "rgba(255,255,255,0.18)" : c.done ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.08)",
                color: c.active ? C.white : c.done ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.45)",
                border: c.active ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent",
              }}
            >{c.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Mode screen ──────────────────────────────────────────────────────────────

function ModeScreen({
  isHe, state, onPick, onContinue,
}: {
  isHe: boolean;
  state: PredictionState;
  onPick: (m: Mode) => void;
  onContinue: () => void;
}) {
  const modes: { id: Mode; emoji: string; titleHe: string; titleEn: string; descHe: string; descEn: string; accent: string }[] = [
    {
      id: "full", emoji: "🎯", accent: C.usa,
      titleHe: "חיזוי מלא", titleEn: "Full prediction",
      descHe: "מלא תוצאה מספרית לכל משחק. נחשב לך אוטומטית נקודות, שערים, הפרשים וטבלה.",
      descEn: "Enter a numeric score for every match. We auto-compute points, goals, GD and the table.",
    },
    {
      id: "partial", emoji: "⚖️", accent: C.canada,
      titleHe: "חיזוי חלקי", titleEn: "Partial prediction",
      descHe: "לכל משחק תבחר ניצחון א׳ / תיקו / ניצחון ב׳. במקרה של תיקו בטבלה — תסדר את הקבוצות ידנית.",
      descEn: "Pick W/D/L for each match. Resolve table ties manually when needed.",
    },
    {
      id: "quick", emoji: "⚡", accent: C.mexico,
      titleHe: "חיזוי מהיר", titleEn: "Quick prediction",
      descHe: "בלי לעבור על משחקים — דרג את 4 הקבוצות בכל בית מהמובילה לאחרונה.",
      descEn: "Skip matches — just rank the 4 teams in each group from top to bottom.",
    },
  ];

  return (
    <div>
      {state.mode && (
        <div style={{
          background: "rgba(26,191,176,0.08)", border: "1px solid rgba(26,191,176,0.25)",
          padding: "12px 14px", borderRadius: 6, marginBottom: 18,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap",
        }}>
          <div style={{ fontSize: 13, color: C.text, fontFamily: fBody(isHe) }}>
            {isHe ? "יש לך תחזית קיימת. אפשר להמשיך או להתחיל בחירת מצב מחדש." : "You have a saved prediction. Continue or pick a new mode."}
          </div>
          <button
            onClick={onContinue}
            style={{
              padding: "8px 14px", background: C.usa, color: C.white, border: "none",
              borderRadius: 4, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em",
              textTransform: "uppercase", cursor: "pointer",
            }}
          >{isHe ? "המשך תחזית" : "Continue"}</button>
        </div>
      )}

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.hint, marginBottom: 4 }}>
          {isHe ? "צעד 1 מתוך 4" : "Step 1 of 4"}
        </div>
        <div style={{ fontFamily: fSyne, fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", color: C.text }}>
          {isHe ? "בחר מצב חיזוי" : "Pick prediction mode"}
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 14,
      }}>
        {modes.map((m) => {
          const selected = state.mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onPick(m.id)}
              style={{
                background: C.white, border: `1px solid ${selected ? m.accent : C.border}`,
                borderRadius: 6, padding: 22, textAlign: isHe ? "right" : "left",
                cursor: "pointer", transition: "border-color 150ms, transform 150ms",
                boxShadow: selected ? `0 0 0 3px ${m.accent}22` : "0 1px 2px rgba(13,27,62,0.04)",
                position: "relative",
              }}
            >
              <div style={{ height: 2, background: m.accent, position: "absolute", top: 0, left: 0, right: 0 }} />
              <div style={{ fontSize: 28, marginBottom: 10 }}>{m.emoji}</div>
              <div style={{
                fontFamily: fSyne, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em",
                color: C.text, marginBottom: 8,
              }}>
                {isHe ? m.titleHe : m.titleEn}
              </div>
              <div style={{
                fontFamily: fBody(isHe), fontSize: 13, color: C.muted, lineHeight: 1.6,
              }}>
                {isHe ? m.descHe : m.descEn}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Group screen ─────────────────────────────────────────────────────────────

function GroupScreen({
  isHe, matches, state, setState, tables, index, onPrev, onNext,
}: {
  isHe: boolean;
  matches: MatchItem[];
  state: PredictionState;
  setState: (mut: (s: PredictionState) => PredictionState) => void;
  tables: ReturnType<typeof computeAllGroupTables>;
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onJump?: (i: number) => void;
}) {
  const letter = GROUP_LETTERS[index]!;
  const grp = useMemo(() => groupMatches(matches, letter), [matches, letter]);
  const teams = useMemo(() => groupTeams(matches, letter), [matches, letter]);
  const table = tables.find((t) => t.group === letter)!;

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {GROUP_LETTERS.map((g, i) => (
          <div
            key={g}
            style={{
              width: 30, height: 30, borderRadius: 4,
              border: `1px solid ${g === letter ? C.usa : C.border}`,
              background: g === letter ? C.usa : C.white,
              color: g === letter ? C.white : i < index ? C.muted : C.faint,
              fontSize: 12, fontWeight: 700, fontFamily: fSyne,
              display: "grid", placeItems: "center",
            }}
          >{g}</div>
        ))}
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(280px,360px)", gap: 18,
      }} className="predict-group-grid">
        <div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.hint }}>
              {isHe ? `בית ${letter}` : `Group ${letter}`}
            </div>
            <div style={{ fontFamily: fSyne, fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: C.text }}>
              {state.mode === "quick"
                ? (isHe ? "דרג את הקבוצות" : "Rank the teams")
                : state.mode === "partial"
                  ? (isHe ? "ניצחון / תיקו / ניצחון" : "W / D / L per match")
                  : (isHe ? "תוצאה לכל משחק" : "Score per match")}
            </div>
          </div>

          {state.mode === "quick" ? (
            <QuickRankEditor isHe={isHe} letter={letter} teams={teams} state={state} setState={setState} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {grp.map((m) => (
                <MatchEditor
                  key={m.id}
                  isHe={isHe}
                  match={m}
                  state={state}
                  setState={setState}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <GroupTableView isHe={isHe} table={table} mode={state.mode!} />
        </div>
      </div>

      <NavRow isHe={isHe} onPrev={onPrev} onNext={onNext} />
    </div>
  );
}

function MatchEditor({
  isHe, match, state, setState,
}: {
  isHe: boolean;
  match: MatchItem;
  state: PredictionState;
  setState: (mut: (s: PredictionState) => PredictionState) => void;
}) {
  const h = match.home_team_name;
  const a = match.away_team_name;

  const renderFlag = (name: string | null) => {
    const src = name ? flagImgSrc(name) : "";
    if (!src) return null;
    return (
      <span style={{
        width: 22, height: 16, borderRadius: 3, overflow: "hidden",
        background: C.white, border: "1px solid rgba(13,27,62,0.1)",
        display: "inline-flex", flexShrink: 0,
      }}>
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </span>
    );
  };

  return (
    <div style={{
      background: C.white, border: `1px solid ${C.border}`, borderRadius: 5,
      padding: "12px 14px",
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase", marginBottom: 10, fontFamily: fSyne,
        display: "flex", gap: 8, alignItems: "center",
      }}>
        <span style={{ color: C.usa }}>#{String(match.fifa_match_number).padStart(2, "0")}</span>
        <span style={{ color: C.faint }}>·</span>
        <span style={{ color: C.muted, fontWeight: 600 }}>{match.city}</span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: state.mode === "full" ? "1fr 110px 1fr" : "1fr auto 1fr",
        alignItems: "center", gap: 10,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          justifyContent: isHe ? "flex-end" : "flex-start",
          fontFamily: isHe ? fHe : fEn, fontSize: 14, fontWeight: 600, color: C.text,
        }}>
          {isHe ? <>{teamName(h, isHe)}{renderFlag(h)}</> : <>{renderFlag(h)}{teamName(h, isHe)}</>}
        </div>

        {state.mode === "full" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <ScoreBox
              value={state.scores[match.id]?.home}
              onChange={(v) => setState((s) => ({
                ...s,
                scores: { ...s.scores, [match.id]: { home: v, away: s.scores[match.id]?.away ?? 0 } },
              }))}
            />
            <span style={{ color: C.faint, fontFamily: fSyne, fontSize: 14, fontWeight: 700 }}>—</span>
            <ScoreBox
              value={state.scores[match.id]?.away}
              onChange={(v) => setState((s) => ({
                ...s,
                scores: { ...s.scores, [match.id]: { home: s.scores[match.id]?.home ?? 0, away: v } },
              }))}
            />
          </div>
        ) : (
          <PartialPicker
            value={state.results[match.id]}
            onChange={(r) => setState((s) => ({ ...s, results: { ...s.results, [match.id]: r } }))}
            isHe={isHe}
          />
        )}

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          justifyContent: isHe ? "flex-start" : "flex-end",
          fontFamily: isHe ? fHe : fEn, fontSize: 14, fontWeight: 600, color: C.text,
        }}>
          {isHe ? <>{renderFlag(a)}{teamName(a, isHe)}</> : <>{teamName(a, isHe)}{renderFlag(a)}</>}
        </div>
      </div>
    </div>
  );
}

function ScoreBox({ value, onChange }: { value: number | undefined; onChange: (n: number) => void }) {
  const [local, setLocal] = useState<string>(value == null ? "" : String(value));
  useEffect(() => { setLocal(value == null ? "" : String(value)); }, [value]);
  return (
    <input
      inputMode="numeric"
      value={local}
      onChange={(e) => {
        const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
        setLocal(v);
        if (v === "") return;
        const n = parseInt(v, 10);
        if (!Number.isNaN(n)) onChange(n);
      }}
      onBlur={() => {
        if (local === "") onChange(0);
      }}
      style={{
        width: 46, height: 38, textAlign: "center",
        border: `1px solid ${C.border}`, borderRadius: 4,
        fontFamily: fSyne, fontSize: 18, fontWeight: 800, color: C.text,
        outline: "none", background: C.white,
      }}
    />
  );
}

function PartialPicker({
  value, onChange, isHe,
}: {
  value: "H" | "D" | "A" | undefined;
  onChange: (r: "H" | "D" | "A") => void;
  isHe: boolean;
}) {
  const opts: { v: "H" | "D" | "A"; label: string }[] = [
    { v: "H", label: "1" },
    { v: "D", label: "X" },
    { v: "A", label: "2" },
  ];
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {opts.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            title={o.v === "H" ? (isHe ? "ניצחון בית" : "Home win") : o.v === "A" ? (isHe ? "ניצחון חוץ" : "Away win") : (isHe ? "תיקו" : "Draw")}
            style={{
              width: 36, height: 38, borderRadius: 4,
              border: `1px solid ${active ? C.usa : C.border}`,
              background: active ? C.usa : C.white,
              color: active ? C.white : C.text,
              fontFamily: fSyne, fontSize: 14, fontWeight: 800, cursor: "pointer",
            }}
          >{o.label}</button>
        );
      })}
    </div>
  );
}

function QuickRankEditor({
  isHe, letter, teams, state, setState,
}: {
  isHe: boolean;
  letter: GroupLetter;
  teams: string[];
  state: PredictionState;
  setState: (mut: (s: PredictionState) => PredictionState) => void;
}) {
  // Click team to assign next rank (1→2→3→4). Click again to clear its rank
  // (others shift up). When 3 are ranked, the last unranked team auto-fills 4.
  // Partial rankings persist so the badges stay between renders.
  const saved = state.quickRanks[letter];
  const ranked: string[] = saved ? [...saved] : [];

  const persist = (next: string[]) => {
    setState((s) => {
      const out = { ...s.quickRanks };
      if (next.length === 0) {
        delete out[letter];
      } else {
        out[letter] = next;
      }
      return { ...s, quickRanks: out };
    });
  };

  const click = (t: string) => {
    const i = ranked.indexOf(t);
    if (i !== -1) {
      // Clear this team's rank — others shift up.
      const next = ranked.filter((x) => x !== t);
      persist(next);
      return;
    }
    if (ranked.length >= 4) return;
    const next = [...ranked, t];
    // Auto-fill rank 4 if only one team is left.
    if (next.length === 3) {
      const leftover = teams.find((x) => !next.includes(x));
      if (leftover) next.push(leftover);
    }
    persist(next);
  };

  const rankOf = (t: string): number | null => {
    const i = ranked.indexOf(t);
    return i === -1 ? null : i + 1;
  };

  // Display teams in alphabetical order of NAME for stability; ranked badges
  // tell the user the position. Optionally sort ranked-first.
  const list = [...teams].sort((a, b) => {
    const ra = rankOf(a) ?? 99;
    const rb = rankOf(b) ?? 99;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });

  const allDone = ranked.length === 4;

  return (
    <div>
      <div style={{
        fontSize: 12, color: allDone ? C.mexico : C.muted,
        fontFamily: fBody(isHe), marginBottom: 10,
      }}>
        {allDone
          ? (isHe ? "✓ הבית מדורג. לחץ קבוצה כדי לשנות." : "✓ Group ranked. Click a team to change.")
          : (isHe
              ? `לחץ על קבוצה לפי הסדר: 1 → 2 → 3 → 4 (כרגע ${ranked.length}/4)`
              : `Click teams in order: 1 → 2 → 3 → 4 (currently ${ranked.length}/4)`)}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((t) => {
          const rank = rankOf(t);
          const isRanked = rank != null;
          const badgeColor =
            rank === 1 ? C.usa :
            rank === 2 ? C.canada :
            rank === 3 ? C.gold :
            rank === 4 ? C.faint : C.border;
          return (
            <div
              key={t}
              onClick={() => click(t)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); click(t); } }}
              style={{
                background: isRanked ? "rgba(26,58,107,0.04)" : C.white,
                border: `1px solid ${isRanked ? badgeColor : C.border}`,
                borderRadius: 5, padding: "10px 12px",
                display: "flex", alignItems: "center", gap: 10,
                cursor: "pointer", userSelect: "none",
                transition: "background 120ms, border-color 120ms",
                position: "relative",
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: 4,
                background: isRanked ? badgeColor : "transparent",
                border: isRanked ? "none" : `1px dashed ${C.faint}`,
                color: isRanked ? C.white : C.faint,
                fontFamily: fSyne, fontWeight: 800, fontSize: 13,
                display: "grid", placeItems: "center", flexShrink: 0,
              }}>{rank ?? "·"}</div>

              <span style={{
                width: 22, height: 16, borderRadius: 3, overflow: "hidden",
                background: C.white, border: "1px solid rgba(13,27,62,0.1)",
                display: "inline-flex", flexShrink: 0,
              }}>
                {flagImgSrc(t) && <img src={flagImgSrc(t)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </span>

              <div style={{
                flex: 1, fontFamily: isHe ? fHe : fEn, fontSize: 14, fontWeight: 600, color: C.text,
              }}>{teamName(t, isHe)}</div>

              {isRanked && (
                <button
                  onClick={(e) => { e.stopPropagation(); click(t); }}
                  title={isHe ? "בטל" : "Clear"}
                  style={{
                    width: 22, height: 22, borderRadius: "50%",
                    border: "none", background: "rgba(13,27,62,0.06)",
                    color: C.muted, cursor: "pointer", fontSize: 13, fontWeight: 700,
                    display: "grid", placeItems: "center",
                  }}
                >×</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Table view ───────────────────────────────────────────────────────────────

function GroupTableView({
  isHe, table, mode, compact,
}: {
  isHe: boolean;
  table: { group: GroupLetter; rows: any[] };
  mode: Mode;
  compact?: boolean;
}) {
  const labels = isHe
    ? { team: "קבוצה", p: "מ", w: "נ", d: "ת", l: "ה", gf: "ש+", ga: "ש-", gd: "הפ", pts: "נק" }
    : { team: "Team", p: "P", w: "W", d: "D", l: "L", gf: "GF", ga: "GA", gd: "GD", pts: "Pts" };

  return (
    <div style={{
      background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: 14,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.hint, marginBottom: 8 }}>
        {isHe ? `טבלת בית ${table.group}` : `Group ${table.group} Table`}
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {table.rows.map((r: any, i: number) => (
          <div key={r.team + i} style={{
            display: "grid",
            gridTemplateColumns: mode === "quick" || compact
              ? "20px 1fr"
              : "20px 1fr 24px 24px 24px 30px 30px 30px",
            alignItems: "center", gap: 6,
            padding: "6px 4px",
            borderBottom: i < table.rows.length - 1 ? `1px solid ${C.border}` : "none",
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 3, fontSize: 10, fontWeight: 800,
              fontFamily: fSyne, display: "grid", placeItems: "center",
              background: i === 0 ? C.usa : i === 1 ? C.canada : i === 2 ? C.gold : "transparent",
              color: i < 3 ? C.white : C.faint,
              border: i >= 3 ? `1px solid ${C.border}` : "none",
            }}>{i + 1}</div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              {flagImgSrc(r.team) && (
                <span style={{ width: 18, height: 13, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                  <img src={flagImgSrc(r.team)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </span>
              )}
              <span style={{
                fontFamily: isHe ? fHe : fEn, fontSize: 12, fontWeight: 600, color: C.text,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{teamName(r.team, isHe)}</span>
            </div>

            {!(mode === "quick" || compact) && (
              <>
                <CellNum value={r.played} />
                <CellNum value={r.won} />
                <CellNum value={r.drawn} />
                <CellNum value={r.gf} muted />
                <CellNum value={r.ga} muted />
                <CellNum value={r.points} bold />
              </>
            )}
          </div>
        ))}
      </div>

      {!(mode === "quick" || compact) && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "20px 1fr 24px 24px 24px 30px 30px 30px",
          gap: 6, marginTop: 6, paddingTop: 4, borderTop: `1px solid ${C.border}`,
          fontSize: 9, color: C.hint, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
        }}>
          <span /><span /><span>{labels.p}</span><span>{labels.w}</span><span>{labels.d}</span><span>{labels.gf}</span><span>{labels.ga}</span><span>{labels.pts}</span>
        </div>
      )}
    </div>
  );
}

function CellNum({ value, muted, bold }: { value: number; muted?: boolean; bold?: boolean }) {
  return (
    <div style={{
      textAlign: "center", fontFamily: fSyne, fontSize: 12,
      fontWeight: bold ? 900 : 600,
      color: bold ? C.text : muted ? C.hint : C.muted,
    }}>{value}</div>
  );
}

// ── Tiebreak screen (Partial mode only, when needed) ─────────────────────────

function TiebreakScreen({
  isHe, matches, state, setState, tables, onBack, onNext,
}: {
  isHe: boolean;
  matches: MatchItem[];
  state: PredictionState;
  setState: (mut: (s: PredictionState) => PredictionState) => void;
  tables: any[];
  onBack: () => void;
  onNext: () => void;
}) {
  const tied = GROUP_LETTERS.filter((g) => partialHasUnresolvedTie(state, matches, g));

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.hint }}>
          {isHe ? "תיקו בטבלה" : "Table ties"}
        </div>
        <div style={{ fontFamily: fSyne, fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: C.text }}>
          {isHe ? "סדר את הקבוצות השוות" : "Order the tied teams"}
        </div>
        <div style={{ fontFamily: fBody(isHe), fontSize: 13, color: C.muted, marginTop: 6, maxWidth: 600 }}>
          {isHe
            ? "בבתים הבאים יש קבוצות עם אותן נקודות. סדר ידנית מהמובילה לאחרונה."
            : "Some groups have teams tied on points. Order them manually from top to bottom."}
        </div>
      </div>

      {tied.length === 0 ? (
        <div style={{ padding: 16, background: C.white, border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, fontSize: 13 }}>
          {isHe ? "אין תיקו לפתור." : "No ties to resolve."}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {tied.map((g) => {
            const t = tables.find((x) => x.group === g)!;
            return (
              <div key={g} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: 14 }}>
                <div style={{ fontFamily: fSyne, fontWeight: 800, fontSize: 16, marginBottom: 10 }}>
                  {isHe ? `בית ${g}` : `Group ${g}`}
                </div>
                <TiebreakList
                  isHe={isHe}
                  letter={g}
                  teams={t.rows.map((r: any) => r.team)}
                  state={state}
                  setState={setState}
                />
              </div>
            );
          })}
        </div>
      )}

      <NavRow isHe={isHe} onPrev={onBack} onNext={onNext} nextLabel={isHe ? "המשך" : "Continue"} />
    </div>
  );
}

function TiebreakList({
  isHe, letter, teams, state, setState,
}: {
  isHe: boolean;
  letter: GroupLetter;
  teams: string[];
  state: PredictionState;
  setState: (mut: (s: PredictionState) => PredictionState) => void;
}) {
  const current = state.tiebreaks[letter] || teams;
  const order = [...current];
  // ensure all teams present
  for (const t of teams) if (!order.includes(t)) order.push(t);

  const move = (i: number, dir: -1 | 1) => {
    const next = [...order];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    setState((s) => ({ ...s, tiebreaks: { ...s.tiebreaks, [letter]: next } }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {order.map((t, i) => (
        <div key={t} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 8px", border: `1px solid ${C.border}`, borderRadius: 4,
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: 3,
            background: i === 0 ? C.usa : i === 1 ? C.canada : i === 2 ? C.gold : C.faint,
            color: C.white, fontFamily: fSyne, fontWeight: 800, fontSize: 11,
            display: "grid", placeItems: "center",
          }}>{i + 1}</span>
          {flagImgSrc(t) && (
            <span style={{ width: 20, height: 14, borderRadius: 2, overflow: "hidden" }}>
              <img src={flagImgSrc(t)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </span>
          )}
          <span style={{ flex: 1, fontFamily: isHe ? fHe : fEn, fontSize: 13, fontWeight: 600, color: C.text }}>
            {teamName(t, isHe)}
          </span>
          <button onClick={() => move(i, -1)} disabled={i === 0}
            style={btnArrow(i === 0)}>↑</button>
          <button onClick={() => move(i, 1)} disabled={i === order.length - 1}
            style={btnArrow(i === order.length - 1)}>↓</button>
        </div>
      ))}
    </div>
  );
}

function btnArrow(disabled: boolean): React.CSSProperties {
  return {
    width: 26, height: 26, borderRadius: 3,
    border: `1px solid ${C.border}`, background: C.white,
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
    fontSize: 13, fontWeight: 700, color: C.muted,
  };
}

// ── Best 3rd screen ──────────────────────────────────────────────────────────

function BestThirdScreen({
  isHe, matches, state, setState, tables, autoBest, onBack, onNext,
}: {
  isHe: boolean;
  matches: MatchItem[];
  state: PredictionState;
  setState: (mut: (s: PredictionState) => PredictionState) => void;
  tables: any[];
  autoBest: GroupLetter[];
  onBack: () => void;
  onNext: () => void;
}) {
  // No auto-seeding — the user picks the 8 deliberately. State is the truth.
  const selected = state.bestThird;

  const toggle = (g: GroupLetter) => {
    setState((s) => {
      const list = [...s.bestThird];
      const i = list.indexOf(g);
      if (i !== -1) {
        list.splice(i, 1);
      } else if (list.length < 8) {
        list.push(g);
      }
      return { ...s, bestThird: list };
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.hint }}>
          {isHe ? "צעד 2 מתוך 4" : "Step 2 of 4"}
        </div>
        <div style={{ fontFamily: fSyne, fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: C.text }}>
          {isHe ? "8 הנבחרות הטובות ביותר מהמקום השלישי" : "Best 8 third-placed teams"}
        </div>
        <div style={{ fontFamily: fBody(isHe), fontSize: 13, color: C.muted, marginTop: 6, maxWidth: 640 }}>
          {isHe
            ? "בחר 8 בתים שמהם הנבחרת השלישית עולה לשלב הנוקאאוט. הסדר שתבחר קובע את העדיפות בעת השיבוץ."
            : "Pick 8 groups whose 3rd-placed team qualifies. The order you click sets their seeding."}
        </div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 10,
      }}>
        {GROUP_LETTERS.map((g) => {
          const t = tables.find((x) => x.group === g)!;
          const third = t.rows[2];
          const active = selected.includes(g);
          const rank = active ? selected.indexOf(g) + 1 : null;
          return (
            <button
              key={g}
              onClick={() => toggle(g)}
              style={{
                background: active ? "rgba(26,58,107,0.05)" : C.white,
                border: `1px solid ${active ? C.usa : C.border}`,
                borderRadius: 5, padding: 12, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10, textAlign: isHe ? "right" : "left",
              }}
            >
              <span style={{
                width: 26, height: 26, borderRadius: 4,
                background: active ? C.usa : C.faint, color: C.white,
                fontFamily: fSyne, fontWeight: 800, fontSize: 12,
                display: "grid", placeItems: "center", flexShrink: 0,
              }}>{rank ?? g}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 10, color: C.hint, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {isHe ? `בית ${g}` : `Group ${g}`}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                  {third && flagImgSrc(third.team) && (
                    <span style={{ width: 18, height: 13, borderRadius: 2, overflow: "hidden" }}>
                      <img src={flagImgSrc(third.team)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </span>
                  )}
                  <span style={{
                    fontFamily: isHe ? fHe : fEn, fontSize: 13, fontWeight: 700, color: C.text,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{third ? teamName(third.team, isHe) : "—"}</span>
                </div>
                {state.mode !== "quick" && third && (
                  <div style={{ fontSize: 10, color: C.hint, marginTop: 2 }}>
                    {third.points} pts · GD {third.gd >= 0 ? "+" : ""}{third.gd} · GF {third.gf}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <NavRow
        isHe={isHe}
        onPrev={onBack}
        onNext={onNext}
        nextLabel={isHe ? "לנוקאאוט →" : "To knockout →"}
        nextDisabled={selected.length !== 8}
        hint={selected.length !== 8 ? (isHe ? `סמן בדיוק 8 בתים (כרגע ${selected.length})` : `Select exactly 8 groups (currently ${selected.length})`) : undefined}
      />
    </div>
  );
}

// ── Knockout screen ──────────────────────────────────────────────────────────

function KnockoutScreen({
  isHe, stage, matches, tables, state, setState, thirdsAssignment, onPrev, onNext,
}: {
  isHe: boolean;
  stage: KOStage;
  matches: MatchItem[];
  tables: any[];
  state: PredictionState;
  setState: (mut: (s: PredictionState) => PredictionState) => void;
  thirdsAssignment: Record<number, GroupLetter>;
  onPrev: () => void;
  onNext: () => void;
}) {
  const games = matches.filter((m) => m.stage === stage).sort((a, b) => a.fifa_match_number - b.fifa_match_number);

  // Block "Next" until every match in this stage has a winner picked.
  const allPicked = games.every((m) => state.knockoutWinners[m.id]);

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.hint }}>
          {isHe ? "שלב נוקאאוט" : "Knockout"}
        </div>
        <div style={{ fontFamily: fSyne, fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: C.text }}>
          {stageLabel(stage, isHe)}
        </div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 10,
      }}>
        {games.map((m) => (
          <KnockoutGameCard
            key={m.id}
            isHe={isHe}
            match={m}
            matches={matches}
            tables={tables}
            state={state}
            setState={setState}
            thirdsAssignment={thirdsAssignment}
          />
        ))}
      </div>

      <NavRow
        isHe={isHe}
        onPrev={onPrev}
        onNext={onNext}
        nextDisabled={!allPicked}
        nextLabel={stage === "Final" ? (isHe ? "סיום ←" : "Finish →") : (isHe ? "המשך ←" : "Next stage →")}
        hint={!allPicked ? (isHe ? "בחר מנצחת בכל משחק כדי להמשיך" : "Pick a winner in every match to continue") : undefined}
      />
    </div>
  );
}

function KnockoutGameCard({
  isHe, match, matches, tables, state, setState, thirdsAssignment,
}: {
  isHe: boolean;
  match: MatchItem;
  matches: MatchItem[];
  tables: any[];
  state: PredictionState;
  setState: (mut: (s: PredictionState) => PredictionState) => void;
  thirdsAssignment: Record<number, GroupLetter>;
}) {
  const resolved = resolveKnockoutTeams(match, matches, tables, state.knockoutWinners, thirdsAssignment, isHe);
  const picked = state.knockoutWinners[match.id];

  const Side = ({ label, team, side }: { label: string; team: string | null; side: "home" | "away" }) => {
    const active = picked === side;
    const canPick = !!team;
    return (
      <button
        onClick={() => {
          if (!canPick) return;
          setState((s) => ({
            ...s,
            knockoutWinners: { ...s.knockoutWinners, [match.id]: side },
          }));
        }}
        disabled={!canPick}
        style={{
          flex: 1, padding: "10px 12px", textAlign: "center",
          background: active ? C.usa : C.white,
          color: active ? C.white : canPick ? C.text : C.hint,
          border: `1px solid ${active ? C.usa : C.border}`,
          borderRadius: 4, cursor: canPick ? "pointer" : "not-allowed",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        }}
      >
        {team && flagImgSrc(team) && (
          <span style={{ width: 28, height: 20, borderRadius: 2, overflow: "hidden" }}>
            <img src={flagImgSrc(team)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </span>
        )}
        <span style={{
          fontFamily: isHe ? fHe : fEn, fontSize: 13, fontWeight: 700,
        }}>{team ? teamName(team, isHe) : label}</span>
      </button>
    );
  };

  return (
    <div style={{
      background: C.white, border: `1px solid #b9c1d1`, borderRadius: 5, padding: 10,
      boxShadow: "0 1px 3px rgba(13,27,62,0.08)",
    }}>
      <div style={{
        fontSize: 11, color: C.text, fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase", marginBottom: 10, fontFamily: fSyne,
        display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center",
      }}>
        <span style={{ color: C.usa }}>#{String(match.fifa_match_number).padStart(2, "0")}</span>
        <span style={{ color: C.muted, fontWeight: 600 }}>{match.city}</span>
      </div>
      <div style={{ display: "flex", alignItems: "stretch", gap: 6 }}>
        <Side label={resolved.homeLabel} team={resolved.home} side="home" />
        <div style={{ display: "grid", placeItems: "center", color: C.faint, fontFamily: fSyne, fontWeight: 700, fontSize: 11 }}>VS</div>
        <Side label={resolved.awayLabel} team={resolved.away} side="away" />
      </div>
    </div>
  );
}

// ── Summary screen ───────────────────────────────────────────────────────────

function SummaryScreen({
  isHe, matches, tables, state, thirdsAssignment, onReset, onEdit,
}: {
  isHe: boolean;
  matches: MatchItem[];
  tables: any[];
  state: PredictionState;
  thirdsAssignment: Record<number, GroupLetter>;
  onReset: () => void;
  onEdit: () => void;
}) {
  const finalMatch = matches.find((m) => m.stage === "Final");
  const resolvedFinal = finalMatch
    ? resolveKnockoutTeams(finalMatch, matches, tables, state.knockoutWinners, thirdsAssignment, isHe)
    : null;
  const championPick = finalMatch ? state.knockoutWinners[finalMatch.id] : undefined;
  const champion = resolvedFinal && championPick
    ? (championPick === "home" ? resolvedFinal.home : resolvedFinal.away)
    : null;

  // Login gate for share — sharing is only available to authenticated users.
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      setAuthEmail(session?.user?.email ?? null);
      setAuthChecked(true);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthEmail(session?.user?.email ?? null);
      setAuthChecked(true);
    });
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);
  const loggedIn = !!authEmail;

  const shareRef = useRef<HTMLDivElement>(null);

  const onShare = useCallback(async () => {
    const text = champion
      ? (isHe
        ? `התחזית שלי למונדיאל 2026 — האלופה: ${teamName(champion, true)} 🏆\n${window.location.origin}/sports/world-cup-2026/predict`
        : `My World Cup 2026 prediction — Champion: ${teamName(champion, false)} 🏆\n${window.location.origin}/sports/world-cup-2026/predict`)
      : (isHe ? "התחזית שלי למונדיאל 2026" : "My World Cup 2026 prediction");
    if (navigator.share) {
      try {
        await navigator.share({ title: "Stayin · WC 2026", text });
        return;
      } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(text);
      alert(isHe ? "הקישור הועתק" : "Copied to clipboard");
    } catch {
      alert(text);
    }
  }, [champion, isHe]);

  return (
    <div ref={shareRef}>
      {/* Champion banner */}
      <div style={{
        background: `linear-gradient(135deg, ${C.usa}, ${C.canada}, ${C.gold})`,
        color: C.white, borderRadius: 8, padding: "28px 22px", textAlign: "center",
        marginBottom: 22, position: "relative", overflow: "hidden",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.8 }}>
          {isHe ? "האלופה שלך" : "Your Champion"}
        </div>
        <div style={{ fontSize: 54, margin: "8px 0 4px" }}>🏆</div>
        {champion ? (
          <>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              {flagImgSrc(champion) && (
                <span style={{ width: 36, height: 26, borderRadius: 3, overflow: "hidden" }}>
                  <img src={flagImgSrc(champion)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </span>
              )}
              <span style={{ fontFamily: fSyne, fontSize: 32, fontWeight: 900, letterSpacing: "-0.02em" }}>
                {teamName(champion, isHe)}
              </span>
            </div>
          </>
        ) : (
          <div style={{ opacity: 0.85 }}>{isHe ? "טרם נקבעה" : "TBD"}</div>
        )}

        <div style={{ marginTop: 18, display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          {authChecked && loggedIn ? (
            <button
              onClick={onShare}
              style={{
                padding: "10px 18px", background: C.white, color: C.text, border: "none",
                borderRadius: 4, fontSize: 12, fontWeight: 800, letterSpacing: "0.05em",
                textTransform: "uppercase", cursor: "pointer",
              }}
            >{isHe ? "שתף תחזית" : "Share prediction"}</button>
          ) : (
            <Link
              href={`/auth?next=${encodeURIComponent("/sports/world-cup-2026/predict")}`}
              style={{
                padding: "10px 18px", background: C.white, color: C.text,
                borderRadius: 4, fontSize: 12, fontWeight: 800, letterSpacing: "0.05em",
                textTransform: "uppercase", cursor: "pointer", textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
              title={isHe ? "התחבר כדי לשתף" : "Log in to share"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {isHe ? "התחבר כדי לשתף" : "Log in to share"}
            </Link>
          )}
          <button
            onClick={onEdit}
            style={{
              padding: "10px 18px", background: "transparent", color: C.white,
              border: `1px solid rgba(255,255,255,0.4)`,
              borderRadius: 4, fontSize: 12, fontWeight: 800, letterSpacing: "0.05em",
              textTransform: "uppercase", cursor: "pointer",
            }}
          >{isHe ? "ערוך תחזית" : "Edit"}</button>
          <button
            onClick={onReset}
            style={{
              padding: "10px 18px", background: "rgba(0,0,0,0.2)", color: C.white,
              border: `1px solid rgba(255,255,255,0.2)`,
              borderRadius: 4, fontSize: 12, fontWeight: 800, letterSpacing: "0.05em",
              textTransform: "uppercase", cursor: "pointer",
            }}
          >{isHe ? "התחל מחדש" : "Reset"}</button>
        </div>

        {authChecked && loggedIn && (
          <div style={{
            marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.65)",
            fontFamily: fBody(isHe),
          }}>
            {isHe ? `מחובר כ-${authEmail}` : `Signed in as ${authEmail}`}
          </div>
        )}
      </div>

      {/* Bracket */}
      <SectionTitle isHe={isHe} en="Knockout Bracket" he="עץ הנוקאאוט" />
      <BracketTree
        isHe={isHe}
        matches={matches}
        tables={tables}
        state={state}
        thirdsAssignment={thirdsAssignment}
      />

      {/* Group tables */}
      <SectionTitle isHe={isHe} en="Group Tables" he="טבלאות הבתים" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 12 }}>
        {tables.map((t) => (
          <GroupTableView key={t.group} isHe={isHe} table={t} mode={state.mode!} />
        ))}
      </div>

      {/* Stayin link CTA */}
      <SectionTitle isHe={isHe} en="Tickets on Stayin" he="כרטיסים ב-Stayin" />
      <div style={{
        background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: 18,
      }}>
        <div style={{ fontFamily: fBody(isHe), fontSize: 13, color: C.muted, marginBottom: 12 }}>
          {isHe
            ? "מצא כרטיסים למשחקים שחזית — קונים ומוכרים פרטיים, בלי עמלות."
            : "Find tickets for the matches you predicted — direct between fans, no fees."}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Link
            href="/sports/world-cup-2026"
            style={{
              padding: "10px 18px", background: C.usa, color: C.white, textDecoration: "none",
              borderRadius: 4, fontSize: 12, fontWeight: 800, letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >{isHe ? "כל משחקי המונדיאל" : "All WC matches"}</Link>
          {finalMatch && (
            <Link
              href={`/matches/${finalMatch.id}`}
              style={{
                padding: "10px 18px", background: C.white, color: C.text,
                border: `1px solid ${C.border}`,
                textDecoration: "none", borderRadius: 4, fontSize: 12, fontWeight: 800,
                letterSpacing: "0.05em", textTransform: "uppercase",
              }}
            >{isHe ? "כרטיסים לגמר" : "Final tickets"}</Link>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ isHe, en, he }: { isHe: boolean; en: string; he: string }) {
  return (
    <div style={{ margin: "26px 0 12px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.hint }}>
        {isHe ? he : en}
      </div>
    </div>
  );
}

// ── Bracket tree (visual) ────────────────────────────────────────────────────

function BracketTree({
  isHe, matches, tables, state, thirdsAssignment,
}: {
  isHe: boolean;
  matches: MatchItem[];
  tables: any[];
  state: PredictionState;
  thirdsAssignment: Record<number, GroupLetter>;
}) {
  const layout = useMemo(() => computeBracketLayout(matches), [matches]);
  const champPath = useMemo(
    () => getChampionPath(matches, state.knockoutWinners),
    [matches, state.knockoutWinners],
  );

  // Each round renders as a flex column with space-around. As long as every
  // column shares the same height and box height, R16 boxes will visually
  // centre between their two R32 feeders, QF between R16 pairs, and so on.
  const cols: { label: string; items: MatchItem[] }[] = [
    { label: stageLabel("Round of 32", isHe), items: layout.r32 },
    { label: stageLabel("Round of 16", isHe), items: layout.r16 },
    { label: stageLabel("Quarter Finals", isHe), items: layout.qf },
    { label: stageLabel("Semi Finals", isHe), items: layout.sf },
    { label: stageLabel("Final", isHe), items: layout.final ? [layout.final] : [] },
  ];

  const BOX_H = 56; // px — match height
  const GAP_R32 = 8; // vertical gap between R32 boxes
  const totalH = layout.r32.length * (BOX_H + GAP_R32);

  return (
    <div style={{ overflowX: "auto", paddingBottom: 8 }}>
      <div style={{
        display: "flex", gap: 24, minWidth: cols.length * 200,
        alignItems: "stretch",
      }}>
        {cols.map((col, ci) => (
          <div key={col.label} style={{
            flex: 1, minWidth: 180, display: "flex", flexDirection: "column",
          }}>
            <div style={{
              fontSize: 10, fontWeight: 800, letterSpacing: "0.18em",
              textTransform: "uppercase", color: C.usa, marginBottom: 10,
              textAlign: "center", fontFamily: fSyne,
              paddingBottom: 6, borderBottom: `1px solid ${C.border}`,
            }}>{col.label}</div>

            <div style={{
              height: totalH, display: "flex", flexDirection: "column",
              justifyContent: "space-around",
            }}>
              {col.items.map((m) => {
                const r = resolveKnockoutTeams(m, matches, tables, state.knockoutWinners, thirdsAssignment, isHe);
                const winnerSide = state.knockoutWinners[m.id];
                const onPath = champPath.has(m.id);
                return (
                  <BracketCard
                    key={m.id}
                    isHe={isHe}
                    match={m}
                    homeTeam={r.home}
                    awayTeam={r.away}
                    homeLabel={r.homeLabel}
                    awayLabel={r.awayLabel}
                    winnerSide={winnerSide}
                    onPath={onPath}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {layout.third && (
        <div style={{
          marginTop: 22, padding: "14px 16px",
          background: C.white, border: `1px solid #b9c1d1`, borderRadius: 5,
          boxShadow: "0 1px 3px rgba(13,27,62,0.08)",
          maxWidth: 380,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 800, letterSpacing: "0.18em",
            textTransform: "uppercase", color: C.usa, marginBottom: 8,
            fontFamily: fSyne,
          }}>
            {stageLabel("Third Place", isHe)} · #{layout.third.fifa_match_number}
          </div>
          {(() => {
            const r = resolveKnockoutTeams(layout.third!, matches, tables, state.knockoutWinners, thirdsAssignment, isHe);
            const winnerSide = state.knockoutWinners[layout.third!.id];
            return (
              <BracketCard
                isHe={isHe}
                match={layout.third!}
                homeTeam={r.home}
                awayTeam={r.away}
                homeLabel={r.homeLabel}
                awayLabel={r.awayLabel}
                winnerSide={winnerSide}
                onPath={false}
                hideMatchNumber
              />
            );
          })()}
        </div>
      )}
    </div>
  );
}

function BracketCard({
  isHe, match, homeTeam, awayTeam, homeLabel, awayLabel, winnerSide, onPath, hideMatchNumber,
}: {
  isHe: boolean;
  match: MatchItem;
  homeTeam: string | null;
  awayTeam: string | null;
  homeLabel: string;
  awayLabel: string;
  winnerSide: "home" | "away" | undefined;
  onPath: boolean;
  hideMatchNumber?: boolean;
}) {
  return (
    <div style={{
      background: C.white,
      border: `1px solid ${onPath ? C.gold : "#b9c1d1"}`,
      boxShadow: onPath
        ? `0 0 0 2px ${C.gold}, 0 4px 12px rgba(212,160,23,0.18)`
        : "0 1px 3px rgba(13,27,62,0.10), 0 1px 1px rgba(13,27,62,0.06)",
      borderRadius: 5, overflow: "hidden", position: "relative",
    }}>
      {!hideMatchNumber && (
        <div style={{
          position: "absolute", top: 3, right: 7,
          fontSize: 9, fontWeight: 800, letterSpacing: "0.06em",
          color: onPath ? C.gold : C.muted,
          fontFamily: fSyne, pointerEvents: "none",
        }}>#{match.fifa_match_number}</div>
      )}
      <BracketSide isHe={isHe} won={winnerSide === "home"} team={homeTeam} label={homeLabel} />
      <div style={{ height: 1, background: "#d4dbe8" }} />
      <BracketSide isHe={isHe} won={winnerSide === "away"} team={awayTeam} label={awayLabel} />
    </div>
  );
}

function BracketSide({ isHe, won, team, label }: { isHe: boolean; won: boolean; team: string | null; label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7, padding: "8px 10px",
      background: won ? "rgba(212,160,23,0.18)" : "transparent",
      color: won ? "#5a3d00" : team ? C.text : C.muted,
      fontWeight: won ? 800 : 700, minHeight: 28,
    }}>
      {team && flagImgSrc(team) && (
        <span style={{ width: 18, height: 13, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
          <img src={flagImgSrc(team)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </span>
      )}
      <span style={{
        fontFamily: isHe ? fHe : fEn, fontSize: 12,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1,
        letterSpacing: isHe ? 0 : "-0.1px",
      }}>{team ? teamName(team, isHe) : label}</span>
    </div>
  );
}

// ── Shared nav row ───────────────────────────────────────────────────────────

function NavRow({
  isHe, onPrev, onNext, nextLabel, nextDisabled, hint,
}: {
  isHe: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  hint?: string;
}) {
  return (
    <div style={{ marginTop: 22 }}>
      {hint && (
        <div style={{ fontSize: 12, color: C.canada, marginBottom: 8 }}>{hint}</div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <button
          onClick={onPrev}
          disabled={!onPrev}
          style={{
            padding: "10px 16px", border: `1px solid ${C.border}`, background: C.white,
            color: C.muted, borderRadius: 4, fontSize: 12, fontWeight: 700,
            letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer",
          }}
        >{isHe ? "← הקודם" : "← Back"}</button>
        <button
          onClick={onNext}
          disabled={nextDisabled}
          style={{
            padding: "10px 18px", border: "none",
            background: nextDisabled ? C.faint : C.usa,
            color: C.white, borderRadius: 4, fontSize: 12, fontWeight: 800,
            letterSpacing: "0.05em", textTransform: "uppercase",
            cursor: nextDisabled ? "not-allowed" : "pointer",
          }}
        >{nextLabel || (isHe ? "הבא ←" : "Next →")}</button>
      </div>
    </div>
  );
}
