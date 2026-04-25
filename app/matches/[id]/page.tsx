"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../lib/LanguageContext";
import { useToast } from "../../../components/ToastProvider";
import { teamName, flagImgSrc } from "../../../lib/teams";
import ShareButton from "../../../components/ShareButton";

// ── Types ─────────────────────────────────────────────────────────────────────
type MatchItem = {
  id: string;
  fifa_match_number: number;
  home_team_name: string | null;
  away_team_name: string | null;
  city: string;
  stadium: string;
  match_date: string;
  match_time: string;
  stage: string;
};

type ListingItem = {
  id: string;
  user_id: string;
  match_id: string;
  type: string;
  category: string;
  quantity: number;
  price: number;
  notes: string | null;
  status: string;
  expires_at: string | null;
  is_featured?: boolean;
  seated_together?: string | null;
  seats_block?: string | null;
  seats_row?: string | null;
  seats_numbers?: string | null;
  last_bumped_at?: string | null;
  first_published_at?: string | null;
  first_featured_at?: string | null;
};

type ProfileItem = {
  id: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  created_at?: string | null;
};

type EnrichedListing = ListingItem & { profile: ProfileItem | null };

// ── Tokens ────────────────────────────────────────────────────────────────────
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
  goldLight: "rgba(212,160,23,0.1)",
  green: "#22c55e",
  greenDark: "#065f46",
  greenLight: "rgba(0,104,71,0.08)",
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
function isGroupStage(stage: string) {
  return stage?.startsWith("Group") || stage === "Group Stage";
}

function hasRealTeam(name: string | null | undefined) {
  return !!name && name !== "TBD" && name !== "TBC";
}

function stageLabel(stage: string, isHe: boolean) {
  if (!isHe) return stage;

  if (stage === "Group Stage") return "שלב הבתים";
  if (stage === "Round of 32") return "32 האחרונות";
  if (stage === "Round of 16") return "16 האחרונות";
  if (stage === "Quarter Finals") return "רבע הגמר";
  if (stage === "Semi Finals") return "חצי הגמר";
  if (stage === "Third Place") return "מקום שלישי";
  if (stage === "Final") return "הגמר";

  const groupMatch = stage.match(/^Group\s+([A-Z])$/i);
  if (groupMatch) return `בית ${groupMatch[1].toUpperCase()}`;

  return stage;
}


