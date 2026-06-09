"use client";

import { teamName, flagImgSrc } from "../../../../lib/teams";
import {
  computeTwoSidedBracket,
  parseSlot,
  resolveKnockoutTeams,
  type GroupLetter,
  type GroupTable,
  type MatchItem,
  type PredictionState,
} from "./logic";

const C = {
  navy: "#0d1b3e",
  navyMid: "#1a3a6b",
  red: "#e63946",
  green: "#006847",
  gold: "#d4a017",
  goldDark: "#8a5a00",
  white: "#ffffff",
  cream: "#fdfbf6",
  border: "#b9c1d1",
  muted: "#64748b",
};

const LOGO_SRC = "/stayin-share-logo.png";
const fSyne = "var(--font-syne,'Plus Jakarta Sans','Heebo',sans-serif)";
const fHe = "var(--font-he,'Heebo',sans-serif)";

// Fixed 1500×1500 square card — works great on Instagram and WhatsApp
// without horizontal cropping. The bracket is rendered with hardcoded
// coordinates so the SVG connectors don't need a DOM-measurement pass.
export const BRACKET_SHARE_W = 1500;
export const BRACKET_SHARE_H = 1500;

// ── Bracket grid ─────────────────────────────────────────────────────────────
// All coordinates are within the 1500x1500 canvas.
const CARD_W = 132;
const CARD_H = 56;
const ROW_H_R32 = 80;   // vertical spacing between R32 cards
const COL_GAP_X = 36;   // horizontal gap between columns

// Bracket grid origin (top-left of leftmost R32 column).
const GRID_TOP = 320;
const GRID_LEFT_X = 60;
const COL_W = CARD_W + COL_GAP_X;

// Column x positions (left half)
const X_R32_L = GRID_LEFT_X;
const X_R16_L = X_R32_L + COL_W;
const X_QF_L  = X_R16_L + COL_W;
const X_SF_L  = X_QF_L  + COL_W;
// Final
const X_FINAL = X_SF_L  + COL_W + 24;
// Right half (mirrored)
const X_SF_R  = X_FINAL + COL_W + 24;
const X_QF_R  = X_SF_R  + COL_W;
const X_R16_R = X_QF_R  + COL_W;
const X_R32_R = X_R16_R + COL_W;

// Card Y positions per round.
// R32: 8 boxes per side, top-stacked.
function yR32(i: number) { return GRID_TOP + i * ROW_H_R32; }
// R16: centered between pairs of R32.
function yR16(i: number) { return (yR32(i * 2) + yR32(i * 2 + 1)) / 2; }
// QF: between pairs of R16.
function yQF(i: number)  { return (yR16(i * 2) + yR16(i * 2 + 1)) / 2; }
// SF: between pairs of QF.
function ySF(i: number)  { return (yQF(i * 2) + yQF(i * 2 + 1)) / 2; }
// Final centered.
function yFinal() { return (ySF(0) + ySF(1)) / 2; }

