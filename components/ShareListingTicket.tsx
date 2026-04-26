"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { toPng } from "html-to-image";
import { flagImgSrc, teamName } from "../lib/teams";

type ShareMatch = {
  id: string;
  fifa_match_number?: number | null;
  home_team_name?: string | null;
  away_team_name?: string | null;
  city?: string | null;
  stadium?: string | null;
  match_date?: string | null;
  match_time?: string | null;
  stage?: string | null;
  competition?: string | null;
};

type ShareListing = {
  id: string;
  type?: string | null;
  category?: string | null;
  quantity?: number | null;
  price?: number | null;
  notes?: string | null;
  status?: string | null;
  expires_at?: string | null;
  seated_together?: string | null;
  seats_block?: string | null;
  seats_row?: string | null;
  seats_numbers?: string | null;
  profile?: {
    full_name?: string | null;
    country?: string | null;
    city?: string | null;
  } | null;
};

type Props = {
  listing: ShareListing;
  onClose?: () => void;
  initialOpen?: boolean;
  match: ShareMatch;
  isHe: boolean;
  size?: "sm" | "md";
};

const SITE_URL = "stayin.co.il";
const fCondensed = "'Barlow Condensed', 'Oswald', Impact, sans-serif";
const LOGO_SRC = "/stayin-share-logo.png";
const CUP_SRC = "/stayin-cup-icon.png";
const STADIUM_SRC = "/stayin-stadium-icon.png";
const EMPTY = "—";
const TICKET_WIDTH = 1600;
const TICKET_HEIGHT = 900;

const navy = "#08204a";
const cyan = "#14dff3";
const cyan2 = "#0aaee6";
const purple = "#9b7cf7";
const gold = "#c8a24a";
const text = "#102653";
const muted = "#6580a8";
const line = "rgba(84, 144, 207, 0.28)";

function clean(value: unknown) {
  if (value === null || value === undefined) return EMPTY;
  const str = String(value).trim();
  return str.length ? str : EMPTY;
}

function formatDate(dateString?: string | null) {
  if (!dateString) return EMPTY;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return clean(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(time?: string | null) {
  if (!time) return EMPTY;
  return time.slice(0, 5);
}

function formatPrice(price?: number | null, type?: string | null, isHe = true) {
  if (price === null || price === undefined || Number.isNaN(Number(price))) return EMPTY;
  const prefix = type === "buy" ? (isHe ? "עד " : "Up to ") : "";
  return `${prefix}$${Number(price).toLocaleString("en-US")}`;
}

function listingTypeLabel(type: string | null | undefined, isHe: boolean) {
  if (type === "buy") return isHe ? "קנייה" : "Buy";
  return isHe ? "מכירה" : "Sell";
}

function yesNo(value: string | null | undefined, isHe: boolean) {
  if (!value) return EMPTY;
  const normalized = String(value).toLowerCase().trim();
  if (["yes", "true", "1", "כן"].includes(normalized)) return isHe ? "כן" : "Yes";
  if (["no", "false", "0", "לא"].includes(normalized)) return isHe ? "לא" : "No";
  if (["unknown", "undefined", "null"].includes(normalized)) return EMPTY;
  return clean(value);
}

function stageLabel(stage?: string | null, isHe = true) {
  const value = clean(stage);
  if (value === EMPTY) return isHe ? "שלב" : "Stage";
  const lower = value.toLowerCase();

  if (isHe) {
    if (lower.includes("group")) return "שלב הבתים";
    if (lower.includes("round of 32")) return "32 האחרונות";
    if (lower.includes("round of 16")) return "שמינית גמר";
    if (lower.includes("quarter")) return "רבע גמר";
    if (lower.includes("semi")) return "חצי גמר";
    if (lower === "final" || lower.includes(" final")) return "גמר";
  } else {
    if (lower.includes("group")) return "Group Stage";
    if (lower.includes("round of 32")) return "Round of 32";
    if (lower.includes("round of 16")) return "Round of 16";
    if (lower.includes("quarter")) return "Quarter-final";
    if (lower.includes("semi")) return "Semi-final";
    if (lower === "final" || lower.includes(" final")) return "Final";
  }

  return value;
}

function eventTitle(isHe: boolean, isWC: boolean) {
  if (!isWC) return isHe ? "אירוע ב-Stayin" : "STAYIN EVENT";
  return isHe ? "מונדיאל 2026" : "FIFA WORLD CUP 2026™";
}

function getShareUrl(listingId: string, matchId: string) {
  if (typeof window === "undefined") return `https://${SITE_URL}/matches/${matchId}?listing=${listingId}`;
  return `${window.location.origin}/matches/${matchId}?listing=${listingId}`;
}

function useModalLayout(open: boolean) {
  const [mounted, setMounted] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.5);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function update() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mobile = width <= 768;
      setIsMobile(mobile);

      // Leave real room for header + note + action buttons, so the CTA buttons
      // are visible immediately when the share modal opens.
      const chromeHeight = mobile ? 430 : 390;
      const availableWidth = Math.max(260, width - (mobile ? 34 : 120));
      const availableHeight = Math.max(180, height - chromeHeight);
      const byWidth = availableWidth / TICKET_WIDTH;
      const byHeight = availableHeight / TICKET_HEIGHT;
      const maxScale = mobile ? 0.34 : 0.62;
      const minScale = mobile ? 0.18 : 0.34;
      setPreviewScale(Math.max(minScale, Math.min(maxScale, byWidth, byHeight)));
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return { mounted, previewScale, isMobile };
}

async function waitForImages(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );

  await new Promise<void>((resolve) => setTimeout(resolve, 260));
}

