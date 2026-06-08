"use client";

import { teamName, flagImgSrc } from "../../../../lib/teams";
import {
  GROUP_LETTERS,
  type GroupLetter,
  type GroupTable,
  type MatchItem,
  type PredictionState,
  resolveKnockoutTeams,
} from "./logic";

const C = {
  navy: "#0d1b3e",
  navyMid: "#1a3a6b",
  red: "#e63946",
  green: "#006847",
  gold: "#d4a017",
  white: "#ffffff",
  cream: "#fdfbf6",
};

const LOGO_SRC = "/stayin-share-logo.png";

const fSyne = "var(--font-syne,'Plus Jakarta Sans','Heebo',sans-serif)";
const fHe = "var(--font-he,'Heebo',sans-serif)";

// Fixed 1080×1350 portrait card (Instagram-portrait aspect ratio) — ideal for
// WhatsApp / Instagram stories. Renders at full size; the modal scales it
// down visually but `html-to-image` captures the real pixels.
export const SHARE_W = 1080;
export const SHARE_H = 1350;

export default function ShareCard({
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
  const finalMatch = matches.find((m) => m.stage === "Final");
  const semis = matches.filter((m) => m.stage === "Semi Finals");

  const finalResolved = finalMatch
    ? resolveKnockoutTeams(finalMatch, matches, tables, state.knockoutWinners, thirdsAssignment, isHe)
    : null;
  const championPick = finalMatch ? state.knockoutWinners[finalMatch.id] : undefined;
  const champion =
    finalResolved && championPick
      ? championPick === "home"
        ? finalResolved.home
        : finalResolved.away
      : null;
  const finalist =
    finalResolved && championPick
      ? championPick === "home"
        ? finalResolved.away
        : finalResolved.home
      : null;

  return (
    <div
      style={{
        width: SHARE_W,
        height: SHARE_H,
        position: "relative",
        background: `linear-gradient(165deg, ${C.cream} 0%, #f4ecd6 38%, #f7d6a0 64%, #f4b88a 100%)`,
        fontFamily: fHe,
        direction: isHe ? "rtl" : "ltr",
        overflow: "hidden",
        color: C.navy,
      }}
    >
      {/* Decorative circles */}
      <div style={{
        position: "absolute", width: 700, height: 700, borderRadius: "50%",
        top: -260, left: -200,
        background: `radial-gradient(circle, ${C.navyMid}22, transparent 65%)`,
      }} />
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        bottom: -240, right: -180,
        background: `radial-gradient(circle, ${C.red}22, transparent 65%)`,
      }} />
      <div style={{
        position: "absolute", width: 460, height: 460, borderRadius: "50%",
        bottom: 200, left: -180,
        background: `radial-gradient(circle, ${C.gold}33, transparent 65%)`,
      }} />

      {/* Top tri-color stripe (USA/Canada/Mexico) */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 8,
        background: `linear-gradient(90deg, ${C.navyMid} 33%, ${C.red} 33% 66%, ${C.green} 66%)`,
      }} />

      {/* Header brand bar */}
      <div style={{
        position: "absolute", top: 40, left: 56, right: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        zIndex: 5,
      }}>
        <img
          src={LOGO_SRC}
          alt="Stayin"
          crossOrigin="anonymous"
          style={{ height: 56, objectFit: "contain" }}
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
        position: "absolute", top: 130, left: 0, right: 0,
        textAlign: "center", zIndex: 5,
      }}>
        <div style={{
          fontSize: 18, fontWeight: 800, color: C.navyMid,
          letterSpacing: "0.32em", textTransform: "uppercase",
          fontFamily: fSyne, marginBottom: 14,
        }}>
          {isHe ? "סימולטור מונדיאל 2026" : "World Cup 2026 Simulator"}
        </div>
        <div style={{
          fontSize: 58, fontWeight: 900, color: C.navy,
          fontFamily: fHe, letterSpacing: "-0.02em", lineHeight: 1,
        }}>
          {isHe ? "התחזית שלי" : "My Prediction"}
        </div>
        {authorName && (
          <div style={{
            fontSize: 22, color: C.navy, opacity: 0.7,
            marginTop: 12, fontWeight: 600,
          }}>
            {authorName}
          </div>
        )}
      </div>

      {/* Champion mega block */}
      <div style={{
        position: "absolute", top: 340, left: 56, right: 56,
        background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 50%, ${C.red} 90%, ${C.gold} 100%)`,
        borderRadius: 28, padding: "44px 32px 36px", textAlign: "center",
        boxShadow: "0 28px 60px rgba(13,27,62,0.32)",
        color: C.white, zIndex: 6, overflow: "hidden",
      }}>
        {/* Subtle radial highlight */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.18), transparent 60%)",
          pointerEvents: "none",
        }} />

        <div style={{
          fontSize: 16, fontWeight: 800, letterSpacing: "0.36em",
          textTransform: "uppercase", color: C.gold, marginBottom: 18,
          fontFamily: fSyne,
        }}>
          {isHe ? "האלופה שלי" : "My Champion"}
        </div>

        <div style={{
          fontSize: 90, lineHeight: 1, marginBottom: 16,
          textShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}>🏆</div>

        {champion ? (
          <>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 22,
              justifyContent: "center",
            }}>
              <div style={{
                width: 120, height: 84, borderRadius: 8, overflow: "hidden",
                border: `4px solid ${C.gold}`,
                boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
                flexShrink: 0,
              }}>
                {flagImgSrc(champion) && (
                  <img
                    src={flagImgSrc(champion).replace("/w40/", "/w160/")}
                    alt=""
                    crossOrigin="anonymous"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                )}
              </div>
              <div style={{
                fontSize: 70, fontWeight: 900, color: C.white,
                fontFamily: fHe, letterSpacing: "-0.02em", lineHeight: 1,
              }}>
                {teamName(champion, isHe)}
              </div>
            </div>
            {finalist && (
              <div style={{
                marginTop: 22, fontSize: 18, color: "rgba(255,255,255,0.7)",
                fontWeight: 600,
              }}>
                {isHe ? `בגמר ניצחה את ` : `Beat `}
                {teamName(finalist, isHe)}
                {isHe ? "" : " in the final"}
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 28, opacity: 0.7 }}>
            {isHe ? "טרם נקבעה" : "TBD"}
          </div>
        )}
      </div>

      {/* Semi finalists strip */}
      <div style={{
        position: "absolute", top: 760, left: 56, right: 56,
        zIndex: 5,
      }}>
        <div style={{
          fontSize: 14, fontWeight: 800, letterSpacing: "0.3em",
          textTransform: "uppercase", color: C.navyMid, marginBottom: 14,
          textAlign: "center", fontFamily: fSyne, opacity: 0.75,
        }}>
          {isHe ? "ארבע הגדולות" : "Final Four"}
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 14,
        }}>
          {semis.flatMap((sf) => {
            const r = resolveKnockoutTeams(sf, matches, tables, state.knockoutWinners, thirdsAssignment, isHe);
            return [
              { team: r.home, label: r.homeLabel, key: sf.id + "-h" },
              { team: r.away, label: r.awayLabel, key: sf.id + "-a" },
            ];
          }).map((t) => (
            <div key={t.key} style={{
              background: C.white, borderRadius: 14, padding: "14px 10px",
              textAlign: "center", border: `1px solid ${C.navy}15`,
              boxShadow: "0 4px 14px rgba(13,27,62,0.06)",
            }}>
              {t.team && flagImgSrc(t.team) && (
                <img
                  src={flagImgSrc(t.team).replace("/w40/", "/w80/")}
                  alt=""
                  crossOrigin="anonymous"
                  style={{
                    width: 56, height: 40, objectFit: "cover",
                    borderRadius: 4, margin: "0 auto 10px",
                    display: "block",
                    border: `1px solid ${C.navy}20`,
                  }}
                />
              )}
              <div style={{
                fontSize: 18, fontWeight: 800, color: C.navy,
                fontFamily: fHe, lineHeight: 1.1,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {t.team ? teamName(t.team, isHe) : t.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Group winners 4×3 grid */}
      <div style={{
        position: "absolute", top: 950, left: 56, right: 56,
        zIndex: 5,
      }}>
        <div style={{
          fontSize: 14, fontWeight: 800, letterSpacing: "0.3em",
          textTransform: "uppercase", color: C.navyMid, marginBottom: 14,
          textAlign: "center", fontFamily: fSyne, opacity: 0.75,
        }}>
          {isHe ? "מנצחי הבתים" : "Group Winners"}
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
        }}>
          {GROUP_LETTERS.map((g) => {
            const t = tables.find((tt) => tt.group === g);
            const winner = t?.rows[0]?.team;
            return (
              <div key={g} style={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: 10, padding: "10px 12px",
                display: "flex", alignItems: "center", gap: 10,
                border: `1px solid ${C.navy}10`,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 6,
                  background: C.navyMid, color: C.white,
                  fontFamily: fSyne, fontWeight: 800, fontSize: 14,
                  display: "grid", placeItems: "center", flexShrink: 0,
                }}>{g}</div>
                {winner && flagImgSrc(winner) && (
                  <img
                    src={flagImgSrc(winner).replace("/w40/", "/w40/")}
                    alt=""
                    crossOrigin="anonymous"
                    style={{
                      width: 28, height: 20, objectFit: "cover",
                      borderRadius: 3, flexShrink: 0,
                      border: `1px solid ${C.navy}15`,
                    }}
                  />
                )}
                <span style={{
                  flex: 1, fontSize: 15, fontWeight: 700, color: C.navy,
                  fontFamily: fHe,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  lineHeight: 1.1,
                }}>
                  {winner ? teamName(winner, isHe) : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{
        position: "absolute", bottom: 36, left: 56, right: 56,
        background: C.navy, borderRadius: 20, padding: "24px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 18px 36px rgba(13,27,62,0.24)",
        zIndex: 6,
      }}>
        <div>
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: "0.28em",
            textTransform: "uppercase", color: C.gold,
            fontFamily: fSyne, marginBottom: 4,
          }}>
            {isHe ? "צור את שלך" : "Build your own"}
          </div>
          <div style={{
            fontSize: 24, fontWeight: 800, color: C.white,
            fontFamily: fSyne, letterSpacing: "-0.01em",
          }}>
            stayin.co.il/predict
          </div>
        </div>
        <div style={{
          width: 78, height: 78, borderRadius: 16,
          background: `linear-gradient(135deg, ${C.gold}, ${C.red})`,
          display: "grid", placeItems: "center",
          fontSize: 38,
          boxShadow: "0 6px 18px rgba(212,160,23,0.4)",
        }}>⚽</div>
      </div>
    </div>
  );
}