export default function BracketShareCard({
  isHe,
  state,
  matches,
  tables,
  thirdsAssignment,
  authorName,
}: {
  isHe: boolean;
  state: PredictionState;
  matches: MatchItem[];
  tables: GroupTable[];
  thirdsAssignment: Record<number, GroupLetter>;
  authorName?: string | null;
}) {
  const bracket = computeTwoSidedBracket(matches);
  const champPath = new Set<string>();
  // Walk champion path
  (function walk() {
    if (!bracket.final) return;
    const byNum = new Map(matches.map((m) => [m.fifa_match_number, m]));
    function visit(m: MatchItem) {
      const w = state.knockoutWinners[m.id];
      if (!w) return;
      champPath.add(m.id);
      const wantSide = w === "home" ? m.home_team_name : m.away_team_name;
      const slot = parseSlot(wantSide);
      if (slot.kind === "winner") {
        const up = byNum.get(slot.matchNumber);
        if (up) visit(up);
      }
    }
    visit(bracket.final);
  })();

  // ── Compute each match's (x, y) on the canvas ────────────────────────────
  const positions = new Map<string, { x: number; y: number; side: "L" | "R" | "C" }>();
  bracket.r32L.forEach((m, i) => positions.set(m.id, { x: X_R32_L, y: yR32(i), side: "L" }));
  bracket.r16L.forEach((m, i) => positions.set(m.id, { x: X_R16_L, y: yR16(i), side: "L" }));
  bracket.qfL.forEach( (m, i) => positions.set(m.id, { x: X_QF_L,  y: yQF(i),  side: "L" }));
  if (bracket.sfL) positions.set(bracket.sfL.id, { x: X_SF_L, y: ySF(0), side: "L" });
  if (bracket.final) positions.set(bracket.final.id, { x: X_FINAL, y: yFinal(), side: "C" });
  if (bracket.sfR) positions.set(bracket.sfR.id, { x: X_SF_R, y: ySF(1), side: "R" });
  bracket.qfR.forEach( (m, i) => positions.set(m.id, { x: X_QF_R,  y: yQF(i + 2),  side: "R" }));
  bracket.r16R.forEach((m, i) => positions.set(m.id, { x: X_R16_R, y: yR16(i + 4), side: "R" }));
  bracket.r32R.forEach((m, i) => positions.set(m.id, { x: X_R32_R, y: yR32(i + 8), side: "R" }));

  // ── Compute connector paths ──────────────────────────────────────────────
  type Line = { d: string; gold: boolean };
  const lines: Line[] = [];
  const allKo = matches.filter((m) => !m.stage.startsWith("Group") && m.stage !== "Third Place");
  const byNum = new Map(matches.map((m) => [m.fifa_match_number, m]));

  for (const child of allKo) {
    const cPos = positions.get(child.id);
    if (!cPos) continue;
    for (const raw of [child.home_team_name, child.away_team_name]) {
      if (!raw) continue;
      const m = raw.match(/^W(\d+)$/);
      if (!m) continue;
      const feederNum = parseInt(m[1]!, 10);
      const feeder = byNum.get(feederNum);
      if (!feeder) continue;
      const fPos = positions.get(feeder.id);
      if (!fPos) continue;
      // Feeder card center y; feeder side dictates which edge to use.
      const feederIsLeft = fPos.side === "L";
      const fy = fPos.y + CARD_H / 2;
      const cy = cPos.y + CARD_H / 2;
      let fx: number, cx: number;
      if (feederIsLeft) {
        fx = fPos.x + CARD_W; // right edge
        cx = cPos.x;          // left edge of child
      } else {
        fx = fPos.x;          // left edge
        cx = cPos.x + CARD_W; // right edge of child
      }
      const mx = (fx + cx) / 2;
      const d = `M ${fx} ${fy} L ${mx} ${fy} L ${mx} ${cy} L ${cx} ${cy}`;
      const gold = champPath.has(child.id) && champPath.has(feeder.id);
      lines.push({ d, gold });
    }
  }

  // Helper: resolve teams for a match
  function resolveCard(m: MatchItem) {
    return resolveKnockoutTeams(m, matches, tables, state.knockoutWinners, thirdsAssignment, isHe);
  }

  const finalMatch = bracket.final;
  const finalResolved = finalMatch ? resolveCard(finalMatch) : null;
  const championPick = finalMatch ? state.knockoutWinners[finalMatch.id] : undefined;
  const champion =
    finalResolved && championPick
      ? championPick === "home" ? finalResolved.home : finalResolved.away
      : null;

  return (
    <div
      style={{
        width: BRACKET_SHARE_W,
        height: BRACKET_SHARE_H,
        position: "relative",
        background: `linear-gradient(165deg, ${C.cream} 0%, #f4ecd6 35%, #f8d9a8 70%, #f4b88a 100%)`,
        fontFamily: fHe,
        direction: "ltr", // bracket always renders LTR
        overflow: "hidden",
        color: C.navy,
      }}
    >
      {/* Background decorations */}
      <div style={{
        position: "absolute", width: 800, height: 800, borderRadius: "50%",
        top: -300, left: -250,
        background: `radial-gradient(circle, ${C.navyMid}1f, transparent 65%)`,
      }} />
      <div style={{
        position: "absolute", width: 700, height: 700, borderRadius: "50%",
        bottom: -260, right: -200,
        background: `radial-gradient(circle, ${C.red}1f, transparent 65%)`,
      }} />
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        top: 280, right: 200,
        background: `radial-gradient(circle, ${C.gold}26, transparent 70%)`,
      }} />

      {/* Top stripe */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 10,
        background: `linear-gradient(90deg, ${C.navyMid} 33%, ${C.red} 33% 66%, ${C.green} 66%)`,
      }} />

      {/* Header */}
      <div style={{
        position: "absolute", top: 56, left: 60, right: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        zIndex: 5,
      }}>
        <img
          src={LOGO_SRC}
          alt="Stayin"
          crossOrigin="anonymous"
          style={{ height: 64, objectFit: "contain" }}
        />
        <div style={{
          fontSize: 22, fontWeight: 800, color: C.navy,
          letterSpacing: "0.1em", textTransform: "uppercase",
          fontFamily: fSyne, opacity: 0.7,
        }}>
          STAYIN.CO.IL
        </div>
      </div>

      {/* Title */}
      <div style={{
        position: "absolute", top: 150, left: 0, right: 0,
        textAlign: "center", zIndex: 5,
      }}>
        <div style={{
          fontSize: 18, fontWeight: 800, color: C.navyMid,
          letterSpacing: "0.32em", textTransform: "uppercase",
          fontFamily: fSyne, marginBottom: 12,
        }}>
          {isHe ? "סימולטור מונדיאל 2026" : "World Cup 2026 Simulator"}
        </div>
        <div style={{
          fontSize: 56, fontWeight: 900, color: C.navy,
          fontFamily: fHe, letterSpacing: "-0.02em", lineHeight: 1,
        }}>
          {isHe ? "עץ הנוקאאוט שלי" : "My Knockout Bracket"}
        </div>
        {authorName && (
          <div style={{
            fontSize: 18, color: C.navy, opacity: 0.7,
            marginTop: 8, fontWeight: 600,
          }}>{authorName}</div>
        )}
      </div>

      {/* Round labels at top of each column */}
      <div style={{ position: "absolute", top: 270, left: 0, right: 0, zIndex: 4 }}>
        {[
          { x: X_R32_L, label: "R32" },
          { x: X_R16_L, label: "R16" },
          { x: X_QF_L,  label: "QF"  },
          { x: X_SF_L,  label: "SF"  },
          { x: X_FINAL, label: isHe ? "גמר" : "FINAL", isFinal: true },
          { x: X_SF_R,  label: "SF"  },
          { x: X_QF_R,  label: "QF"  },
          { x: X_R16_R, label: "R16" },
          { x: X_R32_R, label: "R32" },
        ].map((col, i) => (
          <div key={i} style={{
            position: "absolute", left: col.x, top: 0,
            width: CARD_W, textAlign: "center",
            fontSize: col.isFinal ? 13 : 10,
            fontWeight: 900, fontFamily: fSyne,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: col.isFinal ? C.gold : C.navyMid,
          }}>
            {col.isFinal && "🏆 "}{col.label}
          </div>
        ))}
      </div>

      {/* SVG connector overlay */}
      <svg
        style={{
          position: "absolute", top: 0, left: 0,
          width: BRACKET_SHARE_W, height: BRACKET_SHARE_H,
          pointerEvents: "none", zIndex: 2,
        }}
      >
        {lines.map((l, i) => (
          <path
            key={i}
            d={l.d}
            fill="none"
            stroke={l.gold ? C.gold : "#9aa5bb"}
            strokeWidth={l.gold ? 3 : 1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={l.gold ? 0.95 : 0.7}
          />
        ))}
      </svg>

      {/* Render every match card */}
      {[...positions.entries()].map(([id, pos]) => {
        const m = matches.find((x) => x.id === id);
        if (!m) return null;
        const r = resolveCard(m);
        const isFinal = pos.side === "C";
        return (
          <Card
            key={id}
            isHe={isHe}
            x={pos.x}
            y={pos.y}
            w={CARD_W}
            h={CARD_H}
            home={r.home}
            away={r.away}
            homeLabel={r.homeLabel}
            awayLabel={r.awayLabel}
            winnerSide={state.knockoutWinners[m.id]}
            matchNum={m.fifa_match_number}
            onPath={champPath.has(m.id)}
            isFinal={isFinal}
          />
        );
      })}

      {/* Champion footer */}
      <div style={{
        position: "absolute", bottom: 60, left: 60, right: 60,
        background: C.navy, borderRadius: 20, padding: "22px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 20px 40px rgba(13,27,62,0.30)",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ fontSize: 44 }}>🏆</div>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 800, letterSpacing: "0.28em",
              textTransform: "uppercase", color: C.gold,
              fontFamily: fSyne, marginBottom: 4,
            }}>
              {isHe ? "האלופה שלי" : "My Champion"}
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
            }}>
              {champion && flagImgSrc(champion) && (
                <span style={{
                  width: 56, height: 40, borderRadius: 5, overflow: "hidden",
                  border: `2px solid ${C.gold}`, flexShrink: 0,
                }}>
                  <img
                    src={flagImgSrc(champion).replace("/w40/", "/w160/")}
                    alt=""
                    crossOrigin="anonymous"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </span>
              )}
              <div style={{
                fontSize: 36, fontWeight: 900, color: C.white,
                fontFamily: fHe, letterSpacing: "-0.01em",
              }}>
                {champion ? teamName(champion, isHe) : (isHe ? "טרם נקבעה" : "TBD")}
              </div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: "0.28em",
            textTransform: "uppercase", color: C.gold,
            fontFamily: fSyne, marginBottom: 4,
          }}>
            {isHe ? "צור את שלך" : "Build your own"}
          </div>
          <div style={{
            fontSize: 22, fontWeight: 800, color: C.white,
            fontFamily: fSyne,
          }}>
            stayin.co.il/predict
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({
  isHe, x, y, w, h, home, away, homeLabel, awayLabel, winnerSide, matchNum, onPath, isFinal,
}: {
  isHe: boolean;
  x: number; y: number; w: number; h: number;
  home: string | null; away: string | null;
  homeLabel: string; awayLabel: string;
  winnerSide: "home" | "away" | undefined;
  matchNum: number;
  onPath: boolean;
  isFinal?: boolean;
}) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: w, height: h, zIndex: 3,
    }}>
      {/* Match # */}
      <div style={{
        position: "absolute", top: -16, left: 0, right: 0,
        fontSize: 10, fontWeight: 800, letterSpacing: "0.14em",
        color: onPath ? C.goldDark : C.navyMid, opacity: onPath ? 1 : 0.6,
        textAlign: "center", fontFamily: fSyne,
      }}>
        #{matchNum}
      </div>
      <div style={{
        width: w, height: h, borderRadius: 5,
        background: C.white,
        border: isFinal
          ? `2px solid ${C.gold}`
          : `1px solid ${onPath ? C.gold : C.border}`,
        boxShadow: isFinal
          ? `0 0 0 3px ${C.gold}, 0 12px 24px ${C.gold}40`
          : onPath
            ? `0 0 0 2px ${C.gold}, 0 4px 10px ${C.gold}20`
            : "0 1px 3px rgba(13,27,62,0.10)",
        overflow: "hidden", display: "flex", flexDirection: "column",
      }}>
        <Side isHe={isHe} team={home} label={homeLabel} won={winnerSide === "home"} />
        <div style={{ height: 1, background: "#d4dbe8" }} />
        <Side isHe={isHe} team={away} label={awayLabel} won={winnerSide === "away"} />
      </div>
    </div>
  );
}

function Side({ isHe, team, label, won }: { isHe: boolean; team: string | null; label: string; won: boolean }) {
  return (
    <div style={{
      flex: 1, display: "flex", alignItems: "center", gap: 6,
      padding: "0 8px",
      background: won ? "rgba(212,160,23,0.22)" : "transparent",
      color: won ? "#5a3d00" : team ? C.navy : C.muted,
      fontWeight: won ? 800 : 700,
    }}>
      {team && flagImgSrc(team) && (
        <span style={{ width: 18, height: 13, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
          <img
            src={flagImgSrc(team).replace("/w40/", "/w80/")}
            alt=""
            crossOrigin="anonymous"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </span>
      )}
      <span style={{
        fontFamily: fHe, fontSize: 12,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1,
      }}>{team ? teamName(team, isHe) : label}</span>
    </div>
  );
}