function formatMatchDate(dateString: string | null | undefined) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ── Countdown ─────────────────────────────────────────────────────────────────
function Countdown({
  date,
  time,
  isHe,
}: {
  date: string;
  time: string;
  isHe: boolean;
}) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0, over: false });

  useEffect(() => {
    const target = new Date(`${date}T${(time || "20:00").slice(0, 5)}:00`).getTime();

    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        setT({ d: 0, h: 0, m: 0, s: 0, over: true });
        return;
      }

      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        over: false,
      });
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [date, time]);

  if (t.over) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span
        style={{
          fontSize: "10px",
          fontWeight: 600,
          color: C.hint,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {isHe ? "עד הקיקאוף" : "Kickoff in"}
      </span>

      <div style={{ display: "flex", gap: "4px" }}>
        {[
          { v: t.d, l: isHe ? "י" : "d" },
          { v: t.h, l: isHe ? "ש" : "h" },
          { v: t.m, l: isHe ? "ד" : "m" },
          { v: t.s, l: isHe ? "ש" : "s" },
        ].map(({ v, l }) => (
          <div
            key={l}
            style={{
              textAlign: "center",
              minWidth: "36px",
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: "4px",
              padding: "5px 4px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-syne,'Syne',sans-serif)",
                fontSize: "15px",
                fontWeight: 800,
                color: C.text,
                lineHeight: 1,
              }}
            >
              {String(v).padStart(2, "0")}
            </div>
            <div
              style={{
                fontSize: "8px",
                fontWeight: 700,
                color: C.hint,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginTop: "2px",
              }}
            >
              {l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrustBadge({
  profile,
  isHe,
}: {
  profile: ProfileItem | null;
  isHe: boolean;
}) {
  if (!profile) return null;

  const age = profile.created_at
    ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000)
    : 0;

  const score = Math.min(
    100,
    (profile.phone ? 40 : 0) + (profile.country ? 20 : 0) + Math.min(40, age / 3)
  );

  const verified = score >= 80;
  const trusted = score >= 50;
  const label = verified
    ? isHe
      ? "מאומת"
      : "Verified"
    : trusted
      ? isHe
        ? "מהימן"
        : "Trusted"
      : isHe
        ? "חדש"
        : "New";

  const color = verified ? C.mexico : trusted ? C.usa : C.hint;

  return (
    <span
      style={{
        fontSize: "9px",
        fontWeight: 700,
        padding: "2px 7px",
        borderRadius: "3px",
        background: `${color}15`,
        color,
        border: `1px solid ${color}28`,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      {verified ? "✓ " : ""}
      {label}
    </span>
  );
}

function GoldListing({
  item,
  isBestValue,
  isHe,
  viewerLoggedIn,
  viewerProfileComplete,
  onContact,
  matchName,
}: {
  item: EnrichedListing;
  isBestValue: boolean;
  isHe: boolean;
  viewerLoggedIn: boolean;
  viewerProfileComplete: boolean;
  onContact: (item: EnrichedListing) => void;
  matchName: string;
}) {
  const [hov, setHov] = useState(false);

  const seatPills = [
    item.seats_block && { l: isHe ? "בלוק" : "Block", v: item.seats_block },
    item.seats_row && { l: isHe ? "שורה" : "Row", v: item.seats_row },
    item.seats_numbers && { l: isHe ? "מושבים" : "Seats", v: item.seats_numbers },
    item.quantity > 1 &&
      item.seated_together === "yes" && { l: "", v: isHe ? "✓ יחד" : "✓ Together", green: true },
    item.quantity > 1 &&
      item.seated_together === "no" && { l: "", v: isHe ? "לא יחד" : "Not together" },
  ].filter(Boolean) as any[];

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: "10px",
        overflow: "hidden",
        position: "relative",
        transition: "box-shadow 200ms, transform 200ms",
        boxShadow: hov
          ? "0 8px 40px rgba(212,160,23,0.18), 0 2px 12px rgba(13,27,62,0.08)"
          : "0 2px 12px rgba(13,27,62,0.06)",
        transform: hov ? "translateY(-2px)" : "none",
      }}
    >
      <div
        style={{
          height: "3px",
          background: `linear-gradient(90deg, ${C.usa}, ${C.gold}, ${C.mexico})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "120px",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(212,160,23,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ padding: "18px 20px", position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "9px",
                fontWeight: 800,
                padding: "3px 10px",
                borderRadius: "3px",
                background: `linear-gradient(135deg, ${C.gold}, #fbbf24)`,
                color: "#fff",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              ⭐ GOLD LISTING
            </span>

            {isBestValue && (
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "3px",
                  background: C.greenLight,
                  color: C.greenDark,
                  border: "1px solid rgba(0,104,71,0.22)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                🏷️ {isHe ? "הכי זול בקטגוריה" : "Best value in cat"}
              </span>
            )}

            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "3px",
                background: C.greenLight,
                color: C.greenDark,
                border: "1px solid rgba(0,104,71,0.2)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {isHe ? "מכירה" : "Sell"}
            </span>

            <span
              style={{
                fontSize: "9px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "3px",
                background: "#f1f5f9",
                color: C.muted,
                border: `1px solid ${C.border}`,
              }}
            >
              {item.category}
            </span>
          </div>

          <span style={{ fontSize: "9px", fontWeight: 600, color: C.hint }}>
            {isHe ? "מודעה מוזהבת" : "Featured listing"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "10px" }}>
          <span
            style={{
              fontFamily: "var(--font-syne,'Syne',sans-serif)",
              fontSize: "32px",
              fontWeight: 800,
              color: C.text,
              letterSpacing: "-1px",
              lineHeight: 1,
            }}
          >
            ${item.price}
          </span>
          <span style={{ fontSize: "12px", color: C.hint }}>
            {isHe ? "לכרטיס" : "/ ticket"} × {item.quantity}
          </span>
          {item.quantity > 1 && (
            <span style={{ fontSize: "13px", fontWeight: 700, color: C.gold }}>
              = ${item.price * item.quantity}
            </span>
          )}
        </div>

        {seatPills.length > 0 && (
          <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
            {seatPills.map((p: any, i: number) => (
              <span
                key={i}
                style={{
                  fontSize: "10px",
                  padding: "3px 9px",
                  background: p.green ? "rgba(34,197,94,0.08)" : "#f1f5f9",
                  borderRadius: "4px",
                  color: p.green ? "#15803d" : C.muted,
                  fontWeight: 500,
                }}
              >
                {p.l && <span style={{ color: C.hint }}>{p.l} </span>}
                {p.v}
              </span>
            ))}
          </div>
        )}

        {item.notes && (
          <p
            style={{
              fontSize: "12px",
              color: C.muted,
              fontStyle: "italic",
              lineHeight: 1.65,
              marginBottom: "12px",
              borderLeft: `2px solid ${C.gold}`,
              paddingLeft: "10px",
            }}
          >
            "{item.notes}"
          </p>
        )}

        <div style={{ height: "1px", background: "#f1f5f9", margin: "12px 0" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.usa}, ${C.mexico})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {(item.profile?.full_name || "?")[0].toUpperCase()}
          </div>

          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>
              {item.profile?.full_name || "Stayin user"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
              <span style={{ fontSize: "10px", color: C.hint }}>
                {item.profile?.country || ""}
              </span>
              <TrustBadge profile={item.profile} isHe={isHe} />
            </div>
          </div>

          <div
            style={{
              marginInlineStart: "auto",
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            {!viewerLoggedIn ? (
              <Link
                href="/auth"
                style={{
                  display: "block",
                  padding: "10px 20px",
                  textAlign: "center",
                  background: "#1a3a6b",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 700,
                  borderRadius: "5px",
                  textDecoration: "none",
                }}
              >
                {isHe ? "התחבר ליצירת קשר" : "Login to contact"}
              </Link>
            ) : !viewerProfileComplete ? (
              <Link
                href="/complete-profile"
                style={{
                  display: "block",
                  padding: "10px 20px",
                  textAlign: "center",
                  background: "#1a3a6b",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 700,
                  borderRadius: "5px",
                  textDecoration: "none",
                }}
              >
                {isHe ? "השלם פרופיל" : "Complete profile"}
              </Link>
            ) : item.profile?.phone ? (
              <button
                onClick={() => onContact(item)}
                style={{
                  padding: "10px 20px",
                  background: "#25D366",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                  width: "100%",
                }}
              >
                WhatsApp →
              </button>
            ) : (
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                {isHe ? "אין מספר" : "No number"}
              </span>
            )}
            <ShareButton
              listingId={item.id}
              matchName={matchName}
              price={item.price ? `$${item.price}` : ""}
              isHe={isHe}
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function RegularListing({
  item,
  isBestValue,
  isNew,
  isHe,
  viewerLoggedIn,
  viewerProfileComplete,
  onContact,
  matchName,
}: {
  item: EnrichedListing;
  isBestValue: boolean;
  isNew: boolean;
  isHe: boolean;
  viewerLoggedIn: boolean;
  viewerProfileComplete: boolean;
  onContact: (item: EnrichedListing) => void;
  matchName: string;
}) {
  const [hov, setHov] = useState(false);
  const accentColor = item.type === "sell" ? C.mexico : C.usa;
  const expiresSoon =
    item.expires_at &&
    new Date(item.expires_at).getTime() - Date.now() < 24 * 3600000;
  const hoursLeft = item.expires_at
    ? Math.max(0, Math.floor((new Date(item.expires_at).getTime() - Date.now()) / 3600000))
    : null;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#fdfeff" : C.white,
        border: `1px solid ${isBestValue ? "rgba(0,104,71,0.35)" : C.border}`,
        borderRadius: "8px",
        overflow: "hidden",
        transition: "all 180ms ease",
        transform: hov ? "translateY(-1px)" : "none",
        boxShadow: hov ? "0 4px 20px rgba(13,27,62,0.08)" : "0 1px 4px rgba(13,27,62,0.04)",
      }}
    >
      <div style={{ height: "2px", background: accentColor }} />
      <div style={{ padding: "15px 18px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginBottom: "10px",
            flexWrap: "wrap",
          }}
        >
          {isBestValue && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: "3px",
                background: C.greenLight,
                color: C.greenDark,
                border: "1px solid rgba(0,104,71,0.2)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              🏷️ {isHe ? "הכי זול" : "Best value"}
            </span>
          )}

          {isNew && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: "3px",
                background: "rgba(26,58,107,0.07)",
                color: C.usa,
                border: "1px solid rgba(26,58,107,0.18)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {isHe ? "חדש" : "New"}
            </span>
          )}

          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: "3px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              background: item.type === "sell" ? C.greenLight : "rgba(26,58,107,0.07)",
              color: item.type === "sell" ? C.greenDark : C.usa,
              border: `1px solid ${
                item.type === "sell" ? "rgba(0,104,71,0.2)" : "rgba(26,58,107,0.15)"
              }`,
            }}
          >
            {item.type === "sell" ? (isHe ? "מכירה" : "Sell") : isHe ? "קנייה" : "Buy"}
          </span>

          <span
            style={{
              fontSize: "9px",
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: "3px",
              background: "#f1f5f9",
              color: C.hint,
              border: `1px solid ${C.border}`,
            }}
          >
            {item.category}
          </span>

          {expiresSoon && hoursLeft !== null && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: "3px",
                background: "rgba(230,57,70,0.07)",
                color: C.canada,
                border: "1px solid rgba(230,57,70,0.2)",
                letterSpacing: "0.04em",
              }}
            >
              🔥 {isHe ? `${hoursLeft}ש' נשארו` : `${hoursLeft}h left`}
            </span>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
              <span
                style={{
                  fontFamily: "var(--font-syne,'Syne',sans-serif)",
                  fontSize: "22px",
                  fontWeight: 800,
                  color: isBestValue ? C.mexico : C.text,
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                }}
              >
                {item.type === "sell"
                  ? `$${item.price}`
                  : isHe
                    ? `עד $${item.price}`
                    : `Up to $${item.price}`}
              </span>
              <span style={{ fontSize: "11px", color: C.hint }}>
                × {item.quantity} {isHe ? "כרטיסים" : "tickets"}
              </span>
            </div>

            {(item.seats_block || item.seats_row) && (
              <div style={{ display: "flex", gap: "5px", marginBottom: "6px", flexWrap: "wrap" }}>
                {[
                  item.seats_block && `${isHe ? "בלוק" : "Blk"} ${item.seats_block}`,
                  item.seats_row && `${isHe ? "שורה" : "Row"} ${item.seats_row}`,
                  item.seated_together === "yes" && (isHe ? "✓ יחד" : "✓ Together"),
                ]
                  .filter(Boolean)
                  .map((v: any, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "10px",
                        padding: "2px 7px",
                        background: "#f8f9fc",
                        borderRadius: "3px",
                        color: C.muted,
                      }}
                    >
                      {v}
                    </span>
                  ))}
              </div>
            )}

            {item.notes && (
              <p
                style={{
                  fontSize: "11px",
                  color: C.muted,
                  fontStyle: "italic",
                  lineHeight: 1.55,
                  marginBottom: "8px",
                }}
              >
                "{item.notes}"
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.usa}80, ${C.mexico}80)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {(item.profile?.full_name || "?")[0].toUpperCase()}
              </div>

              <span style={{ fontSize: "11px", fontWeight: 600, color: C.text }}>
                {item.profile?.full_name || "Stayin user"}
              </span>

              {item.profile?.country && (
                <span style={{ fontSize: "10px", color: C.hint }}>
                  · {item.profile.country}
                </span>
              )}

              <TrustBadge profile={item.profile} isHe={isHe} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
            {!viewerLoggedIn ? (
              <Link
                href="/auth"
                style={{
                  padding: "9px 16px",
                  background: C.usa,
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                  borderRadius: "4px",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {isHe ? "התחבר" : "Login"}
              </Link>
            ) : !viewerProfileComplete ? (
              <Link
                href="/complete-profile"
                style={{
                  padding: "9px 16px",
                  background: C.usa,
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                  borderRadius: "4px",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {isHe ? "השלם פרופיל" : "Complete profile"}
              </Link>
            ) : item.profile?.phone ? (
              <button
                onClick={() => onContact(item)}
                style={{
                  padding: "9px 16px",
                  background: "#25D366",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                WhatsApp →
              </button>
            ) : (
              <span style={{ fontSize: "10px", color: C.faint }}>
                {isHe ? "אין מספר" : "No number"}
              </span>
            )}
            <ShareButton
              listingId={item.id}
              matchName={matchName}
              price={item.price ? `$${item.price}` : ""}
              isHe={isHe}
              size="sm"
            />

            <Link
              href={`/contact?type=report&listingId=${item.id}&matchId=${item.match_id}`}
              style={{
                fontSize: "10px",
                color: C.faint,
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              {isHe ? "דווח" : "Report"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MatchPage() {
  const params = useParams();
  const matchId = params.id as string;
  const { t, lang } = useLanguage();
  const toast = useToast();
  const isHe = lang === "he";

  const [match, setMatch] = useState<MatchItem | null>(null);
  const [listings, setListings] = useState<EnrichedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerLoggedIn, setViewerLoggedIn] = useState(false);
  const [viewerProfileComplete, setViewerProfileComplete] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [typeFilter, setTypeFilter] = useState<"all" | "sell" | "buy">("all");
  const [sortBy, setSortBy] = useState("featured");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    load();

    const ch = supabase
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "listings", filter: `match_id=eq.${matchId}` },
        async (payload) => {
          const { data } = await supabase
            .from("profiles")
            .select("id,full_name,phone,country,city,created_at")
            .eq("id", (payload.new as ListingItem).user_id)
            .maybeSingle();

          setListings((prev) => [{ ...(payload.new as ListingItem), profile: data || null }, ...prev]);
          toast.success(isHe ? "מודעה חדשה נוספה! 🎟️" : "New listing added! 🎟️");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [matchId, isHe, toast]);

  async function load() {
    setLoading(true);
    await Promise.all([loadViewer(), loadData()]);
    setLoading(false);
  }

  async function loadViewer() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return;

    setViewerLoggedIn(true);

    const { data } = await supabase
      .from("profiles")
      .select("full_name,phone,country")
      .eq("id", session.user.id)
      .maybeSingle();

    setViewerProfileComplete(!!(data?.full_name && data?.phone && data?.country));
  }

  async function loadData() {
    const { data: matchData } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (!matchData) return;

    const matchItem = matchData as MatchItem;
    setMatch(matchItem);

    if (matchItem.match_date < getTodayDateString()) {
      setListings([]);
      return;
    }

    const { data: listingsData } = await supabase
      .from("listings")
      .select("*")
      .eq("match_id", matchId)
      .eq("status", "active")
      .is("archived_at", null);

    const ids = [...new Set((listingsData || []).map((l: any) => l.user_id))];
    const profilesMap: Record<string, ProfileItem> = {};

    if (ids.length) {
      const { data: pData } = await supabase
        .from("profiles")
        .select("id,full_name,phone,country,city,created_at")
        .in("id", ids);

      (pData || []).forEach((p: ProfileItem) => {
        profilesMap[p.id] = p;
      });
    }

    setListings(
      (listingsData || []).map((l: any) => ({
        ...l,
        profile: profilesMap[l.user_id] || null,
      }))
    );
  }

  function renderMatchTeam(teamValue: string | null) {
    if (!match) return null;

    const showFlag = isGroupStage(match.stage) && hasRealTeam(teamValue);
    const imgSrc = showFlag ? flagImgSrc(teamValue) : "";
    const label = teamName(teamValue, isHe);

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          fontFamily: isHe
            ? "var(--font-he,'Heebo',sans-serif)"
            : "var(--font-syne,'Syne',sans-serif)",
          fontSize: "inherit",
          fontWeight: 800,
          letterSpacing: "inherit",
          lineHeight: 1.05,
          color: C.text,
          verticalAlign: "middle",
        }}
      >
        {showFlag && imgSrc ? (
          <span
            style={{
              width: "28px",
              height: "20px",
              borderRadius: "4px",
              overflow: "hidden",
              background: "#fff",
              border: "1px solid rgba(13,27,62,0.10)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 1px 2px rgba(13,27,62,0.05)",
            }}
          >
            <img
              src={imgSrc}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </span>
        ) : null}

        <span>{label}</span>
      </span>
    );
  }

  function handleContact(item: EnrichedListing) {
    if (!match || !item.profile?.phone) return;

    const phone = item.profile.phone.replace(/[^\d+]/g, "").replace(/^\+/, "");

    const text = isHe
      ? item.type === "sell"
        ? `היי, ראיתי את מודעת המכירה שלך למשחק ${match.fifa_match_number} (${teamName(
            match.home_team_name,
            true
          )} נגד ${teamName(match.away_team_name, true)}). זה עדיין זמין?`
        : `היי, ראיתי את בקשת הקנייה שלך למשחק ${match.fifa_match_number}. אולי יש לי כרטיסים.`
      : item.type === "sell"
        ? `Hi, I saw your sell listing for Match ${match.fifa_match_number} (${teamName(
            match.home_team_name,
            false
          )} vs ${teamName(match.away_team_name, false)}). Still available?`
        : `Hi, I saw your buy request for Match ${match.fifa_match_number}. I may have tickets.`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  }

  const filtered = useMemo(() => {
    let r = [...listings];

    if (typeFilter !== "all") r = r.filter((l) => l.type === typeFilter);
    if (minPrice) r = r.filter((l) => l.price >= Number(minPrice));
    if (maxPrice) r = r.filter((l) => l.price <= Number(maxPrice));

    r.sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "newest") {
        return new Date(b.first_published_at || 0).getTime() - new Date(a.first_published_at || 0).getTime();
      }
      if (Number(!!b.is_featured) !== Number(!!a.is_featured)) {
        return Number(!!b.is_featured) - Number(!!a.is_featured);
      }
      return (
        new Date(b.last_bumped_at || b.first_published_at || 0).getTime() -
        new Date(a.last_bumped_at || a.first_published_at || 0).getTime()
      );
    });

    return r;
  }, [listings, typeFilter, minPrice, maxPrice, sortBy]);

  const bestValueIds = useMemo(() => {
    const cats = [...new Set(listings.filter((l) => l.type === "sell").map((l) => l.category))];
    return new Set(
      cats
        .map((cat) => {
          const inCat = listings.filter((l) => l.type === "sell" && l.category === cat);
          return inCat.reduce((min, l) => (l.price < min.price ? l : min), inCat[0])?.id;
        })
        .filter(Boolean)
    );
  }, [listings]);

  const sellCount = listings.filter((l) => l.type === "sell").length;
  const buyCount = listings.filter((l) => l.type === "buy").length;
  const prices = listings.filter((l) => l.type === "sell").map((l) => l.price);
  const minP = prices.length ? Math.min(...prices) : null;
  const avgP = prices.length
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : null;

  if (loading) {
    return (
      <main style={{ minHeight: "100vh" }}>
        <style>{`@keyframes sk{from{background-position:-600px 0}to{background-position:600px 0}}.sk{background:linear-gradient(90deg,#f0f4f8 25%,#e8edf5 50%,#f0f4f8 75%);background-size:800px 100%;animation:sk 1.4s infinite linear;border-radius:8px;}`}</style>
        <div
          style={{
            height: "3px",
            background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)`,
          }}
        />
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.75rem" }}>
          <div className="sk" style={{ height: "200px", marginBottom: "14px" }} />
          <div className="sk" style={{ height: "48px", marginBottom: "14px" }} />
          {[1, 2, 3].map((i) => (
            <div key={i} className="sk" style={{ height: "110px", marginBottom: "10px" }} />
          ))}
        </div>
      </main>
    );
  }

  if (!match) {
    return (
      <main style={{ minHeight: "100vh" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.75rem" }}>
          <p style={{ color: C.hint }}>{t.matchNotFound}</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh" }}>
      <style>{`@keyframes fsu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}.fsu{animation:fsu 380ms cubic-bezier(0.16,1,0.3,1) both;}.fsu1{animation-delay:50ms}.fsu2{animation-delay:100ms}.fsu3{animation-delay:150ms}`}</style>

      <div
        style={{
          height: "3px",
          background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)`,
        }}
      />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 1.75rem" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            fontWeight: 600,
            color: C.hint,
            textDecoration: "none",
            marginBottom: "16px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            transition: "color 150ms",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = C.usa)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = C.hint)}
        >
          <span style={{ fontSize: "14px" }}>←</span>
          {isHe ? "כל המשחקים" : "All matches"}
        </Link>

        <div
          className="fsu"
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: "10px",
            overflow: "hidden",
            marginBottom: "12px",
            boxShadow: "0 2px 12px rgba(13,27,62,0.06)",
          }}
        >
          <div style={{ height: "3px", background: C.usa }} />
          <div style={{ padding: "22px 26px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: C.hint,
                    marginBottom: "8px",
                  }}
                >
                  {isHe ? "משחק" : "Match"} {String(match.fifa_match_number).padStart(2, "0")} · {stageLabel(match.stage, isHe)}
                </div>

                <h1
                  style={{
                    fontFamily: isHe
                      ? "var(--font-he,'Heebo',sans-serif)"
                      : "var(--font-syne,'Syne',sans-serif)",
                    fontSize: "clamp(22px,3.5vw,38px)",
                    fontWeight: 800,
                    color: C.text,
                    letterSpacing: "-0.8px",
                    lineHeight: 1.05,
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  {renderMatchTeam(match.home_team_name)}
                  <span
                    style={{
                      color: C.faint,
                      fontWeight: 300,
                      margin: "0 2px",
                      fontSize: "0.65em",
                      fontFamily: "inherit",
                    }}
                  >
                    {isHe ? "נגד" : "vs"}
                  </span>
                  {renderMatchTeam(match.away_team_name)}
                </h1>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "14px",
                    fontSize: "12px",
                    color: C.muted,
                    marginBottom: "16px",
                  }}
                >
                  <span>📍 {match.city}</span>
                  <span>🏟️ {match.stadium}</span>
                  <span>📅 {formatMatchDate(match.match_date)}</span>
                  {match.match_time && <span>🕐 {match.match_time}</span>}
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => {
                      if (!viewerLoggedIn) {
                        setShowLoginModal(true);
                        return;
                      }
                      window.location.href = `/post-listing?matchId=${matchId}&type=sell`;
                    }}
                    style={{
                      padding: "10px 22px",
                      background: C.usa,
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 700,
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      letterSpacing: "0.02em",
                    }}
                  >
                    + {isHe ? "מכור כרטיסים" : "Sell tickets"}
                  </button>

                  <button
                    onClick={() => {
                      if (!viewerLoggedIn) {
                        setShowLoginModal(true);
                        return;
                      }
                      window.location.href = `/post-listing?matchId=${matchId}&type=buy`;
                    }}
                    style={{
                      padding: "10px 22px",
                      background: "transparent",
                      color: C.usa,
                      fontSize: "12px",
                      fontWeight: 700,
                      border: `1px solid ${C.usa}`,
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    + {isHe ? "חפש לקנות" : "Looking to buy"}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", alignItems: "flex-end" }}>
                <Countdown date={match.match_date} time={match.match_time} isHe={isHe} />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: "1px",
                    background: C.border,
                    border: `1px solid ${C.border}`,
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  {[
                    { n: sellCount, l: isHe ? "מוכרים" : "Sell", c: C.mexico },
                    { n: buyCount, l: isHe ? "מחפשים" : "Buy", c: C.usa },
                    { n: minP !== null ? `$${minP}` : "—", l: isHe ? "מינ׳" : "From", c: "#15803d" },
                    { n: avgP !== null ? `$${avgP}` : "—", l: isHe ? "ממוצע" : "Avg", c: C.gold },
                  ].map((s, i) => (
                    <div key={i} style={{ background: C.white, padding: "10px 14px", textAlign: "center" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-syne,'Syne',sans-serif)",
                          fontSize: "16px",
                          fontWeight: 800,
                          color: s.c,
                          letterSpacing: "-0.3px",
                        }}
                      >
                        {s.n}
                      </div>
                      <div
                        style={{
                          fontSize: "9px",
                          fontWeight: 600,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: C.hint,
                          marginTop: "2px",
                        }}
                      >
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="fsu fsu1"
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            padding: "11px 16px",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            boxShadow: "0 1px 4px rgba(13,27,62,0.04)",
          }}
        >
          <div style={{ display: "flex", gap: "4px" }}>
            {(["all", "sell", "buy"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setTypeFilter(v)}
                style={{
                  padding: "5px 12px",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  border: `1px solid ${typeFilter === v ? C.usa : C.border}`,
                  color: typeFilter === v ? C.usa : C.hint,
                  background: typeFilter === v ? "rgba(26,58,107,0.06)" : "transparent",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "all 150ms",
                }}
              >
                {v === "all"
                  ? isHe
                    ? "הכל"
                    : "All"
                  : v === "sell"
                    ? `${isHe ? "מכירה" : "Sell"} (${sellCount})`
                    : `${isHe ? "קנייה" : "Buy"} (${buyCount})`}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span
              style={{
                fontSize: "10px",
                color: C.hint,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              $
            </span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder={isHe ? "מינ׳" : "min"}
              style={{
                width: "58px",
                padding: "5px 8px",
                border: `1px solid ${C.border}`,
                borderRadius: "4px",
                fontSize: "11px",
                background: C.bg,
                color: C.text,
                outline: "none",
              }}
            />
            <span style={{ fontSize: "10px", color: C.faint }}>—</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder={isHe ? "מקס׳" : "max"}
              style={{
                width: "58px",
                padding: "5px 8px",
                border: `1px solid ${C.border}`,
                borderRadius: "4px",
                fontSize: "11px",
                background: C.bg,
                color: C.text,
                outline: "none",
              }}
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "5px 10px",
              border: `1px solid ${C.border}`,
              borderRadius: "4px",
              fontSize: "11px",
              background: C.bg,
              color: C.text,
              outline: "none",
              cursor: "pointer",
              marginInlineStart: "auto",
            }}
          >
            <option value="featured">{isHe ? "מודגשות + חדש" : "Featured + newest"}</option>
            <option value="price_low">{isHe ? "מחיר: נמוך לגבוה" : "Price: low → high"}</option>
            <option value="price_high">{isHe ? "מחיר: גבוה לנמוך" : "Price: high → low"}</option>
            <option value="newest">{isHe ? "חדשות ביותר" : "Newest first"}</option>
          </select>

          <span style={{ fontSize: "11px", color: C.hint }}>
            {filtered.length} {isHe ? "תוצאות" : "results"}
          </span>
        </div>

        <div
          style={{
            marginBottom: "10px",
            fontSize: "11px",
            color: C.muted,
            background: "rgba(255,255,255,0.72)",
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            padding: "10px 12px",
            boxShadow: "0 1px 4px rgba(13,27,62,0.04)",
          }}
        >
          {isHe
            ? "Stayin היא פלטפורמה לחיבור בין משתמשים בלבד. האתר אינו צד לעסקה, ואינו אחראי לתוכן המודעות, למחיר, לתשלום או להעברת הכרטיסים."
            : "Stayin is a platform that only connects users. The platform is not a party to any transaction and is not responsible for listing content, pricing, payment, or ticket transfer."}
        </div>

        <div className="fsu fsu2">
          {filtered.length === 0 ? (
            <div
              style={{
                padding: "56px 24px",
                textAlign: "center",
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: "10px",
                boxShadow: "0 1px 4px rgba(13,27,62,0.04)",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "14px" }}>🎟️</div>
              <p
                style={{
                  fontFamily: "var(--font-syne,'Syne',sans-serif)",
                  fontSize: "20px",
                  fontWeight: 800,
                  color: C.text,
                  marginBottom: "8px",
                }}
              >
                {isHe ? "אין מודעות עדיין" : "No listings yet"}
              </p>
              <p style={{ fontSize: "13px", color: C.muted, marginBottom: "24px" }}>
                {isHe ? "היה הראשון לפרסם מודעה למשחק הזה" : "Be the first to post a listing for this match"}
              </p>
              <button
                onClick={() => {
                  if (!viewerLoggedIn) {
                    setShowLoginModal(true);
                    return;
                  }
                  window.location.href = `/post-listing?matchId=${matchId}`;
                }}
                style={{
                  padding: "12px 28px",
                  background: C.usa,
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                + {isHe ? "פרסם מודעה ראשונה" : "Post first listing"}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filtered.map((item) => {
                const bv = bestValueIds.has(item.id);
                const isN =
                  !!item.first_published_at &&
                  Date.now() - new Date(item.first_published_at).getTime() < 86400000;

                return item.is_featured ? (
                  <GoldListing
                    key={item.id}
                    item={item}
                    isBestValue={bv}
                    isHe={isHe}
                    viewerLoggedIn={viewerLoggedIn}
                    viewerProfileComplete={viewerProfileComplete}
                    onContact={handleContact}
                  />
                ) : (
                  <RegularListing
                    key={item.id}
                    item={item}
                    isBestValue={bv}
                    isNew={isN}
                    isHe={isHe}
                    viewerLoggedIn={viewerLoggedIn}
                    viewerProfileComplete={viewerProfileComplete}
                    onContact={handleContact}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showLoginModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,27,62,0.5)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99,
            padding: "1.5rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLoginModal(false);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "360px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 32px 80px rgba(13,27,62,0.2)",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "14px" }}>🔐</div>
            <h3
              style={{
                fontFamily: "var(--font-syne,'Syne',sans-serif)",
                fontSize: "20px",
                fontWeight: 800,
                color: C.text,
                marginBottom: "8px",
              }}
            >
              {t.loginRequired}
            </h3>
            <p style={{ fontSize: "13px", color: C.muted, marginBottom: "24px", lineHeight: 1.7 }}>
              {t.cannotPostWithoutLogin}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link
                href="/auth"
                style={{
                  display: "block",
                  padding: "12px",
                  background: C.usa,
                  color: "#fff",
                  borderRadius: "5px",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                {isHe ? "התחבר / הרשמה" : "Login / Sign up"}
              </Link>
              <button
                onClick={() => setShowLoginModal(false)}
                style={{
                  padding: "12px",
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  borderRadius: "5px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: C.muted,
                  cursor: "pointer",
                }}
              >
                {t.continueWithoutLogin}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}