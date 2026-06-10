"use client";

import { teamName, teamCode3, flagImgSrc } from "../../../../lib/teams";
import {
  computeTwoSidedBracket,
  parseSlot,
  resolveKnockoutTeams,
  type GroupLetter,
  type GroupTable,
  type MatchItem,
  type PredictionState,
} from "./logic";

// ── Palette (Vibrant block-based, Stadium Night) ─────────────────────────────
const C = {
  bg0: "#050d22",
  bg1: "#0d1b3e",
  bg2: "#1a3a6b",
  navy: "#0d1b3e",
  navyMid: "#1a3a6b",
  red: "#e63946",
  green: "#006847",
  gold: "#d4a017",
  goldBright: "#f5c542",
  white: "#ffffff",
  ink: "#0a1228",
};

const LOGO_SRC = "/stayin-share-logo.png";
const fDisp = "var(--font-syne,'Plus Jakarta Sans','Inter',sans-serif)";
const fHe = "var(--font-he,'Heebo',sans-serif)";

export const BRACKET_SHARE_W = 1500;
export const BRACKET_SHARE_H = 1500;

// ── Symmetric bracket geometry ───────────────────────────────────────────────
// 9 columns across a 1500px canvas with equal 40px margins:
//   9×132 cards + 8×24 gaps + 2×20 extra padding around the Final = 1420.
// Both halves span the SAME vertical range (8 rows each side, mirrored),
// so the Final sits exactly at the canvas' horizontal AND vertical centre.
const CARD_W = 132;
const CARD_H = 66;
const ROW_H = 104;
const COL_GAP = 24;
const FINAL_GAP = 20;

const GRID_TOP = 352;
const COL_W = CARD_W + COL_GAP; // 156

const X_R32_L = 40;
const X_R16_L = X_R32_L + COL_W;          // 196
const X_QF_L  = X_R16_L + COL_W;          // 352
const X_SF_L  = X_QF_L  + COL_W;          // 508
const X_FINAL = X_SF_L  + COL_W + FINAL_GAP; // 684 → centre 750 = canvas centre
const X_SF_R  = X_FINAL + COL_W + FINAL_GAP; // 860
const X_QF_R  = X_SF_R  + COL_W;          // 1016
const X_R16_R = X_QF_R  + COL_W;          // 1172
const X_R32_R = X_R16_R + COL_W;          // 1328 → right edge 1460, margin 40 ✓

