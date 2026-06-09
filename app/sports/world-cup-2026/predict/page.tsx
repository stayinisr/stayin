"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toPng } from "html-to-image";
import { supabase } from "../../../../lib/supabase";
import { useLanguage } from "../../../../lib/LanguageContext";
import { teamName, flagImgSrc } from "../../../../lib/teams";
import ShareCard, { SHARE_W, SHARE_H } from "./ShareCard";
import { motion, AnimatePresence } from "framer-motion";
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
  computeTwoSidedBracket,
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
      <style>{`
        @media (max-width: 880px) {
          .predict-group-grid { grid-template-columns: 1fr !important; }
          .predict-group-table-wrap { order: 2; }
          .predict-group-editor-wrap { order: 1; }
        }
        @media (max-width: 520px) {
          .predict-table-row.stats,
          .predict-table-head {
            grid-template-columns: 18px 1fr 26px 32px !important;
          }
          .predict-table-row.stats .cell-w,
          .predict-table-row.stats .cell-d,
          .predict-table-row.stats .cell-gf,
          .predict-table-row.stats .cell-ga,
          .predict-table-head .cell-w,
          .predict-table-head .cell-d,
          .predict-table-head .cell-gf,
          .predict-table-head .cell-ga { display: none !important; }
          .predict-match-card-grid {
            grid-template-columns: 1fr !important;
            row-gap: 8px;
          }
          .predict-match-side {
            justify-content: center !important;
          }
        }
      `}</style>
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
      position: "relative",
      background: `linear-gradient(135deg, ${C.usa} 0%, ${C.navy} 50%, ${C.canada} 90%, ${C.gold} 100%)`,
      color: C.white,
      padding: "26px 16px 22px",
      borderBottom: `1px solid ${C.border}`,
      overflow: "hidden",
    }}>
      {/* Decorative orbs */}
      <div aria-hidden style={{
        position: "absolute", width: 380, height: 380, borderRadius: "50%",
        top: -160, right: -100,
        background: `radial-gradient(circle, ${C.gold}40, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div aria-hidden style={{
        position: "absolute", width: 280, height: 280, borderRadius: "50%",
        bottom: -120, left: "20%",
        background: `radial-gradient(circle, ${C.canada}50, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: 1100, margin: "0 auto",
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <Link
          href="/sports/world-cup-2026"
          style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.75)", textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 10px", borderRadius: 4,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
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
              background: "rgba(0,0,0,0.18)", color: C.white, cursor: "pointer",
              transition: "background 150ms",
            }}
          >
            {isHe ? "התחל מחדש" : "Reset"}
          </button>
        )}
      </div>
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "14px auto 0" }}>
        <div style={{
          fontFamily: fSyne, fontSize: "clamp(26px,3.6vw,38px)", fontWeight: 900,
          letterSpacing: "-0.03em", lineHeight: 1.05,
          display: "inline-flex", alignItems: "center", gap: 12,
        }}>
          <motion.span
            animate={{ rotate: [0, -6, 6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "inline-block" }}
          >🏆</motion.span>
          {title}
        </div>
        <div style={{ fontFamily: fBody(isHe), fontSize: 14, color: "rgba(255,255,255,0.78)", marginTop: 6 }}>{sub}</div>
      </div>

      {step.kind !== "mode" && (
        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: 1100, margin: "18px auto 0",
          display: "flex", flexWrap: "wrap", gap: 6,
        }}>
          {[
            { key: "groups", label: isHe ? "בתים" : "Groups", icon: "🌐", active: step.kind === "group" || step.kind === "tiebreak", done: step.kind !== "group" && step.kind !== "tiebreak" },
            { key: "third", label: isHe ? "8 הטובות ביותר" : "Best 3rd", icon: "🥉", active: step.kind === "bestthird", done: step.kind === "knockout" || step.kind === "summary" },
            { key: "ko", label: isHe ? "נוקאאוט" : "Knockout", icon: "⚔️", active: step.kind === "knockout", done: step.kind === "summary" },
            { key: "sum", label: isHe ? "סיכום" : "Summary", icon: "🏆", active: step.kind === "summary", done: false },
          ].map((c) => (
            <span
              key={c.key}
              style={{
                fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "5px 11px", borderRadius: 99,
                background: c.active
                  ? "rgba(255,255,255,0.22)"
                  : c.done ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.08)",
                color: c.active ? C.white : c.done ? "rgba(255,255,255,0.62)" : "rgba(255,255,255,0.45)",
                border: c.active ? `1px solid rgba(255,255,255,0.4)` : "1px solid transparent",
                display: "inline-flex", alignItems: "center", gap: 5,
                backdropFilter: c.active ? "blur(8px)" : undefined,
              }}
            >
              <span style={{ fontSize: 11 }}>{c.icon}</span>
              {c.label}
            </span>
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
  const modes: { id: Mode; emoji: string; iconBg: string; titleHe: string; titleEn: string; descHe: string; descEn: string; accent: string; gradient: string; durationHe: string; durationEn: string; }[] = [
    {
      id: "full", emoji: "🎯", iconBg: `linear-gradient(135deg, ${C.usa}, #2a5298)`, accent: C.usa,
      titleHe: "חיזוי מלא", titleEn: "Full prediction",
      descHe: "תוצאה מספרית לכל משחק. נקודות, שערים, הפרשים וטבלה — הכל מחושב אוטומטית.",
      descEn: "Numeric score for every match. Auto-compute points, goals, GD and the table.",
      gradient: `linear-gradient(135deg, ${C.usa}, #2a5298 60%, ${C.gold})`,
      durationHe: "~15 דק׳", durationEn: "~15 min",
    },
    {
      id: "partial", emoji: "⚖️", iconBg: `linear-gradient(135deg, ${C.canada}, #ff7676)`, accent: C.canada,
      titleHe: "חיזוי חלקי", titleEn: "Partial prediction",
      descHe: "לכל משחק תבחר ניצחון א׳ / תיקו / ניצחון ב׳. סידור ידני במקרה של תיקו בטבלה.",
      descEn: "Pick W/D/L for each match. Resolve table ties manually when needed.",
      gradient: `linear-gradient(135deg, ${C.canada}, #ff8686 70%, ${C.gold})`,
      durationHe: "~7 דק׳", durationEn: "~7 min",
    },
    {
      id: "quick", emoji: "⚡", iconBg: `linear-gradient(135deg, ${C.mexico}, #1abfb0)`, accent: C.mexico,
      titleHe: "חיזוי מהיר", titleEn: "Quick prediction",
      descHe: "בלי לעבור על משחקים — דרג ידנית את 4 הקבוצות בכל בית.",
      descEn: "Skip matches — just rank the 4 teams in each group.",
      gradient: `linear-gradient(135deg, ${C.mexico}, #1abfb0 70%, ${C.gold})`,
      durationHe: "~3 דק׳", durationEn: "~3 min",
    },
  ];

  return (
    <div style={{ position: "relative" }}>
      {/* Decorative background field — animated soft gradients */}
      <div aria-hidden style={{
        position: "absolute", inset: -40, overflow: "hidden", zIndex: 0,
        pointerEvents: "none", borderRadius: 16,
      }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ duration: 1.2 }}
          style={{
            position: "absolute", width: 460, height: 460, borderRadius: "50%",
            top: -120, left: "-8%",
            background: `radial-gradient(circle, ${C.usa}22, transparent 70%)`,
            filter: "blur(8px)",
          }}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ duration: 1.2, delay: 0.15 }}
          style={{
            position: "absolute", width: 380, height: 380, borderRadius: "50%",
            top: 40, right: "-5%",
            background: `radial-gradient(circle, ${C.canada}22, transparent 70%)`,
            filter: "blur(8px)",
          }}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          style={{
            position: "absolute", width: 320, height: 320, borderRadius: "50%",
            bottom: -100, left: "32%",
            background: `radial-gradient(circle, ${C.gold}33, transparent 70%)`,
            filter: "blur(8px)",
          }}
        />
        {/* Soft animated dots */}
        {[
          { top: "12%", left: "18%", size: 6, delay: 0 },
          { top: "28%", right: "22%", size: 8, delay: 0.4 },
          { top: "60%", left: "12%", size: 5, delay: 0.8 },
          { top: "78%", right: "28%", size: 7, delay: 1.2 },
          { top: "44%", left: "48%", size: 4, delay: 1.6 },
        ].map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.4, 0.9, 0.4],
              scale: [0.8, 1.2, 0.8],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4, delay: d.delay, repeat: Infinity, ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              top: d.top as string, left: (d.left as string) || undefined,
              right: (d.right as string) || undefined,
              width: d.size, height: d.size, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.gold}, ${C.canada})`,
              boxShadow: `0 0 16px ${C.gold}88`,
            }}
          />
        ))}
      </div>

      {state.mode && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(26,191,176,0.10)",
            border: "1px solid rgba(26,191,176,0.30)",
            backdropFilter: "blur(10px)",
            padding: "12px 16px", borderRadius: 10, marginBottom: 22,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 10, flexWrap: "wrap", position: "relative", zIndex: 1,
          }}
        >
          <div style={{ fontSize: 13, color: C.text, fontFamily: fBody(isHe), fontWeight: 500 }}>
            {isHe
              ? "✨ יש לך תחזית פעילה — תוכל להמשיך מהמקום שעצרת."
              : "✨ You have an active prediction — pick up where you left off."}
          </div>
          <button
            onClick={onContinue}
            style={{
              padding: "9px 18px",
              background: `linear-gradient(135deg, ${C.usa}, ${C.canada})`,
              color: C.white, border: "none",
              borderRadius: 6, fontSize: 12, fontWeight: 800, letterSpacing: "0.06em",
              textTransform: "uppercase", cursor: "pointer",
              boxShadow: `0 6px 18px ${C.usa}40`,
            }}
          >{isHe ? "המשך תחזית →" : "Continue →"}</button>
        </motion.div>
      )}

      {/* Hero block with animated trophy + headline */}
      <div style={{
        position: "relative", zIndex: 1, textAlign: "center",
        padding: "10px 0 28px",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 14px", borderRadius: 99,
            background: `linear-gradient(135deg, ${C.usa}15, ${C.canada}15, ${C.gold}15)`,
            border: `1px solid ${C.usa}25`, marginBottom: 14,
            fontSize: 10, fontWeight: 800, letterSpacing: "0.22em",
            textTransform: "uppercase", color: C.usa, fontFamily: fSyne,
          }}
        >
          <motion.span
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "inline-block" }}
          >🏆</motion.span>
          {isHe ? "סימולטור מונדיאל 2026" : "World Cup 2026 Simulator"}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          style={{
            fontFamily: fSyne,
            fontSize: "clamp(36px, 6vw, 56px)",
            fontWeight: 900, letterSpacing: "-0.03em",
            color: C.text, lineHeight: 1.05, marginBottom: 12,
          }}
        >
          {isHe ? (
            <>
              <span>בחר את ה</span>
              <span style={{
                background: `linear-gradient(135deg, ${C.usa}, ${C.canada}, ${C.gold})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>סגנון</span>
              <span> שלך</span>
            </>
          ) : (
            <>
              <span>Pick your </span>
              <span style={{
                background: `linear-gradient(135deg, ${C.usa}, ${C.canada}, ${C.gold})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>style</span>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            fontSize: 15, color: C.muted, maxWidth: 540, margin: "0 auto",
            lineHeight: 1.65, fontFamily: fBody(isHe),
          }}
        >
          {isHe
            ? "מבתי הקבוצות ועד הגמר. כל קבוצה, כל משחק, כל מהלך — בידיים שלך."
            : "From the group stage to the final. Every team, every match, every move — in your hands."}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{
            display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap",
            marginTop: 18, fontFamily: fSyne,
          }}
        >
          {[
            { v: "104", l: isHe ? "משחקים" : "Matches" },
            { v: "48", l: isHe ? "נבחרות" : "Teams" },
            { v: "12", l: isHe ? "בתים" : "Groups" },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em",
                background: `linear-gradient(135deg, ${C.usa}, ${C.canada})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>{s.v}</div>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "0.2em",
                textTransform: "uppercase", color: C.muted, marginTop: 2,
              }}>{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Mode cards grid */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 16,
      }}>
        {modes.map((m, idx) => {
          const selected = state.mode === m.id;
          return (
            <ModeCard
              key={m.id}
              mode={m}
              isHe={isHe}
              selected={selected}
              idx={idx}
              onPick={() => onPick(m.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ModeCard({
  mode, isHe, selected, idx, onPick,
}: {
  mode: {
    id: Mode; emoji: string; iconBg: string;
    titleHe: string; titleEn: string;
    descHe: string; descEn: string;
    accent: string; gradient: string;
    durationHe: string; durationEn: string;
  };
  isHe: boolean;
  selected: boolean;
  idx: number;
  onPick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15 + idx * 0.08, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.985 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onPick}
      style={{
        background: C.white,
        border: `1px solid ${selected ? mode.accent : "#e0e6ef"}`,
        borderRadius: 14, padding: "26px 22px 22px",
        textAlign: isHe ? "right" : "left",
        cursor: "pointer",
        boxShadow: selected
          ? `0 0 0 3px ${mode.accent}26, 0 18px 40px ${mode.accent}20`
          : hover
            ? `0 14px 36px rgba(13,27,62,0.14), 0 0 0 1px ${mode.accent}22`
            : "0 2px 6px rgba(13,27,62,0.05)",
        transition: "box-shadow 200ms",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Top accent bar gradient */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 4,
        background: mode.gradient,
      }} />

      {/* Animated glow on hover */}
      <motion.div
        animate={{ opacity: hover ? 0.6 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "absolute", top: -80, right: -80,
          width: 240, height: 240, borderRadius: "50%",
          background: `radial-gradient(circle, ${mode.accent}25, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Icon block */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 18, gap: 10,
      }}>
        <motion.div
          animate={hover ? { rotate: [-3, 3, -3], scale: 1.08 } : { rotate: 0, scale: 1 }}
          transition={{ duration: 1.2, repeat: hover ? Infinity : 0 }}
          style={{
            width: 56, height: 56, borderRadius: 14,
            background: mode.iconBg,
            display: "grid", placeItems: "center",
            fontSize: 28,
            boxShadow: `0 8px 20px ${mode.accent}38`,
            flexShrink: 0,
          }}
        >{mode.emoji}</motion.div>

        <div style={{
          fontSize: 10, fontWeight: 800, letterSpacing: "0.16em",
          textTransform: "uppercase", color: mode.accent,
          padding: "5px 10px", borderRadius: 99,
          background: `${mode.accent}10`, border: `1px solid ${mode.accent}25`,
          fontFamily: fSyne,
        }}>
          ⏱ {isHe ? mode.durationHe : mode.durationEn}
        </div>
      </div>

      <div style={{
        fontFamily: fSyne, fontSize: 22, fontWeight: 900,
        letterSpacing: "-0.02em", color: C.text, marginBottom: 8,
      }}>
        {isHe ? mode.titleHe : mode.titleEn}
      </div>
      <div style={{
        fontFamily: fBody(isHe), fontSize: 13, color: C.muted, lineHeight: 1.65,
        marginBottom: 16,
      }}>
        {isHe ? mode.descHe : mode.descEn}
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        fontFamily: fSyne, fontSize: 12, fontWeight: 800,
        letterSpacing: "0.06em", textTransform: "uppercase",
        color: mode.accent,
      }}>
        {isHe ? "התחל" : "Start"}
        <motion.span
          animate={hover ? { x: isHe ? -4 : 4 } : { x: 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: "inline-block" }}
        >{isHe ? "←" : "→"}</motion.span>
      </div>
    </motion.button>
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
        <div className="predict-group-editor-wrap">
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

        <div className="predict-group-table-wrap">
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

      <div className="predict-match-card-grid" style={{
        display: "grid",
        gridTemplateColumns: state.mode === "full" ? "1fr 110px 1fr" : "1fr auto 1fr",
        alignItems: "center", gap: 10,
      }}>
        <div className="predict-match-side" style={{
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

        <div className="predict-match-side" style={{
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
          <div
            key={r.team + i}
            className={"predict-table-row " + (mode === "quick" || compact ? "rank" : "stats")}
            style={{
              display: "grid",
              gridTemplateColumns: mode === "quick" || compact
                ? "20px 1fr"
                : "20px 1fr 24px 24px 24px 30px 30px 30px",
              alignItems: "center", gap: 6,
              padding: "6px 4px",
              borderBottom: i < table.rows.length - 1 ? `1px solid ${C.border}` : "none",
            }}
          >
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
                <CellNum className="cell-p" value={r.played} />
                <CellNum className="cell-w" value={r.won} />
                <CellNum className="cell-d" value={r.drawn} />
                <CellNum className="cell-gf" value={r.gf} muted />
                <CellNum className="cell-ga" value={r.ga} muted />
                <CellNum className="cell-pts" value={r.points} bold />
              </>
            )}
          </div>
        ))}
      </div>

      {!(mode === "quick" || compact) && (
        <div
          className="predict-table-head"
          style={{
            display: "grid",
            gridTemplateColumns: "20px 1fr 24px 24px 24px 30px 30px 30px",
            gap: 6, marginTop: 6, paddingTop: 4, borderTop: `1px solid ${C.border}`,
            fontSize: 9, color: C.hint, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
          }}
        >
          <span /><span /><span className="cell-p">{labels.p}</span><span className="cell-w">{labels.w}</span><span className="cell-d">{labels.d}</span><span className="cell-gf">{labels.gf}</span><span className="cell-ga">{labels.ga}</span><span className="cell-pts">{labels.pts}</span>
        </div>
      )}
    </div>
  );
}

function CellNum({ value, muted, bold, className }: { value: number; muted?: boolean; bold?: boolean; className?: string }) {
  return (
    <div className={className} style={{
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

  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div>
      {shareOpen && (
        <ShareModal
          isHe={isHe}
          champion={champion}
          authorName={authEmail ? authEmail.split("@")[0] || null : null}
          state={state}
          matches={matches}
          tables={tables}
          thirdsAssignment={thirdsAssignment}
          onClose={() => setShareOpen(false)}
        />
      )}
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
              onClick={() => setShareOpen(true)}
              style={{
                padding: "10px 18px", background: C.white, color: C.text, border: "none",
                borderRadius: 4, fontSize: 12, fontWeight: 800, letterSpacing: "0.05em",
                textTransform: "uppercase", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              <span style={{ fontSize: 14 }}>📸</span>
              {isHe ? "שתף תמונה" : "Share image"}
            </button>
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
  const bracket = useMemo(() => computeTwoSidedBracket(matches), [matches]);
  const champPath = useMemo(
    () => getChampionPath(matches, state.knockoutWinners),
    [matches, state.knockoutWinners],
  );

  // Card geometry — compact cards so the whole bracket fits with room
  // to breathe. Deeper rounds use space-around so they sit centred between
  // their two feeders.
  const BOX_H = 46;
  const R32_GAP = 6;
  const R32_COUNT = Math.max(bracket.r32L.length, bracket.r32R.length);
  const totalH = Math.max(1, R32_COUNT) * (BOX_H + R32_GAP) + 20;

  // Quick lookup: is a given match on the LEFT half of the bracket?
  // The Final is in neither half; SF_L/Final are LEFT, SF_R is RIGHT.
  const leftIds = useMemo(() => {
    const s = new Set<string>();
    for (const arr of [bracket.r32L, bracket.r16L, bracket.qfL]) for (const m of arr) s.add(m.id);
    if (bracket.sfL) s.add(bracket.sfL.id);
    return s;
  }, [bracket]);

  // ── Connector lines (SVG overlay) ────────────────────────────────────────
  // After mount we measure each card's DOM rect and draw an SVG "C" path
  // from each feeder's outer edge to its child's inner edge. Side detection
  // is based on the FEEDER's position so the SF→Final connectors (one from
  // each half) render correctly.
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const setCardRef = (id: string) => (el: HTMLDivElement | null) => {
    cardRefs.current.set(id, el);
  };
  type Line = { d: string; gold: boolean };
  const [lines, setLines] = useState<Line[]>([]);
  const [svgSize, setSvgSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    function recompute() {
      const c = containerRef.current;
      if (!c) return;
      const cb = c.getBoundingClientRect();
      setSvgSize({ w: c.scrollWidth, h: c.scrollHeight });

      const byNum = new Map(matches.map((m) => [m.fifa_match_number, m]));
      const next: Line[] = [];
      const koMatches = matches.filter(
        (m) => !m.stage.startsWith("Group") && m.stage !== "Third Place",
      );
      for (const child of koMatches) {
        const childEl = cardRefs.current.get(child.id);
        if (!childEl) continue;
        const cr = childEl.getBoundingClientRect();
        const slots = [child.home_team_name, child.away_team_name];
        for (const raw of slots) {
          if (!raw) continue;
          const m = raw.match(/^W(\d+)$/);
          if (!m) continue;
          const feederNum = parseInt(m[1]!, 10);
          const feeder = byNum.get(feederNum);
          if (!feeder) continue;
          const feederEl = cardRefs.current.get(feeder.id);
          if (!feederEl) continue;
          const fr = feederEl.getBoundingClientRect();

          // Side decided by FEEDER position — works for left-half pairs,
          // right-half pairs, and the two SF→Final connectors.
          const feederOnLeft = leftIds.has(feeder.id);

          const fy = fr.top + fr.height / 2 - cb.top;
          const cy = cr.top + cr.height / 2 - cb.top;
          let fx: number, cx: number;
          if (feederOnLeft) {
            fx = fr.right - cb.left;
            cx = cr.left - cb.left;
          } else {
            fx = fr.left - cb.left;
            cx = cr.right - cb.left;
          }
          const mx = (fx + cx) / 2;
          const d = `M ${fx} ${fy} L ${mx} ${fy} L ${mx} ${cy} L ${cx} ${cy}`;
          const gold = champPath.has(child.id) && champPath.has(feeder.id);
          next.push({ d, gold });
        }
      }
      setLines(next);
    }
    recompute();
    // Re-measure after fonts/images load and on resize. The ResizeObserver
    // catches reflows from late-loading flag images that would otherwise
    // leave half the connector lines pointing at stale positions.
    const t1 = setTimeout(recompute, 150);
    const t2 = setTimeout(recompute, 600);
    window.addEventListener("resize", recompute);
    let ro: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(recompute);
      ro.observe(containerRef.current);
    }
    // Re-measure each time a flag <img> finishes loading.
    const imgs = containerRef.current?.querySelectorAll("img") ?? [];
    const onLoad = () => recompute();
    imgs.forEach((img) => img.addEventListener("load", onLoad));
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", recompute);
      ro?.disconnect();
      imgs.forEach((img) => img.removeEventListener("load", onLoad));
    };
  }, [bracket, matches, champPath, state.knockoutWinners, leftIds]);

  // ── Render helpers ──────────────────────────────────────────────────────
  function renderCard(m: MatchItem, opts?: { hideHeader?: boolean }) {
    const r = resolveKnockoutTeams(m, matches, tables, state.knockoutWinners, thirdsAssignment, isHe);
    const winnerSide = state.knockoutWinners[m.id];
    const onPath = champPath.has(m.id);
    return (
      <BracketCard
        key={m.id}
        innerRef={setCardRef(m.id)}
        isHe={isHe}
        match={m}
        homeTeam={r.home}
        awayTeam={r.away}
        homeLabel={r.homeLabel}
        awayLabel={r.awayLabel}
        winnerSide={winnerSide}
        onPath={onPath}
        hideHeader={opts?.hideHeader}
        boxHeight={BOX_H}
      />
    );
  }

  function renderColumn(label: string, items: MatchItem[], height: number) {
    return (
      <div style={{
        flex: "0 0 auto", minWidth: 188, display: "flex", flexDirection: "column",
      }}>
        <div style={{
          fontSize: 10, fontWeight: 800, letterSpacing: "0.2em",
          textTransform: "uppercase", color: C.usa, marginBottom: 12,
          textAlign: "center", fontFamily: fSyne,
          paddingBottom: 6, borderBottom: `1px solid ${C.border}`,
        }}>{label}</div>
        <div style={{
          height, display: "flex", flexDirection: "column",
          justifyContent: "space-around", gap: 0,
        }}>
          {items.map((m) => renderCard(m))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Scrollable bracket area — forced LTR so the canonical
          left-half/center/right-half orientation renders the same way
          regardless of page language. Card text still respects its own
          direction inside. */}
      <div style={{ overflowX: "auto", paddingBottom: 16 }} dir="ltr">
        <div
          ref={containerRef}
          style={{
            position: "relative",
            display: "flex", alignItems: "flex-start",
            gap: 22, minWidth: 1400, padding: "8px 4px 8px",
          }}
        >
          <svg
            style={{
              position: "absolute", top: 0, left: 0,
              width: svgSize.w, height: svgSize.h,
              pointerEvents: "none", zIndex: 1,
            }}
          >
            {lines.map((l, i) => (
              <path
                key={i}
                d={l.d}
                fill="none"
                stroke={l.gold ? C.gold : "#a8b1c5"}
                strokeWidth={l.gold ? 2.6 : 1.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={l.gold ? 0.95 : 0.65}
              />
            ))}
          </svg>

          {/* LEFT HALF */}
          <div style={{ display: "flex", gap: 22, position: "relative", zIndex: 2 }}>
            {renderColumn(stageLabel("Round of 32", isHe), bracket.r32L, totalH)}
            {renderColumn(stageLabel("Round of 16", isHe), bracket.r16L, totalH)}
            {renderColumn(stageLabel("Quarter Finals", isHe), bracket.qfL, totalH)}
            {renderColumn(stageLabel("Semi Finals", isHe), bracket.sfL ? [bracket.sfL] : [], totalH)}
          </div>

          {/* CENTER: Final */}
          <div style={{
            flex: "0 0 auto", minWidth: 230,
            display: "flex", flexDirection: "column", alignItems: "center",
            position: "relative", zIndex: 2,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 900, letterSpacing: "0.32em",
              textTransform: "uppercase",
              background: `linear-gradient(135deg, ${C.usa}, ${C.canada}, ${C.gold})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 12, fontFamily: fSyne, textAlign: "center",
              paddingBottom: 6, borderBottom: `1px solid ${C.border}`,
              width: "100%",
            }}>
              🏆 {stageLabel("Final", isHe)}
            </div>
            <div style={{
              height: totalH, display: "flex", flexDirection: "column",
              justifyContent: "center", width: "100%",
            }}>
              {bracket.final && (
                <div style={{ position: "relative" }}>
                  {/* Pulse halo */}
                  <motion.div
                    aria-hidden
                    animate={{ scale: [1, 1.06, 1], opacity: [0.45, 0.7, 0.45] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      position: "absolute", inset: -8, borderRadius: 14,
                      background: `radial-gradient(circle, ${C.gold}80, transparent 70%)`,
                      pointerEvents: "none", zIndex: 0,
                    }}
                  />
                  <div style={{
                    position: "relative", zIndex: 1,
                    padding: 3, borderRadius: 10,
                    background: `linear-gradient(135deg, ${C.gold}, ${C.canada}, ${C.usa})`,
                    boxShadow: `0 14px 32px ${C.gold}50`,
                  }}>
                    {renderCard(bracket.final)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT HALF */}
          <div style={{ display: "flex", gap: 22, position: "relative", zIndex: 2 }}>
            {renderColumn(stageLabel("Semi Finals", isHe), bracket.sfR ? [bracket.sfR] : [], totalH)}
            {renderColumn(stageLabel("Quarter Finals", isHe), bracket.qfR, totalH)}
            {renderColumn(stageLabel("Round of 16", isHe), bracket.r16R, totalH)}
            {renderColumn(stageLabel("Round of 32", isHe), bracket.r32R, totalH)}
          </div>
        </div>
      </div>

      {/* Third place — separate section to avoid SVG / scroll-area overlap */}
      {bracket.third && (
        <div style={{
          marginTop: 36, padding: "16px 18px",
          background: `linear-gradient(135deg, #fff 0%, #fffaf0 100%)`,
          border: `1px solid #d4b88e`, borderRadius: 10,
          boxShadow: "0 4px 14px rgba(13,27,62,0.07)",
          maxWidth: 420,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 800, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "#8a5a00", marginBottom: 12,
            fontFamily: fSyne, display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>🥉</span>
            {stageLabel("Third Place", isHe)}
          </div>
          {renderCard(bracket.third)}
        </div>
      )}
    </div>
  );
}

function BracketCard({
  isHe, match, homeTeam, awayTeam, homeLabel, awayLabel, winnerSide, onPath,
  hideHeader, boxHeight, innerRef,
}: {
  isHe: boolean;
  match: MatchItem;
  homeTeam: string | null;
  awayTeam: string | null;
  homeLabel: string;
  awayLabel: string;
  winnerSide: "home" | "away" | undefined;
  onPath: boolean;
  hideHeader?: boolean;
  boxHeight?: number;
  innerRef?: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div>
      {!hideHeader && (
        <div style={{
          display: "flex", alignItems: "baseline", gap: 6,
          margin: "0 4px 5px", fontFamily: fSyne,
          justifyContent: "space-between",
        }}>
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: onPath ? C.gold : C.usa, opacity: onPath ? 1 : 0.85,
          }}>#{match.fifa_match_number}</span>
          {match.city && (
            <span style={{
              fontSize: 8, fontWeight: 600, letterSpacing: "0.08em",
              textTransform: "uppercase", color: C.muted, opacity: 0.7,
              maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>{match.city}</span>
          )}
        </div>
      )}
      <div
        ref={innerRef}
        style={{
          background: C.white,
          border: `1px solid ${onPath ? C.gold : "#b9c1d1"}`,
          boxShadow: onPath
            ? `0 0 0 2px ${C.gold}, 0 6px 16px rgba(212,160,23,0.22)`
            : "0 1px 3px rgba(13,27,62,0.10), 0 1px 1px rgba(13,27,62,0.06)",
          borderRadius: 5, overflow: "hidden", position: "relative",
          height: boxHeight,
        }}
      >
        <BracketSide isHe={isHe} won={winnerSide === "home"} team={homeTeam} label={homeLabel} />
        <div style={{ height: 1, background: "#d4dbe8" }} />
        <BracketSide isHe={isHe} won={winnerSide === "away"} team={awayTeam} label={awayLabel} />
      </div>
    </div>
  );
}

function BracketSide({ isHe, won, team, label }: { isHe: boolean; won: boolean; team: string | null; label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6, padding: "4px 9px",
      background: won ? "rgba(212,160,23,0.20)" : "transparent",
      color: won ? "#5a3d00" : team ? C.text : C.muted,
      fontWeight: won ? 800 : 700,
      flex: 1, minHeight: 0,
    }}>
      {team && flagImgSrc(team) && (
        <span style={{ width: 16, height: 12, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
          <img src={flagImgSrc(team)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </span>
      )}
      <span style={{
        fontFamily: isHe ? fHe : fEn, fontSize: 11.5,
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

// ── Share modal ──────────────────────────────────────────────────────────────

function ShareModal({
  isHe, champion, authorName, state, matches, tables, thirdsAssignment, onClose,
}: {
  isHe: boolean;
  champion: string | null;
  authorName: string | null;
  state: PredictionState;
  matches: MatchItem[];
  tables: any[];
  thirdsAssignment: Record<number, GroupLetter>;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewportW, setViewportW] = useState(typeof window === "undefined" ? 800 : window.innerWidth);

  useEffect(() => {
    setMounted(true);
    const handler = () => setViewportW(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Preview scale — render the 1080×1350 card scaled down so users see it
  // before they share. Cap the preview at 360px wide on mobile.
  const isMobile = viewportW < 640;
  const previewW = Math.min(viewportW - 64, isMobile ? 360 : 440);
  const scale = previewW / SHARE_W;
  const previewH = SHARE_H * scale;

  async function waitReady(el: HTMLElement) {
    const imgs = Array.from(el.querySelectorAll("img"));
    await Promise.all(imgs.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((res) => { img.onload = img.onerror = () => res(); }),
    ));
    if ((document as any).fonts?.ready) await (document as any).fonts.ready;
    await new Promise<void>((res) => setTimeout(res, 600));
  }

  async function makeImage(): Promise<string | null> {
    if (!cardRef.current) return null;
    setBusy(true);
    try {
      await waitReady(cardRef.current);
      const opts = { cacheBust: true, pixelRatio: 2, backgroundColor: "#fdfbf6" };
      // Run twice — first run primes image decoding in html-to-image, the
      // second produces a clean snapshot. Same pattern as ShareAllTicket.
      await toPng(cardRef.current, opts);
      await new Promise<void>((res) => setTimeout(res, 120));
      return await toPng(cardRef.current, opts);
    } finally {
      setBusy(false);
    }
  }

  async function handleDownload() {
    const url = await makeImage();
    if (!url) return;
    const a = document.createElement("a");
    a.download = "stayin-wc2026-prediction.png";
    a.href = url;
    a.click();
  }

  async function handleShare() {
    const url = await makeImage();
    const text = champion
      ? (isHe
        ? `התחזית שלי למונדיאל 2026 ב-Stayin 🏆\nהאלופה: ${teamName(champion, true)}\nstayin.co.il`
        : `My World Cup 2026 prediction on Stayin 🏆\nChampion: ${teamName(champion, false)}\nstayin.co.il`)
      : (isHe ? "התחזית שלי למונדיאל 2026 ב-Stayin" : "My World Cup 2026 prediction on Stayin");

    if (url && (navigator as any).canShare) {
      try {
        const blob = await (await fetch(url)).blob();
        const file = new File([blob], "stayin-wc2026-prediction.png", { type: "image/png" });
        if ((navigator as any).canShare({ files: [file] })) {
          await (navigator as any).share({ title: "Stayin · WC 2026", text, files: [file] });
          return;
        }
      } catch { /* fall through */ }
    }
    // Fallback: WhatsApp web share with text only (no file).
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  if (!mounted) return null;

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 999999,
        background: "rgba(5,12,28,0.72)", backdropFilter: "blur(14px)",
        display: "flex", alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center", padding: isMobile ? 0 : 18,
      }}
    >
      <div
        dir={isHe ? "rtl" : "ltr"}
        style={{
          width: isMobile ? "100%" : "min(560px,100%)",
          maxHeight: "94vh", overflowY: "auto", overflowX: "hidden",
          borderRadius: isMobile ? "28px 28px 0 0" : 24,
          background: "rgba(255,255,255,0.97)",
          boxShadow: "0 -40px 90px rgba(13,27,62,0.2)",
        }}
      >
        {isMobile && (
          <div style={{
            width: 36, height: 4, background: "#e2e8f0",
            borderRadius: 99, margin: "12px auto 0",
          }} />
        )}

        <div style={{
          padding: "16px 20px 12px",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          borderBottom: "1px solid rgba(13,27,62,0.06)",
        }}>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 800, letterSpacing: "0.16em",
              textTransform: "uppercase", color: C.usa, marginBottom: 4,
              fontFamily: fSyne,
            }}>Stayin · {isHe ? "שיתוף" : "Share"}</div>
            <div style={{
              fontSize: 18, fontWeight: 900, color: C.text, letterSpacing: "-0.01em",
            }}>{isHe ? "שתף את התחזית" : "Share your prediction"}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
              {isHe ? "תמונה מוכנה לוואטסאפ ואינסטגרם" : "Ready for WhatsApp & Instagram"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10, background: "#f1f5f9",
              border: "1px solid #e8edf5", color: C.muted, fontSize: 16,
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
            }}
          >×</button>
        </div>

        {/* Preview area */}
        <div style={{
          margin: "14px 16px", borderRadius: 18, overflow: "hidden",
          boxShadow: "0 8px 36px rgba(13,27,62,0.16), 0 0 0 1px rgba(13,27,62,0.06)",
          background: "#fdfbf6",
        }}>
          <div style={{
            width: "100%", height: Math.ceil(previewH),
            overflow: "hidden", display: "flex",
            justifyContent: "center", alignItems: "flex-start",
          }}>
            <div style={{
              width: SHARE_W, height: SHARE_H,
              transform: `scale(${scale})`, transformOrigin: "top left",
              flexShrink: 0,
            }}>
              <div ref={cardRef} style={{ width: SHARE_W, height: SHARE_H }}>
                <ShareCard
                  isHe={isHe}
                  state={state}
                  matches={matches}
                  tables={tables}
                  thirdsAssignment={thirdsAssignment}
                  authorName={authorName}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{
          margin: "0 16px 14px", padding: "10px 14px",
          background: "rgba(212,160,23,0.08)",
          border: "1px solid rgba(212,160,23,0.22)",
          borderRadius: 10, display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: C.gold, flexShrink: 0,
          }} />
          <div style={{ fontSize: 11, color: "#5a4500", fontWeight: 500, lineHeight: 1.4 }}>
            {isHe
              ? "פתחתי תמונה — שתף לוואטסאפ או שמור לאינסטגרם סטוריז"
              : "PNG ready — share to WhatsApp or save for Instagram stories"}
          </div>
        </div>

        <div style={{ padding: "0 16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            onClick={handleShare}
            disabled={busy}
            style={{
              width: "100%", height: 56, borderRadius: 16, border: "none",
              cursor: busy ? "wait" : "pointer",
              background: "linear-gradient(135deg,#25D366,#20BA5A)",
              color: "#fff", display: "flex", alignItems: "center", gap: 12,
              padding: "0 20px", boxShadow: "0 4px 16px rgba(37,211,102,0.3)",
              opacity: busy ? 0.7 : 1,
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}>💬</div>
            <div style={{ flex: 1, textAlign: isHe ? "right" : "left" }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>
                {busy
                  ? (isHe ? "מכין תמונה..." : "Creating image...")
                  : (isHe ? "שתף בוואטסאפ" : "Share on WhatsApp")}
              </div>
              {!busy && (
                <div style={{ fontSize: 10, opacity: 0.75, marginTop: 1 }}>
                  {isHe ? "התחזית כתמונה לקבוצה / סטטוס" : "Image to group or status"}
                </div>
              )}
            </div>
            <div style={{ fontSize: 16, opacity: 0.7 }}>{isHe ? "←" : "→"}</div>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={busy}
            style={{
              width: "100%", height: 52, borderRadius: 14,
              border: `1px solid ${C.usa}26`,
              cursor: busy ? "wait" : "pointer",
              background: `${C.usa}10`,
              color: C.usa, display: "flex", alignItems: "center", gap: 12,
              padding: "0 16px", opacity: busy ? 0.7 : 1,
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: `${C.usa}18`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, flexShrink: 0,
            }}>⬇</div>
            <div style={{ flex: 1, textAlign: isHe ? "right" : "left" }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>
                {busy
                  ? (isHe ? "..." : "...")
                  : (isHe ? "הורד תמונה" : "Download PNG")}
              </div>
              <div style={{ fontSize: 10, opacity: 0.75, marginTop: 1 }}>
                {isHe ? "לשמירה ופרסום באינסטגרם" : "Save and post to Instagram"}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