function fitFont(textValue: string, base: number, mediumAt: number, smallAt: number, min = 24) {
  if (textValue.length > smallAt) return Math.max(min, base - 16);
  if (textValue.length > mediumAt) return Math.max(min, base - 8);
  return base;
}

function smallIcon(type: "ticket" | "clock" | "date" | "pin" | "match" | "people" | "seat" | "block" | "tag" | "stadium") {
  const common = { stroke: cyan2, strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  switch (type) {
    case "ticket":
      return <svg width="28" height="28" viewBox="0 0 28 28"><path {...common} d="M5 11.5 18.5 6l4 9.8-13.5 5.5-1.3-3.2a3 3 0 0 0-2.2-5.3L5 11.5Z"/><path {...common} d="M13 12.5h.01M15.5 17h.01"/></svg>;
    case "clock":
      return <svg width="28" height="28" viewBox="0 0 28 28"><circle {...common} cx="14" cy="14" r="9"/><path {...common} d="M14 9v5l3.5 2"/></svg>;
    case "date":
      return <svg width="28" height="28" viewBox="0 0 28 28"><rect {...common} x="6" y="7.5" width="16" height="15" rx="3"/><path {...common} d="M10 5.5v4M18 5.5v4M6 12h16"/></svg>;
    case "pin":
      return <svg width="28" height="28" viewBox="0 0 28 28"><path {...common} d="M14 24s8-7.2 8-13a8 8 0 1 0-16 0c0 5.8 8 13 8 13Z"/><circle {...common} cx="14" cy="11" r="2.8"/></svg>;
    case "match":
      return <svg width="28" height="28" viewBox="0 0 28 28"><rect {...common} x="5" y="8" width="18" height="12" rx="2"/><path {...common} d="M9 8v12M19 8v12M14 8v12"/></svg>;
    case "people":
      return <svg width="28" height="28" viewBox="0 0 28 28"><circle {...common} cx="10" cy="10" r="3"/><circle {...common} cx="18" cy="10" r="3"/><path {...common} d="M4.5 21c.9-3.8 4-5 5.5-5s4.6 1.2 5.5 5M12.5 21c.9-3.8 4-5 5.5-5s4.6 1.2 5.5 5"/></svg>;
    case "seat":
      return <svg width="28" height="28" viewBox="0 0 28 28"><path {...common} d="M9 5h10a2 2 0 0 1 2 2v10H7V7a2 2 0 0 1 2-2Z"/><path {...common} d="M6 17h16v5M9 22v-5M19 22v-5"/></svg>;
    case "block":
      return <svg width="28" height="28" viewBox="0 0 28 28"><path {...common} d="M8 8h5v5H8zM15 8h5v5h-5zM8 15h5v5H8zM15 15h5v5h-5z"/></svg>;
    case "tag":
      return <svg width="28" height="28" viewBox="0 0 28 28"><path {...common} d="M5 14 14 5h7v7l-9 9-7-7Z"/><circle {...common} cx="18" cy="9" r="1"/></svg>;
    default:
      return <StadiumSvg size={32} color={cyan2} />;
  }
}

function TrophySvg({ size = 118, color = cyan2 }: { size?: number; color?: string }) {
  const glow = "drop-shadow(0 0 10px rgba(20,223,243,.42)) drop-shadow(0 0 22px rgba(155,124,247,.18))";
  return (
    <svg width={size} height={size * 1.22} viewBox="0 0 120 146" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", filter: glow }}>
      <defs>
        <linearGradient id="stayinTrophyStroke" x1="22" y1="6" x2="100" y2="137" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22E8FF" />
          <stop offset="0.48" stopColor="#8FD8FF" />
          <stop offset="1" stopColor="#A36FF7" />
        </linearGradient>
        <radialGradient id="stayinTrophyFill" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 55) rotate(90) scale(80 48)">
          <stop stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#BFF8FF" stopOpacity="0.34" />
          <stop offset="1" stopColor="#22E8FF" stopOpacity="0.08" />
        </radialGradient>
      </defs>
      <path d="M35 18C46 7 75 7 86 18c10 10 8 28 0 42-5 9-14 16-15 31-.7 10 5 21 10 31H39c5-10 11-21 10-31-1-15-10-22-15-31-8-14-10-32 1-42Z" fill="url(#stayinTrophyFill)" stroke="url(#stayinTrophyStroke)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M37 22c9 13 26 18 49 1" stroke="url(#stayinTrophyStroke)" strokeWidth="3.2" strokeLinecap="round" opacity=".92" />
      <path d="M47 98c13-11 22-28 25-50" stroke="url(#stayinTrophyStroke)" strokeWidth="3.4" strokeLinecap="round" opacity=".9" />
      <path d="M54 33c10 11 24 16 34 15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity=".55" />
      <path d="M86 31c16 3 25 15 18 29-5 9-14 13-26 12" stroke="url(#stayinTrophyStroke)" strokeWidth="3" strokeLinecap="round" opacity=".62" />
      <path d="M34 31c-16 3-25 15-18 29 5 9 14 13 26 12" stroke="url(#stayinTrophyStroke)" strokeWidth="3" strokeLinecap="round" opacity=".62" />
      <path d="M36 122h48l9 15H27l9-15Z" fill="rgba(255,255,255,.26)" stroke="url(#stayinTrophyStroke)" strokeWidth="4" strokeLinejoin="round" />
      <path d="M31 138h58" stroke="url(#stayinTrophyStroke)" strokeWidth="4.4" strokeLinecap="round" />
    </svg>
  );
}