const yR32 = (i: number) => GRID_TOP + i * ROW_H;
const yR16 = (i: number) => (yR32(i * 2) + yR32(i * 2 + 1)) / 2;
const yQF  = (i: number) => (yR16(i * 2) + yR16(i * 2 + 1)) / 2;
const ySF  = () => (yQF(0) + yQF(1)) / 2; // vertical centre of the half
const yFinal = ySF;

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

  // Champion path traversal
  const champPath = new Set<string>();
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

  // ── Position every match — right half MIRRORS the left half's heights ──
  const positions = new Map<string, { x: number; y: number; side: "L" | "R" | "C" }>();
  bracket.r32L.forEach((m, i) => positions.set(m.id, { x: X_R32_L, y: yR32(i), side: "L" }));
  bracket.r16L.forEach((m, i) => positions.set(m.id, { x: X_R16_L, y: yR16(i), side: "L" }));
  bracket.qfL.forEach( (m, i) => positions.set(m.id, { x: X_QF_L,  y: yQF(i),  side: "L" }));
  if (bracket.sfL) positions.set(bracket.sfL.id, { x: X_SF_L, y: ySF(), side: "L" });
  if (bracket.final) positions.set(bracket.final.id, { x: X_FINAL, y: yFinal(), side: "C" });
  if (bracket.sfR) positions.set(bracket.sfR.id, { x: X_SF_R, y: ySF(), side: "R" });
  bracket.qfR.forEach( (m, i) => positions.set(m.id, { x: X_QF_R,  y: yQF(i),  side: "R" }));
  bracket.r16R.forEach((m, i) => positions.set(m.id, { x: X_R16_R, y: yR16(i), side: "R" }));
  bracket.r32R.forEach((m, i) => positions.set(m.id, { x: X_R32_R, y: yR32(i), side: "R" }));

  // ── Connectors ───────────────────────────────────────────────────────
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
      const feeder = byNum.get(parseInt(m[1]!, 10));
      if (!feeder) continue;
      const fPos = positions.get(feeder.id);
      if (!fPos) continue;
      const feederIsLeft = fPos.side === "L";
      const fy = fPos.y + CARD_H / 2;
      const cy = cPos.y + CARD_H / 2;
      const fx = feederIsLeft ? fPos.x + CARD_W : fPos.x;
      const cx = feederIsLeft ? cPos.x : cPos.x + CARD_W;
      const mx = (fx + cx) / 2;
      const d = `M ${fx} ${fy} L ${mx} ${fy} L ${mx} ${cy} L ${cx} ${cy}`;
      const gold = champPath.has(child.id) && champPath.has(feeder.id);
      lines.push({ d, gold });
    }
  }

  function resolve(m: MatchItem) {
    return resolveKnockoutTeams(m, matches, tables, state.knockoutWinners, thirdsAssignment, isHe);
  }

  const finalMatch = bracket.final;
  const fr = finalMatch ? resolve(finalMatch) : null;
  const championPick = finalMatch ? state.knockoutWinners[finalMatch.id] : undefined;
  const champion =
    fr && championPick ? (championPick === "home" ? fr.home : fr.away) : null;
  const finalist =
    fr && championPick ? (championPick === "home" ? fr.away : fr.home) : null;

  const finalY = yFinal();

  return (
    <div
      style={{
        width: BRACKET_SHARE_W,
        height: BRACKET_SHARE_H,
        position: "relative",
        background: `radial-gradient(ellipse at 50% 40%, ${C.bg2} 0%, ${C.bg1} 40%, ${C.bg0} 100%)`,
        color: C.white,
        fontFamily: fDisp,
        direction: "ltr",
        overflow: "hidden",
      }}
    >
      {/* Stadium texture + glows */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage:
          "repeating-linear-gradient(115deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 14px)",
      }} />
      <div style={{
        position: "absolute", width: 900, height: 900, borderRadius: "50%",
        top: finalY - 450 + CARD_H / 2, left: 750 - 450,
        background: `radial-gradient(circle, ${C.goldBright}1c, transparent 62%)`,
      }} />
      <div style={{
        position: "absolute", width: 640, height: 640, borderRadius: "50%",
        bottom: -220, left: -220,
        background: `radial-gradient(circle, ${C.red}26, transparent 65%)`,
      }} />
      <div style={{
        position: "absolute", width: 640, height: 640, borderRadius: "50%",
        bottom: -220, right: -220,
        background: `radial-gradient(circle, ${C.green}26, transparent 65%)`,
      }} />

      {/* Top tri-color block */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 14,
        background: `linear-gradient(90deg, ${C.navyMid} 33%, ${C.red} 33% 66%, ${C.green} 66%)`,
      }} />

      {/* Header brand row */}
      <div style={{
        position: "absolute", top: 52, left: 60, right: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        zIndex: 6,
      }}>
        <img
          src={LOGO_SRC}
          alt="Stayin"
          crossOrigin="anonymous"
          style={{ height: 56, objectFit: "contain", filter: "brightness(0) invert(1)" }}
        />
        <div style={{
          fontSize: 20, fontWeight: 900, color: C.goldBright,
          letterSpacing: "0.32em", textTransform: "uppercase",
        }}>
          STAYIN.CO.IL
        </div>
      </div>

      {/* Title */}
      <div style={{
        position: "absolute", top: 138, left: 0, right: 0,
        textAlign: "center", zIndex: 6,
      }}>
        <div style={{
          fontSize: 17, fontWeight: 800, color: C.goldBright,
          letterSpacing: "0.44em", textTransform: "uppercase",
          marginBottom: 12,
        }}>
          {isHe ? "סימולטור מונדיאל 2026" : "World Cup 2026 Simulator"}
        </div>
        <div style={{
          fontSize: 68, fontWeight: 900, color: C.white,
          fontFamily: isHe ? fHe : fDisp,
          letterSpacing: "-0.03em", lineHeight: 1,
          textShadow: "0 4px 18px rgba(0,0,0,0.45)",
        }}>
          {isHe ? "עץ הנוקאאוט שלי" : "MY KNOCKOUT BRACKET"}
        </div>
        {authorName && (
          <div style={{
            marginTop: 12,
            display: "inline-block",
            padding: "5px 16px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 99,
            fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.06em",
            fontFamily: isHe ? fHe : fDisp,
          }}>
            {authorName}
          </div>
        )}
      </div>

      {/* Round labels — mirrored, FINAL centred */}
      <div style={{ position: "absolute", top: 312, left: 0, right: 0, zIndex: 5 }}>
        {[
          { x: X_R32_L, label: "R32" },
          { x: X_R16_L, label: "R16" },
          { x: X_QF_L,  label: "QF"  },
          { x: X_SF_L,  label: "SF"  },
          { x: X_SF_R,  label: "SF"  },
          { x: X_QF_R,  label: "QF"  },
          { x: X_R16_R, label: "R16" },
          { x: X_R32_R, label: "R32" },
        ].map((col, i) => (
          <div key={i} style={{
            position: "absolute", left: col.x, width: CARD_W, textAlign: "center",
            fontSize: 13, fontWeight: 900,
            letterSpacing: "0.28em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
          }}>{col.label}</div>
        ))}
      </div>

      {/* Connector SVG */}
      <svg
        style={{
          position: "absolute", top: 0, left: 0,
          width: BRACKET_SHARE_W, height: BRACKET_SHARE_H,
          pointerEvents: "none", zIndex: 2,
        }}
      >
        <defs>
          <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.goldBright} />
            <stop offset="100%" stopColor={C.gold} />
          </linearGradient>
        </defs>
        {lines.map((l, i) => (
          <path
            key={i}
            d={l.d}
            fill="none"
            stroke={l.gold ? "url(#goldLine)" : "rgba(255,255,255,0.20)"}
            strokeWidth={l.gold ? 3.4 : 1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>

      {/* FINAL column embellishments — trophy above, champion chip below */}
      <div style={{
        position: "absolute", left: X_FINAL - FINAL_GAP, width: CARD_W + FINAL_GAP * 2,
        top: finalY - 128, textAlign: "center", zIndex: 4,
      }}>
        <div style={{ fontSize: 56, lineHeight: 1, filter: `drop-shadow(0 6px 16px ${C.goldBright}70)` }}>🏆</div>
        <div style={{
          marginTop: 6,
          fontSize: 16, fontWeight: 900, letterSpacing: "0.4em",
          textTransform: "uppercase", color: C.goldBright,
        }}>FINAL</div>
      </div>
      {champion && (
        <div style={{
          position: "absolute", left: X_FINAL - FINAL_GAP, width: CARD_W + FINAL_GAP * 2,
          top: finalY + CARD_H + 26, zIndex: 4,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}>
          <div style={{
            width: 0, height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderBottom: `8px solid ${C.goldBright}`,
            transform: "rotate(180deg)",
          }} />
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "7px 14px", borderRadius: 99,
            background: `linear-gradient(135deg, ${C.goldBright}28, ${C.gold}18)`,
            border: `1.5px solid ${C.goldBright}`,
            boxShadow: `0 8px 22px ${C.goldBright}40`,
          }}>
            {flagImgSrc(champion) && (
              <span style={{
                width: 30, height: 22, borderRadius: 3, overflow: "hidden",
                border: `1px solid ${C.goldBright}`, flexShrink: 0,
              }}>
                <img
                  src={flagImgSrc(champion).replace("/w40/", "/w80/")}
                  alt=""
                  crossOrigin="anonymous"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </span>
            )}
            <span style={{
              fontSize: 20, fontWeight: 900, color: C.goldBright,
              letterSpacing: "0.1em",
            }}>{teamCode3(champion)}</span>
          </div>
        </div>
      )}

      {/* Match cards */}
      {[...positions.entries()].map(([id, pos]) => {
        const m = matches.find((x) => x.id === id);
        if (!m) return null;
        const r = resolve(m);
        return (
          <Card
            key={id}
            x={pos.x}
            y={pos.y}
            home={r.home}
            away={r.away}
            winnerSide={state.knockoutWinners[m.id]}
            matchNum={m.fifa_match_number}
            onPath={champPath.has(m.id)}
            isFinal={pos.side === "C"}
            mirror={pos.side === "R"}
          />
        );
      })}

      {/* Champion footer */}
      <div style={{
        position: "absolute", bottom: 52, left: 60, right: 60,
        zIndex: 10,
        background: `linear-gradient(135deg, ${C.navyMid} 0%, ${C.navy} 60%, ${C.ink} 100%)`,
        border: `2px solid ${C.goldBright}`,
        borderRadius: 24, padding: "26px 34px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: `0 30px 60px rgba(0,0,0,0.55), 0 0 0 1px ${C.goldBright}30, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{
            width: 88, height: 88, borderRadius: 18,
            background: `linear-gradient(135deg, ${C.goldBright}, ${C.gold} 70%, ${C.red})`,
            display: "grid", placeItems: "center",
            fontSize: 52,
            boxShadow: `0 12px 28px ${C.gold}60`,
            flexShrink: 0,
          }}>🏆</div>

          <div>
            <div style={{
              fontSize: 13, fontWeight: 900, letterSpacing: "0.38em",
              textTransform: "uppercase", color: C.goldBright,
              marginBottom: 6,
            }}>
              {isHe ? "האלופה שלי" : "MY CHAMPION"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {champion && flagImgSrc(champion) && (
                <span style={{
                  width: 64, height: 47, borderRadius: 6, overflow: "hidden",
                  border: `3px solid ${C.goldBright}`, flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
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
                fontSize: 52, fontWeight: 900, color: C.white,
                fontFamily: isHe ? fHe : fDisp,
                letterSpacing: "-0.02em", lineHeight: 1,
              }}>
                {champion ? teamName(champion, isHe) : "TBD"}
              </div>
              {champion && (
                <div style={{
                  fontSize: 26, fontWeight: 900, color: C.goldBright,
                  letterSpacing: "0.14em",
                  paddingLeft: 14,
                  borderLeft: `2px solid ${C.goldBright}40`,
                }}>
                  {teamCode3(champion)}
                </div>
              )}
            </div>
            {finalist && (
              <div style={{
                marginTop: 6, fontSize: 14,
                color: "rgba(255,255,255,0.55)", fontWeight: 600,
                fontFamily: isHe ? fHe : fDisp,
              }}>
                {isHe ? `בגמר נגד ${teamName(finalist, true)} (${teamCode3(finalist)})`
                      : `Beat ${teamName(finalist, false)} (${teamCode3(finalist)}) in the final`}
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{
            fontSize: 12, fontWeight: 900, letterSpacing: "0.32em",
            textTransform: "uppercase", color: C.goldBright,
            marginBottom: 6,
          }}>
            {isHe ? "צור את שלך" : "BUILD YOURS"}
          </div>
          <div style={{
            fontSize: 26, fontWeight: 900, color: C.white,
          }}>
            stayin.co.il/predict
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Match card ───────────────────────────────────────────────────────────────

function Card({
  x, y, home, away, winnerSide, matchNum, onPath, isFinal, mirror,
}: {
  x: number; y: number;
  home: string | null; away: string | null;
  winnerSide: "home" | "away" | undefined;
  matchNum: number;
  onPath: boolean;
  isFinal?: boolean;
  mirror?: boolean;
}) {
  const w = isFinal ? CARD_W + 12 : CARD_W;
  const h = isFinal ? CARD_H + 14 : CARD_H;
  const xOffset = isFinal ? -6 : 0;
  const yOffset = isFinal ? -7 : 0;

  return (
    <div style={{
      position: "absolute", left: x + xOffset, top: y + yOffset,
      width: w, height: h, zIndex: 3,
    }}>
      {/* Match number badge */}
      <div style={{
        position: "absolute",
        top: -15, left: "50%", transform: "translateX(-50%)",
        fontSize: 10, fontWeight: 900, letterSpacing: "0.18em",
        color: onPath || isFinal ? C.goldBright : "rgba(255,255,255,0.45)",
        background: onPath || isFinal ? "rgba(212,160,23,0.16)" : "rgba(0,0,0,0.35)",
        border: onPath || isFinal
          ? `1px solid ${C.goldBright}`
          : "1px solid rgba(255,255,255,0.10)",
        borderRadius: 99, padding: "1px 8px",
        whiteSpace: "nowrap",
      }}>#{matchNum}</div>

      {/* Card body */}
      <div style={{
        width: w, height: h, borderRadius: 7,
        background: isFinal
          ? `linear-gradient(180deg, #1a3a6b 0%, #0d1b3e 100%)`
          : onPath
            ? `linear-gradient(180deg, rgba(212,160,23,0.15) 0%, rgba(212,160,23,0.05) 100%)`
            : "rgba(255,255,255,0.04)",
        border: isFinal
          ? `2px solid ${C.goldBright}`
          : onPath
            ? `1.5px solid ${C.goldBright}`
            : "1px solid rgba(255,255,255,0.10)",
        boxShadow: isFinal
          ? `0 0 0 4px ${C.goldBright}30, 0 14px 36px ${C.goldBright}40`
          : onPath
            ? `0 6px 18px ${C.goldBright}26`
            : "0 2px 6px rgba(0,0,0,0.25)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        <Side team={home} won={winnerSide === "home"} isFinal={!!isFinal} mirror={!!mirror} />
        <div style={{
          height: 1,
          background: isFinal ? `${C.goldBright}55` : "rgba(255,255,255,0.10)",
        }} />
        <Side team={away} won={winnerSide === "away"} isFinal={!!isFinal} mirror={!!mirror} />
      </div>
    </div>
  );
}

function Side({ team, won, isFinal, mirror }: {
  team: string | null; won: boolean; isFinal: boolean; mirror: boolean;
}) {
  const code = teamCode3(team);
  return (
    <div style={{
      flex: 1, display: "flex", alignItems: "center", gap: 8,
      padding: "0 9px",
      flexDirection: mirror ? "row-reverse" : "row",
      background: won
        ? `linear-gradient(${mirror ? "270deg" : "90deg"}, ${C.goldBright}38 0%, ${C.gold}22 100%)`
        : "transparent",
      color: won ? C.white : team ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)",
      fontWeight: 900,
      position: "relative",
    }}>
      {/* Winner tick on the outer (leading) edge — mirrored on right half */}
      {won && (
        <div style={{
          position: "absolute", top: 0, bottom: 0, width: 3,
          [mirror ? "right" : "left"]: 0,
          background: C.goldBright,
        } as React.CSSProperties} />
      )}

      {team && flagImgSrc(team) && (
        <span style={{
          width: isFinal ? 28 : 24, height: isFinal ? 21 : 18,
          borderRadius: 3, overflow: "hidden", flexShrink: 0,
          border: won ? `1px solid ${C.goldBright}` : "1px solid rgba(255,255,255,0.18)",
        }}>
          <img
            src={flagImgSrc(team).replace("/w40/", "/w80/")}
            alt=""
            crossOrigin="anonymous"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </span>
      )}

      <span style={{
        flex: 1,
        fontSize: isFinal ? 22 : 19,
        fontWeight: 900,
        letterSpacing: "0.04em",
        textAlign: mirror ? "right" : "left",
        color: won ? C.white : team ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.35)",
        textShadow: won ? "0 1px 2px rgba(0,0,0,0.3)" : "none",
      }}>
        {code || "—"}
      </span>
    </div>
  );
}