function StadiumSvg({ size = 74, color = cyan2 }: { size?: number; color?: string }) {
  const height = Math.round(size * 0.58);
  return (
    <svg width={size} height={height} viewBox="0 0 128 74" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", filter: "drop-shadow(0 0 10px rgba(20,223,243,.32))" }}>
      <defs>
        <linearGradient id="stayinStadiumStroke" x1="12" y1="10" x2="116" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22E8FF" />
          <stop offset="1" stopColor="#6FB9FF" />
        </linearGradient>
      </defs>
      <ellipse cx="64" cy="31" rx="50" ry="18" fill="rgba(20,223,243,.08)" stroke="url(#stayinStadiumStroke)" strokeWidth="3.6" />
      <ellipse cx="64" cy="31" rx="31" ry="10" stroke="url(#stayinStadiumStroke)" strokeWidth="2.6" opacity=".78" />
      <path d="M14 32v15c0 11 22 19 50 19s50-8 50-19V32" stroke="url(#stayinStadiumStroke)" strokeWidth="3.6" />
      <path d="M25 46v13M38 50v13M51 52v13M64 53v13M77 52v13M90 50v13M103 46v13" stroke="url(#stayinStadiumStroke)" strokeWidth="2.3" opacity=".76" />
      <path d="M31 18V5M47 13V2M64 12V1M81 13V2M97 18V5" stroke="url(#stayinStadiumStroke)" strokeWidth="2.5" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

function StadiumDecoration() {
  return (
    <div
      style={{
        position: "absolute",
        left: 18,
        top: 285,
        width: 374,
        height: 285,
        opacity: 0.24,
        filter: "drop-shadow(0 0 22px rgba(10,174,230,.20))",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={STADIUM_SRC}
        alt=""
        crossOrigin="anonymous"
        style={{ width: 372, height: 270, objectFit: "contain", display: "block" }}
      />
    </div>
  );
}

function TicketIconMark() {
  return (
    <svg width="64" height="44" viewBox="0 0 64 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginInlineStart: 9, transform: "rotate(-12deg)", filter: "drop-shadow(0 0 8px rgba(20,223,243,.35))" }}>
      <path d="M8 12 44 3c4-1 8 1 9 5l5 20c1 4-1 7-5 8l-36 6c-4 1-8-1-9-5L3 19c-1-4 1-6 5-7Z" stroke={cyan2} strokeWidth="4" strokeLinejoin="round" />
      <path d="M24 26c3 4 10 4 13 0l4-4c4-5 0-11-6-9" stroke="#ffffff" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M40 18c-3-4-10-4-13 0l-4 4c-4 5 0 11 6 9" stroke="#ffffff" strokeWidth="3.6" strokeLinecap="round" />
    </svg>
  );
}

function StayinLogo() {
  return (
    <div style={{ direction: "ltr", unicodeBidi: "isolate", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <img
        src={LOGO_SRC}
        alt="Stayin Tickets"
        crossOrigin="anonymous"
        style={{
          display: "block",
          width: 330,
          height: 142,
          objectFit: "contain",
          filter: "drop-shadow(0 10px 18px rgba(16,38,83,.10))",
        }}
      />
    </div>
  );
}

function Flag({ name }: { name?: string | null }) {
  const flag = flagImgSrc(name);
  if (!flag) return <div style={flagCircleStyle} />;
  return <img src={flag} alt="" style={flagCircleStyle} />;
}

const flagCircleStyle: CSSProperties = {
  width: 110,
  height: 110,
  borderRadius: 999,
  objectFit: "cover",
  flexShrink: 0,
  border: "3px solid rgba(255,255,255,.88)",
  boxShadow: "0 0 0 1px rgba(54,128,201,.18), 0 10px 20px rgba(16,38,83,.10)",
  background: "#fff",
};

function CardShell({ children, typeLabel, isWC, matchNumber }: { children: ReactNode; typeLabel: string; isWC?: boolean; matchNumber?: string }) {
  const stubGrad = isWC
    ? "linear-gradient(155deg,#1c3a6e 0%,#2a5298 40%,#183a6e 70%,#1a5c2a 100%)"
    : "linear-gradient(155deg,#1a3a8f,#1abfb0)";
  const topBar = isWC
    ? "linear-gradient(90deg,#1a3a6b,#c0202c,#1a5c2a)"
    : "linear-gradient(90deg,#1a3a8f,#006847,#1abfb0)";
  const isSell = typeLabel === "מכירה" || typeLabel === "Sell";

  return (
    <div
      style={{
        width: TICKET_WIDTH,
        height: TICKET_HEIGHT,
        position: "relative",
        overflow: "visible",
        fontFamily: "var(--font-he, Heebo), var(--font-dm, Arial), sans-serif",
        display: "flex",
        direction: "ltr",
        filter: "drop-shadow(0 32px 64px rgba(13,27,62,.2))",
      }}
    >
      {/* Notches — outside overflow so they're clean circles */}
      {/* Notches always on stub/body boundary = left:432 in LTR layout */}
      {[{ top: -28, left: 432 }, { bottom: -28, left: 432 }].map((pos, i) => (
        <div key={i} style={{ position: "absolute", width: 56, height: 56, borderRadius: 999, background: "#d8dde8", zIndex: 10, ...pos }} />
      ))}

      {/* Main card */}
      <div style={{ width: TICKET_WIDTH, height: TICKET_HEIGHT, borderRadius: 48, overflow: "hidden", display: "flex", background: "linear-gradient(145deg,#f0f4fa 0%,#edf1f8 40%,#f2f5fb 100%)", border: "1px solid rgba(13,27,62,.07)", boxShadow: "0 2px 0 rgba(255,255,255,.9) inset" }}>

        {/* STUB */}
        <div style={{ width: 460, flexShrink: 0, background: stubGrad, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "80px 0 72px" }}>
          {/* Texture */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(55deg,rgba(255,255,255,.03) 0px,rgba(255,255,255,.03) 14px,transparent 14px,transparent 28px)" }} />
          {/* Glow */}
          <div style={{ position: "absolute", width: "200%", height: "50%", top: "-15%", left: "-50%", borderRadius: "50%", background: "radial-gradient(ellipse,rgba(255,255,255,.1),transparent 70%)" }} />
          {/* Tear line */}
          <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, borderRight: "2px dashed rgba(255,255,255,.18)" }} />

          {/* Logo */}
          <div style={{ position: "relative", textAlign: "center" }}>
            <img src={LOGO_SRC} alt="Stayin" crossOrigin="anonymous" style={{ width: 360, height: "auto", objectFit: "contain", display: "block", margin: "0 auto" }} />
          </div>

          {/* Match number — horizontally written but vertically stretched */}
          {matchNumber !== EMPTY && (
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: ".22em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.28)", marginBottom: 6 }}>MATCH</div>
              <div style={{ fontFamily: fCondensed, fontSize: 140, fontWeight: 900, letterSpacing: "-.02em", lineHeight: 1, background: "linear-gradient(180deg,#1abfb0 0%,rgba(255,255,255,.8) 50%,#1abfb0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "inline-block" }}>
                {matchNumber.replace("#", "")}
              </div>
            </div>
          )}

          {/* Badge */}
          <div style={{ position: "relative", padding: "20px 52px", borderRadius: 999, border: "2.5px solid rgba(255,255,255,.45)", background: "rgba(255,255,255,.12)", color: "#fff", fontSize: typeLabel.length > 4 ? 46 : 52, fontWeight: 900, letterSpacing: "-.5px", lineHeight: 1 }}>
            {typeLabel}
          </div>

          {/* URL */}
          <div style={{ position: "relative", fontSize: 26, fontWeight: 700, color: "rgba(255,255,255,.32)", letterSpacing: ".08em" }}>
            {SITE_URL}
          </div>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Top stripe */}
          <div style={{ height: 6, background: topBar, flexShrink: 0 }} />
          {/* Subtle blobs */}
          <div style={{ position: "absolute", width: "55%", height: "90%", top: "-30%", right: "-12%", borderRadius: "50%", background: "radial-gradient(circle,rgba(26,58,143,.05),transparent 70%)", pointerEvents: "none" as const }} />
          <div style={{ position: "absolute", width: "35%", height: "60%", bottom: "-20%", left: "5%", borderRadius: "50%", background: "radial-gradient(circle,rgba(192,32,44,.04),transparent 70%)", pointerEvents: "none" as const }} />
          {/* Content */}
          <div style={{ flex: 1, padding: "60px 80px 60px 80px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 0 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamPill({ name, flagName, side, isHe }: { name: string; flagName?: string | null; side: "left" | "right"; isHe: boolean }) {
  const fontSize = fitFont(name, isHe ? 50 : 47, isHe ? 8 : 10, isHe ? 12 : 15, 31);
  const flexDirection = side === "left" ? "row" : "row-reverse";
  const textAlign = side === "left" ? "left" : "right";
  return (
    <div
      style={{
        width: 402,
        height: 104,
        borderRadius: 40,
        border: "1.5px solid rgba(135,171,225,.45)",
        background: "linear-gradient(180deg,rgba(255,255,255,.78),rgba(246,251,255,.70))",
        boxShadow: "0 8px 28px rgba(54,128,201,.12), inset 0 1px 0 rgba(255,255,255,.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 22,
        padding: "0 26px",
        flexDirection,
        overflow: "hidden",
      }}
    >
      <Flag name={flagName} />
      <div
        dir={isHe ? "rtl" : "ltr"}
        style={{
          flex: 1,
          minWidth: 0,
          textAlign,
          color: navy,
          fontSize,
          fontWeight: 950,
          lineHeight: 1,
          letterSpacing: isHe ? "-0.045em" : "-0.035em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textShadow: "0 2px 0 rgba(255,255,255,.8)",
        }}
      >
        {name}
      </div>
    </div>
  );
}

function DataCell({ label, value, price = false, icon }: { label: string; value: string; price?: boolean; icon?: ReactNode }) {
  const cleaned = clean(value);
  const isEmpty = cleaned === EMPTY;
  return (
    <div style={{ minWidth: 0, textAlign: "center", padding: "0 12px" }}>
      <div style={{ minHeight: 30, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, color: cyan2, fontSize: 21, fontWeight: 850, lineHeight: 1, marginBottom: 14 }}>
        <span style={{ width: 26, height: 26, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
      </div>
      {isEmpty ? (
        <div style={{ width: 34, height: 3, background: "rgba(103,126,163,.32)", borderRadius: 999, margin: "18px auto 0" }} />
      ) : (
        <div
          style={{
            color: price ? cyan2 : text,
            fontSize: price ? fitFont(cleaned, 42, 7, 11, 30) : fitFont(cleaned, 33, 10, 15, 23),
            fontWeight: price ? 950 : 850,
            lineHeight: 1.05,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textShadow: price ? "0 0 14px rgba(20,223,243,.20)" : "0 1px 0 rgba(255,255,255,.75)",
          }}
        >
          {cleaned}
        </div>
      )}
    </div>
  );
}

function DataGrid({ items }: { items: Array<{ label: string; value: string; price?: boolean; icon?: ReactNode }> }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`, alignItems: "center" }}>
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} style={{ borderLeft: index === 0 ? "none" : `1.5px solid ${line}`, minWidth: 0 }}>
          <DataCell label={item.label} value={item.value} price={item.price} icon={item.icon} />
        </div>
      ))}
    </div>
  );
}

function TicketPreview({ listing, match, isHe }: { listing: ShareListing; match: ShareMatch; isHe: boolean }) {
  const homeName = teamName(match.home_team_name, isHe);
  const awayName = teamName(match.away_team_name, isHe);
  const shareType = listingTypeLabel(listing.type, isHe);
  const price = formatPrice(listing.price, listing.type, isHe);
  const quantity = listing.quantity ? `${listing.quantity}` : EMPTY;
  const matchNumber = match.fifa_match_number ? `#${match.fifa_match_number}` : EMPTY;
  const city = clean(match.city);
  const stadium = clean(match.stadium);
  const isWC = !!(match.fifa_match_number || (match.competition !== "state_cup" && match.competition !== "ligat_haal"));
  const stage = stageLabel(match.stage, isHe);
  const stadiumText = stadium !== EMPTY && city !== EMPTY ? `${stadium} · ${city}` : stadium !== EMPTY ? stadium : city;

  const rowOne = [
    { label: isHe ? "קטגוריה" : "Category", value: clean(listing.category), icon: smallIcon("ticket") },
    { label: isHe ? "שעה" : "Time", value: formatTime(match.match_time), icon: smallIcon("clock") },
    { label: isHe ? "תאריך" : "Date", value: formatDate(match.match_date), icon: smallIcon("date") },
    { label: isHe ? "עיר" : "City", value: city, icon: smallIcon("pin") },
    { label: isHe ? "משחק" : "Match", value: matchNumber, icon: smallIcon("match") },
  ];
  const rowTwo = [
    { label: isHe ? "כמות" : "Qty", value: quantity, icon: smallIcon("people") },
    { label: isHe ? "מושבים" : "Seats", value: clean(listing.seats_numbers), icon: smallIcon("seat") },
    { label: isHe ? "שורה" : "Row", value: clean(listing.seats_row), icon: smallIcon("seat") },
    { label: isHe ? "בלוק" : "Block", value: clean(listing.seats_block), icon: smallIcon("block") },
    { label: isHe ? "יחד" : "Together", value: yesNo(listing.seated_together, isHe), icon: smallIcon("people") },
    { label: isHe ? "מחיר" : "Price", value: price, price: true, icon: smallIcon("tag") },
  ];

  return (
    <CardShell typeLabel={shareType} isWC={isWC} matchNumber={matchNumber}>
      {/* Event badge + Price */}
      <div dir={isHe ? "rtl" : "ltr"} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: isWC ? "rgba(26,58,143,.07)" : "rgba(26,191,176,.07)", border: `1px solid ${isWC ? "rgba(26,58,143,.15)" : "rgba(26,191,176,.2)"}`, borderRadius: 10, padding: "10px 24px 10px 16px", marginBottom: 16 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: isWC ? "#1a3a8f" : "#1abfb0", flexShrink: 0 }} />
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isWC ? "#1a3a8f" : "#1abfb0" }}>{eventTitle(isHe, isWC)}</div>
          </div>
          <div style={{ fontSize: 30, color: "#7a8fa8", fontWeight: 500, lineHeight: 1.4 }}>{stage}{city !== EMPTY ? ` · ${city}` : ""}{formatDate(match.match_date) !== EMPTY ? ` · ${formatDate(match.match_date)}` : ""}{formatTime(match.match_time) !== EMPTY ? ` · ${formatTime(match.match_time)}` : ""}</div>
        </div>
        <div style={{ textAlign: "left" as const, flexShrink: 0 }}>
          <div style={{ fontSize: 120, fontWeight: 900, letterSpacing: "-5px", lineHeight: 1, background: isWC ? "linear-gradient(135deg,#1a3a8f,#1abfb0)" : "linear-gradient(135deg,#1abfb0,#006847)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{price}</div>
          <div style={{ fontSize: 22, color: "#94a3b8", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase" as const, marginTop: 8 }}>{isHe ? "מחיר לכרטיס" : "Price per ticket"}</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(13,27,62,.1),transparent)" }} />
      {/* Teams */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 24 }}>
        {/* Home */}
        <div style={{ display: "flex", alignItems: "center", gap: 28, justifyContent: "flex-start" }}>
          <Flag name={match.home_team_name} />
          <div style={{ fontSize: fitFont(homeName, 96, 7, 10, 58), fontWeight: 900, background: "linear-gradient(135deg,#0d1b3e,#1a3a8f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "-.04em", lineHeight: .92 }}>{homeName}</div>
        </div>
        {/* VS */}
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8 }}>
          <div style={{ width: 1, height: 40, background: "rgba(13,27,62,.08)" }} />
          <div style={{ fontSize: 32, color: "rgba(13,27,62,.14)", fontWeight: 300, letterSpacing: ".16em" }}>VS</div>
          <div style={{ width: 1, height: 40, background: "rgba(13,27,62,.08)" }} />
        </div>
        {/* Away */}
        <div style={{ display: "flex", alignItems: "center", gap: 28, justifyContent: "flex-end" }}>
          <div style={{ fontSize: fitFont(awayName, 96, 7, 10, 58), fontWeight: 900, background: "linear-gradient(135deg,#e63946,#8b0000)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "-.04em", lineHeight: .92, textAlign: "right" as const }}>{awayName}</div>
          <Flag name={match.away_team_name} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(13,27,62,.1),transparent)", margin: "0 0 4px" }} />
      {/* Info strip */}
      <div dir={isHe ? "rtl" : "ltr"} style={{ background: "rgba(13,27,62,.04)", border: "1px solid rgba(13,27,62,.07)", borderRadius: 22, padding: "36px 44px", display: "flex", alignItems: "center", gap: 0 }}>
        {[
          { l: isHe ? "קטגוריה" : "Cat", v: clean(listing.category).replace(/[A-Za-zא-ת]+\s*/g, "").trim() || clean(listing.category) },
          { l: isHe ? "בלוק" : "Block", v: clean(listing.seats_block) },
          { l: isHe ? "שורה" : "Row", v: clean(listing.seats_row) },
          { l: isHe ? "מושבים" : "Seats", v: clean(listing.seats_numbers) },
          { l: isHe ? "כמות" : "Qty", v: quantity },
          { l: isHe ? "יחד" : "Together", v: yesNo(listing.seated_together, isHe) },
        ].map((item, i, arr) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ flex: 1, textAlign: "center" as const }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" as const, color: "#94a3b8", marginBottom: 10 }}>{item.l}</div>
              {item.v === EMPTY
                ? <div style={{ width: 40, height: 2, background: "#e2e8f0", borderRadius: 1, margin: "18px auto 0" }} />
                : <div style={{ fontSize: 38, fontWeight: 900, color: "#1e293b", lineHeight: 1 }}>{item.v}</div>
              }
            </div>
            {i < arr.length - 1 && <div style={{ width: 1, height: 52, background: "rgba(13,27,62,.08)", flexShrink: 0 }} />}
          </div>
        ))}
      </div>
    </CardShell>
  );
}

export default function ShareListingTicketButton({ listing, match, isHe, size = "md", onClose, initialOpen = false }: Props) {
  const [open, setOpen] = useState(initialOpen);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { mounted, previewScale, isMobile } = useModalLayout(open);

  const shareUrl = useMemo(() => getShareUrl(listing.id, match.id), [listing.id, match.id]);
  const matchTitle = `${teamName(match.home_team_name, isHe)} ${isHe ? "נגד" : "vs"} ${teamName(match.away_team_name, isHe)}`;
  const shareText = isHe
    ? `מודעה ב-Stayin: ${listingTypeLabel(listing.type, true)} ל${matchTitle} במחיר ${formatPrice(listing.price, listing.type, true)}\n${shareUrl}`
    : `Stayin listing: ${listingTypeLabel(listing.type, false)} for ${matchTitle} at ${formatPrice(listing.price, listing.type, false)}\n${shareUrl}`;

  async function makeImage() {
    if (!cardRef.current) return null;
    setBusy(true);
    try {
      await waitForImages(cardRef.current);
      const opts = {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#f6fbff",
        style: { backgroundColor: "#f6fbff" },
      };
      await toPng(cardRef.current, opts);
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
      return await toPng(cardRef.current, opts);
    } finally {
      setBusy(false);
    }
  }

  async function downloadImage() {
    const dataUrl = await makeImage();
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `stayin-listing-${listing.id}.png`;
    link.href = dataUrl;
    link.click();
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function shareWhatsApp() {
    const dataUrl = await makeImage();
    if (dataUrl && navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `stayin-listing-${listing.id}.png`, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: "Stayin", text: shareText, files: [file], url: shareUrl });
          return;
        }
      } catch {
        // fallback below
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
  }

  const isSm = size === "sm";
  const modal = open ? (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(5,12,28,0.70)",
        backdropFilter: "blur(14px)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        padding: isMobile ? 0 : 18,
      }}
    >
      <div
        dir={isHe ? "rtl" : "ltr"}
        style={{
          width: isMobile ? "min(100%, 440px)" : "min(1160px, 100%)",
          maxHeight: "94vh",
          overflowY: "auto",
          overflowX: "hidden",
          borderRadius: isMobile ? "28px 28px 0 0" : 30,
          background: "rgba(255,255,255,.97)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 -1px 0 rgba(255,255,255,.9), 0 -40px 90px rgba(13,27,62,.20)",
        }}
      >
        {isMobile && <div style={{ width: 36, height: 4, background: "#e2e8f0", borderRadius: 99, margin: "12px auto 0" }} />}

        <div style={{ padding: isMobile ? "14px 20px 12px" : "18px 22px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "1px solid rgba(13,27,62,.06)" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 850, letterSpacing: ".16em", textTransform: "uppercase", background: `linear-gradient(135deg,${navy},${cyan2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 5 }}>
              Stayin · {isHe ? "שיתוף" : "Share"}
            </div>
            <div style={{ fontSize: isMobile ? 19 : 18, fontWeight: 900, color: text, letterSpacing: "-.4px" }}>
              {isHe ? "שתף את המודעה" : "Share your listing"}
            </div>
            <div style={{ fontSize: 11, color: muted, marginTop: 3 }}>
              {isHe ? "תמונת כרטיס מוכנה לשיתוף בקבוצות" : "Ready image for groups"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onClose?.();
            }}
            aria-label={isHe ? "סגור" : "Close"}
            style={{ width: 32, height: 32, borderRadius: 10, background: "#f1f5f9", border: "1px solid #e8edf5", color: muted, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}
          >
            ×
          </button>
        </div>

        <div style={{ margin: "14px 16px", borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 36px rgba(13,27,62,.16), 0 0 0 1px rgba(13,27,62,.06)" }}>
          <div style={{ width: "100%", overflow: "hidden", background: "#f6fbff" }}>
            <div style={{ width: "100%", height: Math.ceil(TICKET_HEIGHT * previewScale), display: "flex", justifyContent: "center", alignItems: "flex-start", overflow: "hidden" }}>
              <div style={{ width: TICKET_WIDTH, height: TICKET_HEIGHT, transform: `scale(${previewScale})`, transformOrigin: "top center", flexShrink: 0 }}>
                <div ref={cardRef} style={{ width: TICKET_WIDTH, height: TICKET_HEIGHT }}>
                  <TicketPreview listing={listing} match={match} isHe={isHe} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ margin: "0 16px 14px", padding: "10px 14px", background: "rgba(20,223,243,.06)", border: "1px solid rgba(20,223,243,.16)", borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: cyan, flexShrink: 0 }} />
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 500, lineHeight: 1.4 }}>
            {isHe ? <>כל שיתוף מפרסם את הכרטיס שלך — <strong style={{ color: navy }}>Stayin</strong> גדל כשאתה משתף</> : <>Every share promotes your listing — <strong style={{ color: navy }}>Stayin</strong> grows when you share</>}
          </div>
        </div>

        <div style={{ padding: "0 16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            onClick={shareWhatsApp}
            disabled={busy}
            style={{ width: "100%", height: 56, borderRadius: 18, border: "none", cursor: busy ? "wait" : "pointer", background: "linear-gradient(135deg,#25D366,#20BA5A)", color: "#fff", display: "flex", alignItems: "center", gap: 12, padding: "0 20px", boxShadow: "0 4px 16px rgba(37,211,102,.3), 0 1px 0 rgba(255,255,255,.2) inset", opacity: busy ? 0.7 : 1, transition: "all 180ms" }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>💬</div>
            <div style={{ flex: 1, textAlign: isHe ? "right" : "left" }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{busy ? (isHe ? "מכין תמונה..." : "Creating...") : isHe ? "שתף בוואטסאפ" : "Share WhatsApp"}</div>
              {!busy && <div style={{ fontSize: 10, opacity: 0.7, marginTop: 1 }}>{isHe ? "שלח ישירות לקבוצה" : "Send directly to group"}</div>}
            </div>
            <div style={{ fontSize: 16, opacity: 0.6 }}>{isHe ? "←" : "→"}</div>
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button
              type="button"
              onClick={downloadImage}
              disabled={busy}
              style={{ height: 52, borderRadius: 16, border: "1px solid rgba(26,58,143,.12)", cursor: busy ? "wait" : "pointer", background: "linear-gradient(135deg,rgba(26,58,143,.06),rgba(20,223,243,.05))", color: navy, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", opacity: busy ? 0.7 : 1, transition: "all 150ms" }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(26,58,143,.08)", border: "1px solid rgba(26,58,143,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>⬇</div>
              <div style={{ fontSize: 12, fontWeight: 750 }}>{busy ? "..." : isHe ? "הורד תמונה" : "Download"}</div>
            </button>
            <button
              type="button"
              onClick={copyLink}
              style={{ height: 52, borderRadius: 16, border: "1px solid #e8edf5", cursor: "pointer", background: "#f8f9fc", color: copied ? cyan2 : "#475569", display: "flex", alignItems: "center", gap: 10, padding: "0 16px", transition: "all 150ms", boxShadow: "0 1px 4px rgba(13,27,62,.05)" }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "#fff", border: "1px solid #e8edf5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{copied ? "✓" : "🔗"}</div>
              <div style={{ fontSize: 12, fontWeight: 750 }}>{copied ? (isHe ? "הועתק!" : "Copied!") : isHe ? "העתק קישור" : "Copy link"}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          border: "1px solid rgba(26,58,143,.2)",
          background: "rgba(26,58,143,.06)",
          color: navy,
          borderRadius: isSm ? 5 : 8,
          minHeight: isSm ? 34 : 40,
          padding: isSm ? "0 12px" : "0 16px",
          fontSize: isSm ? 11 : 12,
          fontWeight: 750,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          whiteSpace: "nowrap",
        }}
      >
        📤 {isHe ? "שתף מודעה" : "Share"}
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
