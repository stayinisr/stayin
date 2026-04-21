"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../lib/LanguageContext";
import { useToast } from "../../../components/ToastProvider";
import { teamName, flagImgSrc } from "../../../lib/teams";

// ── Types ─────────────────────────────────────────────────────────────────────
type MatchItem = {
  id: string;
  fifa_match_number: number;
  home_team_name: string | null;
  away_team_name: string | null;
  stage: string;
  city: string;
  stadium: string;
  match_date: string;
  match_time: string;
};

type ListingItem = {
  id?: string;
  match_id: string;
  price: number;
  type: string;
  status?: string;
  expires_at?: string | null;
  archived_at?: string | null;
};

// ── WC 2026 Colors ────────────────────────────────────────────────────────────
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
} as const;

const ACCENTS = [C.usa, C.canada, C.mexico];

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

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(date: string, time: string, isHe: boolean) {
  const [left, setLeft] = useState<string | null>(null);

  useEffect(() => {
    const cleanTime =
      (time || "20:00").replace(/:\d\d$/, "").slice(0, 5) || "20:00";
    const target = new Date(`${date}T${cleanTime}:00`);

    function tick() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setLeft(null);
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);

      if (isHe) {
        setLeft(d > 0 ? `${d}י ${h}ש` : `${h}ש ${m}ד`);
      } else {
        setLeft(d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`);
      }
    }

    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [date, time, isHe]);

  return left;
}

// ── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({
  match,
  idx,
  sell,
  buy,
  priceRange,
  hot,
  saved,
  onSave,
  isHe,
}: {
  match: MatchItem;
  idx: number;
  sell: number;
  buy: number;
  priceRange: string | null;
  hot: boolean;
  saved: boolean;
  onSave: (id: string) => void;
  isHe: boolean;
}) {
  const accent = ACCENTS[idx % 3];
  const countdown = useCountdown(match.match_date, match.match_time, isHe);
  const [hov, setHov] = useState(false);
  const showFlags = isGroupStage(match.stage);

  function renderTeam(teamValue: string | null) {
    const label = teamName(teamValue, isHe);
    const canShowFlag = showFlags && hasRealTeam(teamValue);
    const imgSrc = canShowFlag ? flagImgSrc(teamValue) : "";

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: isHe
            ? "var(--font-he,'Heebo',sans-serif)"
            : "var(--font-dm,'DM Sans',sans-serif)",
          fontSize: "15px",
          fontWeight: 600,
          letterSpacing: "-0.1px",
          lineHeight: 1.3,
        }}
      >
        {canShowFlag && imgSrc ? (
          <span
            style={{
              width: "20px",
              height: "14px",
              borderRadius: "4px",
              overflow: "hidden",
              background: "#fff",
              border: "1px solid rgba(13,27,62,0.10)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 1px 2px rgba(13,27,62,0.04)",
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

  return (
    <div
      style={{
        background: hov
          ? "rgba(248,249,252,0.9)"
          : "rgba(255,255,255,0.75)",
        transition: "background 120ms",
        position: "relative",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{ height: "2px", background: accent }} />

      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.faint,
              }}
            >
              {isHe ? "משחק" : "Match"} {String(match.fifa_match_number).padStart(2, "0")}
            </span>

            {hot && (
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "2px 7px",
                  borderRadius: "3px",
                  background: "rgba(230,57,70,0.08)",
                  color: C.canada,
                  border: "1px solid rgba(230,57,70,0.2)",
                }}
              >
                🔥 {isHe ? "חם" : "Hot"}
              </span>
            )}

            {countdown && (
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: "3px",
                  background: "rgba(26,58,107,0.07)",
                  color: C.usa,
                  border: "1px solid rgba(26,58,107,0.15)",
                }}
              >
                {countdown}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              onSave(match.id);
            }}
            style={{
              width: "26px",
              height: "26px",
              border: `1px solid ${
                saved ? "rgba(230,57,70,0.35)" : C.border
              }`,
              borderRadius: "3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              color: saved ? C.canada : C.faint,
              background: saved ? "rgba(230,57,70,0.06)" : "transparent",
              cursor: "pointer",
              transition: "all 150ms",
              flexShrink: 0,
            }}
          >
            {saved ? "♥" : "♡"}
          </button>
        </div>

        <Link
          href={`/matches/${match.id}`}
          style={{ textDecoration: "none", display: "block", marginBottom: "7px" }}
        >
          <div
            style={{
              fontFamily: isHe
                ? "var(--font-he,'Heebo',sans-serif)"
                : "var(--font-dm,'DM Sans',sans-serif)",
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "-0.1px",
              color: C.text,
              lineHeight: 1.3,
            }}
          >
            {renderTeam(match.home_team_name)}
            <br />
            <span
              style={{
                color: C.hint,
                fontWeight: 400,
                fontSize: "12px",
              }}
            >
              {isHe ? "נגד " : "vs "}
            </span>
            {renderTeam(match.away_team_name)}
          </div>
        </Link>

        <div
          style={{
            fontSize: "10px",
            color: C.hint,
            letterSpacing: "0.03em",
            marginBottom: "16px",
            lineHeight: 1.6,
          }}
        >
          {match.city} · {match.stadium} · {formatMatchDate(match.match_date)}
        </div>

        {sell === 0 && buy === 0 ? (
          <Link
            href={`/post-listing?matchId=${match.id}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "9px 14px",
              border: `1px solid ${C.border}`,
              borderRadius: "3px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: C.usa,
              textDecoration: "none",
              transition: "all 150ms",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(26,58,107,0.05)";
              (e.currentTarget as HTMLElement).style.borderColor = C.usa;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.borderColor = C.border;
            }}
          >
            + {isHe ? "היה הראשון לפרסם" : "Be first to post"}
          </Link>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-syne,'Syne',sans-serif)",
                fontSize: "14px",
                fontWeight: 800,
                color: priceRange ? C.usa : C.faint,
                letterSpacing: "-0.2px",
              }}
            >
              {priceRange || "—"}
            </span>

            <div style={{ display: "flex", gap: "4px" }}>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "2px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  background: "rgba(26,58,107,0.07)",
                  color: C.usa,
                }}
              >
                {sell} {isHe ? "מכירה" : "sell"}
              </span>

              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "2px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  background: "#f1f5f9",
                  color: C.hint,
                }}
              >
                {buy} {isHe ? "קנייה" : "buy"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── All stages for filter chips ───────────────────────────────────────────────
const STAGE_ORDER = [
  "Round of 32",
  "Round of 16",
  "Quarter Finals",
  "Semi Finals",
  "Third Place",
  "Final",
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [pulse, setPulse] = useState(false);

  const [query, setQuery] = useState("");
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [savedOnly, setSavedOnly] = useState(false);
  const [withListings, setWithListings] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { t, lang } = useLanguage();
  const toast = useToast();
  const isHe = lang === "he";

  useEffect(() => {
    try {
      setSaved(new Set(JSON.parse(localStorage.getItem("saved_matches") || "[]")));
    } catch {}

    load();
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, s) => setIsLoggedIn(!!s?.user));

    const ch = supabase
      .channel("home-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "listings" },
        (p) => {
          setPulse(true);
          setTimeout(() => setPulse(false), 1200);

          if (p.eventType === "INSERT") {
            setListings((prev) => [...prev, p.new as ListingItem]);
            toast.success(isHe ? "מודעה חדשה נוספה!" : "New listing added!");
          } else if (p.eventType === "DELETE") {
            setListings((prev) => prev.filter((l) => l.id !== p.old.id));
          } else if (p.eventType === "UPDATE") {
            setListings((prev) =>
              prev.map((l) => (l.id === p.new.id ? (p.new as ListingItem) : l))
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(ch);
    };
  }, [isHe, toast]);

  async function load() {
    setLoading(true);

    const today = getTodayDateString();
    const { data: m } = await supabase
      .from("matches")
      .select("*")
      .order("fifa_match_number", { ascending: true });

    const matchesData = (m || []) as MatchItem[];
    const publicMatchIds = matchesData
      .filter((match) => match.match_date >= today)
      .map((match) => match.id);

    let listingsData: ListingItem[] = [];

    if (publicMatchIds.length) {
      const { data: l } = await supabase
        .from("listings")
        .select("id,match_id,price,type,status,archived_at")
        .eq("status", "active")
        .is("archived_at", null)
        .in("match_id", publicMatchIds);

      listingsData = (l || []) as ListingItem[];
    }

    setMatches(matchesData.filter((match) => match.match_date >= today));
    setListings(listingsData);
    setLoading(false);
  }

  const toggleSave = useCallback(
    (id: string) => {
      setSaved((prev) => {
        const next = new Set(prev);

        if (next.has(id)) {
          next.delete(id);
          toast.show(isHe ? "הוסר מהמועדפים" : "Removed", "info");
        } else {
          next.add(id);
          toast.success(isHe ? "נשמר ❤️" : "Saved ❤️");
        }

        localStorage.setItem("saved_matches", JSON.stringify([...next]));
        return next;
      });
    },
    [isHe, toast]
  );

  function isActive(l: ListingItem) {
    return l.status === "active";
  }

  const availableStages = useMemo(() => {
    const found = [...new Set(matches.map((m) => m.stage).filter(Boolean))];
    const hasGroups = found.some((s) => s.startsWith("Group"));
    const nonGroups = STAGE_ORDER.filter((s) =>
      found.some((f) => f.toLowerCase().includes(s.toLowerCase()))
    );
    return hasGroups ? ["Group Stage", ...nonGroups] : nonGroups;
  }, [matches]);

  function matchesStage(match: MatchItem) {
    if (!activeStage) return true;
    if (activeStage === "Group Stage") {
      return match.stage?.startsWith("Group") || match.stage === "Group Stage";
    }
    return match.stage === activeStage;
  }

  function getSell(id: string) {
    return listings.filter(
      (l) => l.match_id === id && l.type === "sell" && isActive(l)
    ).length;
  }

  function getBuy(id: string) {
    return listings.filter(
      (l) => l.match_id === id && l.type === "buy" && isActive(l)
    ).length;
  }

  function isHot(id: string) {
    return listings.filter((l) => l.match_id === id && isActive(l)).length >= 10;
  }

  function getPrice(id: string) {
    const prices = listings
      .filter((l) => l.match_id === id && l.type === "sell" && isActive(l))
      .map((l) => Number(l.price))
      .filter(Boolean);

    if (!prices.length) return null;

    const mn = Math.min(...prices);
    const mx = Math.max(...prices);
    return mn === mx ? `$${mn}` : `$${mn}–$${mx}`;
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const mn = minPrice ? Number(minPrice) : null;
    const mx = maxPrice ? Number(maxPrice) : null;

    return matches.filter((m) => {
      if (savedOnly && !saved.has(m.id)) return false;
      if (withListings && listings.filter((l) => l.match_id === m.id && isActive(l)).length === 0) return false;
      if (!matchesStage(m)) return false;

      const searchText = [
        m.fifa_match_number,
        m.home_team_name,
        m.away_team_name,
        teamName(m.home_team_name, true),
        teamName(m.away_team_name, true),
        teamName(m.home_team_name, false),
        teamName(m.away_team_name, false),
        m.stage,
        stageLabel(m.stage, true),
        stageLabel(m.stage, false),
        m.city,
        m.stadium,
      ]
        .join(" ")
        .toLowerCase();

      if (q && !searchText.includes(q)) {
        return false;
      }

      if (mn !== null || mx !== null) {
        const prices = listings
          .filter((l) => l.match_id === m.id && l.type === "sell" && isActive(l))
          .map((l) => Number(l.price));

        if (
          !prices.length ||
          !prices.some(
            (p) => (mn === null || p >= mn) && (mx === null || p <= mx)
          )
        ) {
          return false;
        }
      }

      return true;
    });
  }, [matches, listings, query, activeStage, savedOnly, withListings, saved, minPrice, maxPrice]);

  const activeCount = listings.filter(isActive).length;

  const W = { maxWidth: "1100px", margin: "0 auto", padding: "0 16px" };
  const smallCaps = {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: C.hint,
  } as React.CSSProperties;

  return (
    <main style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{`
        @keyframes lp{0%,100%{opacity:1}50%{opacity:.2}}
        .ld{animation:lp 2s infinite}
        @keyframes shi{from{background-position:-600px 0}to{background-position:600px 0}}
        .sk{background:linear-gradient(90deg,#f0f4f8 25%,#e8edf5 50%,#f0f4f8 75%);background-size:800px 100%;animation:shi 1.4s infinite linear;border-radius:2px;}
      `}</style>

      <div
        style={{
          height: "3px",
          background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)`,
        }}
      />

      <div style={{ background: "linear-gradient(135deg,#eef4ff 0%,#fdf0f2 50%,#edfff8 100%)", borderBottom: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
        {[
          { w:380, t:-100, r:-60,  c:"rgba(26,58,107,.07)"  },
          { w:300, b:-80,  l:-40,  c:"rgba(230,57,70,.06)"  },
          { w:240, t:30,   r:"28%",c:"rgba(0,104,71,.05)"   },
        ].map((b,i) => (
          <div key={i} style={{ position:"absolute", width:b.w, height:b.w, borderRadius:"50%", background:`radial-gradient(circle,${b.c},transparent 70%)`, top:(b as any).t, bottom:(b as any).b, left:(b as any).l, right:(b as any).r, pointerEvents:"none" as const }} />
        ))}
        <div style={{ ...W, paddingTop: "44px", paddingBottom: "40px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "22px",
              ...smallCaps,
            }}
          >
            <span style={{ display: "flex", gap: "4px" }}>
              {[C.usa, C.canada, C.mexico].map((c) => (
                <span
                  key={c}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: c,
                    display: "inline-block",
                  }}
                />
              ))}
            </span>
            {isHe
              ? "מרקטפלייס מונדיאל 2026 · ארה״ב · קנדה · מקסיקו"
              : "World Cup 2026 · USA · Canada · México"}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "32px",
              alignItems: "center",
            }}
            className="hero-grid"
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: C.usa,
                  marginBottom: "16px",
                }}
              >
                STAY IN THE GAME
              </div>

              {isHe ? (
                <h1
                  className="hero-h1"
                  style={{
                    fontFamily: "var(--font-he,'Heebo',sans-serif)",
                    fontSize: "clamp(40px,5.5vw,68px)",
                    fontWeight: 900,
                    lineHeight: 1,
                    letterSpacing: "-0.5px",
                    marginBottom: "18px",
                  }}
                >
                  <span style={{ color: C.usa }}>כרטיסים</span> <span style={{ color: C.canada }}>למונדיאל</span>
                  <br />
                  <span style={{ color: C.mexico }}>ללא </span><span style={{ color: C.usa }}>עמלות.</span>
                </h1>
              ) : (
                <h1
                  className="hero-h1"
                  style={{
                    fontFamily: "var(--font-syne,'Syne',sans-serif)",
                    fontSize: "clamp(40px,5.5vw,60px)",
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: "0.02em",
                    marginBottom: "18px",
                  }}
                >
                  <span style={{ color: C.usa }}>WORLD CUP </span><span style={{ color: C.canada }}>TICKETS.</span>
                  <br />
                  <span style={{ color: C.mexico }}>NO </span><span style={{ color: C.usa }}>FEES.</span>
                </h1>
              )}

              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 400,
                  color: C.muted,
                  lineHeight: 1.8,
                  maxWidth: "420px",
                  marginBottom: "28px",
                  letterSpacing: isHe ? "0" : "0.01em",
                  fontFamily: isHe
                    ? "var(--font-he,'Heebo',sans-serif)"
                    : "var(--font-dm,'DM Sans',sans-serif)",
                }}
              >
                {isHe
                  ? "בלי הודעות חוזרות ובלי בלאגן — כל המודעות במקום אחד, פנייה ישירה בוואטסאפ."
                  : "No repeated messages, no chaos — all listings in one place, contact directly on WhatsApp."}
              </p>

              <div
                className="hero-btns"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <a
                  href="#matches"
                  style={{
                    padding: "12px 24px",
                    background: "transparent",
                    color: C.usa,
                    fontSize: "13px",
                    fontWeight: 700,
                    borderRadius: "4px",
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                    border: `2px solid ${C.usa}`,
                    transition: "all 150ms",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = C.usa;
                    (e.currentTarget as HTMLElement).style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = C.usa;
                  }}
                >
                  {isHe ? "צפה במשחקים ↓" : "Browse matches ↓"}
                </a>

                {isLoggedIn ? (
                  <Link
                    href="/post-listing"
                    style={{
                      padding: "12px 22px",
                      border: `1px solid ${C.border}`,
                      color: C.muted,
                      fontSize: "13px",
                      fontWeight: 500,
                      borderRadius: "4px",
                      textDecoration: "none",
                      background: C.white,
                      transition: "border-color 150ms,color 150ms",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = C.usa;
                      (e.currentTarget as HTMLElement).style.color = C.usa;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = C.border;
                      (e.currentTarget as HTMLElement).style.color = C.muted;
                    }}
                  >
                    {isHe ? "+ פרסם מודעה" : "+ Post listing"}
                  </Link>
                ) : null}
              </div>
            </div>

            <div
              className="hero-stats"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "1px",
                background: C.border,
                border: `1px solid ${C.border}`,
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              {[
                { val: `${matches.length || 64}`, lbl: isHe ? "משחקים" : "Matches", color: C.usa },
                { val: activeCount, lbl: isHe ? "מודעות פעילות" : "Live listings", color: C.text, live: true },
                { val: "WA", lbl: isHe ? "קשר ישיר" : "Direct contact", color: C.mexico },
              ].map((s, i) => (
                <div key={i} style={{ background: "transparent", padding: "18px 14px", textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-syne,'Syne',sans-serif)",
                      fontSize: "22px",
                      fontWeight: 800,
                      color: s.color,
                      letterSpacing: "-0.5px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                    }}
                  >
                    {s.val}
                    {s.live && (
                      <span
                        className="ld"
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: pulse ? "#34d399" : "#22c55e",
                          display: "inline-block",
                          transition: "background 400ms",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ ...smallCaps, marginTop: "4px" }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="matches" style={{ ...W, paddingTop: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: `1px solid ${C.border}`,
            background: "rgba(255,255,255,0.8)",
            borderRadius: "4px",
            marginBottom: "10px",
            backdropFilter: "blur(8px)",
            transition: "border-color 150ms",
          }}
          onFocusCapture={(e) => (e.currentTarget.style.borderColor = C.usa)}
          onBlurCapture={(e) => (e.currentTarget.style.borderColor = C.border)}
        >
          <span style={{ padding: "0 14px", fontSize: "16px", color: C.faint }}>⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: C.text,
              fontSize: "13px",
              padding: "12px 0",
              fontFamily: "var(--font-dm),var(--font-he),sans-serif",
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                padding: "0 14px",
                background: "none",
                border: "none",
                color: C.hint,
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: C.hint,
              flexShrink: 0,
            }}
          >
            {isHe ? "טווח מחיר" : "Price range"}
          </span>

          <div style={{ display: "flex", flex: 1, gap: "8px" }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                border: `1px solid ${C.border}`,
                borderRadius: "4px",
                background: C.white,
              }}
            >
              <span style={{ padding: "0 10px", fontSize: "12px", color: C.faint }}>$</span>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder={isHe ? "מינימום" : "Min"}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: C.text,
                  fontSize: "12px",
                  padding: "10px 0",
                  fontFamily: "var(--font-dm),var(--font-he),sans-serif",
                }}
              />
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                border: `1px solid ${C.border}`,
                borderRadius: "4px",
                background: C.white,
              }}
            >
              <span style={{ padding: "0 10px", fontSize: "12px", color: C.faint }}>$</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder={isHe ? "מקסימום" : "Max"}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: C.text,
                  fontSize: "12px",
                  padding: "10px 0",
                  fontFamily: "var(--font-dm),var(--font-he),sans-serif",
                }}
              />
            </div>

            {(minPrice || maxPrice) && (
              <button
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                }}
                style={{
                  padding: "0 12px",
                  background: "none",
                  border: `1px solid ${C.border}`,
                  borderRadius: "4px",
                  color: C.hint,
                  cursor: "pointer",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
          <button
            onClick={() => {
              setActiveStage(null);
              setSavedOnly(false);
            }}
            style={{
              padding: "5px 14px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              border: `1px solid ${!activeStage && !savedOnly ? C.usa : C.border}`,
              color: !activeStage && !savedOnly ? C.usa : C.hint,
              background: !activeStage && !savedOnly ? "rgba(26,58,107,0.05)" : C.white,
              cursor: "pointer",
              borderRadius: "3px",
              transition: "all 150ms",
              fontFamily: "var(--font-dm),sans-serif",
            }}
          >
            {isHe ? "הכל" : "All"}
          </button>

          {availableStages.map((stage) => (
            <button
              key={stage}
              onClick={() => {
                setActiveStage(activeStage === stage ? null : stage);
                setSavedOnly(false);
              }}
              style={{
                padding: "5px 14px",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                border: `1px solid ${activeStage === stage ? C.usa : C.border}`,
                color: activeStage === stage ? C.usa : C.hint,
                background: activeStage === stage ? "rgba(26,58,107,0.05)" : C.white,
                cursor: "pointer",
                borderRadius: "3px",
                transition: "all 150ms",
                whiteSpace: "nowrap",
                fontFamily: "var(--font-dm),sans-serif",
              }}
            >
              {stageLabel(stage, isHe)}
            </button>
          ))}

          <button
            onClick={() => {
              setSavedOnly(!savedOnly);
              setActiveStage(null);
            }}
            style={{
              padding: "5px 14px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              border: `1px solid ${savedOnly ? "rgba(230,57,70,0.4)" : C.border}`,
              color: savedOnly ? C.canada : C.hint,
              background: savedOnly ? "rgba(230,57,70,0.05)" : C.white,
              cursor: "pointer",
              borderRadius: "3px",
              transition: "all 150ms",
              fontFamily: "var(--font-dm),sans-serif",
            }}
          >
            ♥ {isHe ? "שמורים" : "Saved"}
            {saved.size > 0 && ` (${saved.size})`}
          </button>

          {/* With listings checkbox */}
          <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", cursor: "pointer", userSelect: "none" as const }}>
            <span
              onClick={() => setWithListings(p => !p)}
              style={{
                width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0,
                border: `1.5px solid ${withListings ? C.usa : C.border}`,
                background: withListings ? C.usa : C.white,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                transition: "all 150ms",
              }}
            >
              {withListings && <span style={{ color: "#fff", fontSize: "10px", fontWeight: 800, lineHeight: 1 }}>✓</span>}
            </span>
            <span
              onClick={() => setWithListings(p => !p)}
              style={{ fontSize: "11px", fontWeight: 600, color: withListings ? C.usa : C.hint, transition: "color 150ms", whiteSpace: "nowrap" as const }}
            >
              {isHe ? "רק משחקים עם מודעות" : "Only with listings"}
            </span>
          </label>

          <div
            style={{
              marginInlineStart: "auto",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              color: C.hint,
            }}
          >
            <span
              className="ld"
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: pulse ? "#34d399" : "#22c55e",
                display: "inline-block",
                transition: "background 400ms",
              }}
            />
            {isHe ? "מתעדכן חי" : "Live updates"}
            {!loading && (
              <span style={{ color: C.usa, fontWeight: 600 }}>
                · {filtered.length}{" "}
                {filtered.length === 1 ? t.matchSingleFound : t.matchesFound}
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <span style={{ ...smallCaps }}>{isHe ? "משחקים" : "Matches"}</span>
          <span style={{ fontSize: "11px", color: C.usa, fontWeight: 600 }}>
            {activeCount} {isHe ? "מודעות פעילות" : "active listings"} ●
          </span>
        </div>
      </div>

      <div style={W}>
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
              gap: "1px",
              background: C.border,
              borderRadius: "6px",
              overflow: "hidden",
              border: `1px solid ${C.border}`,
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ background: C.white, padding: "20px" }}>
                <div
                  style={{
                    height: "2px",
                    background: ACCENTS[(i - 1) % 3],
                    marginBottom: "16px",
                    marginInline: "-20px",
                    marginTop: "-20px",
                  }}
                />
                {[60, 120, 90, 50].map((w, j) => (
                  <div
                    key={j}
                    className="sk"
                    style={{ height: "12px", width: `${w}%`, marginBottom: "12px" }}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: "60px 24px",
              textAlign: "center",
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: "6px",
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>
              {savedOnly ? "♡" : "⌕"}
            </div>
            <p style={{ fontSize: "14px", color: C.muted, marginBottom: "4px" }}>
              {savedOnly
                ? isHe
                  ? "אין משחקים שמורים עדיין"
                  : "No saved matches yet"
                : t.noMatchesFound}
            </p>
            <p style={{ fontSize: "12px", color: C.hint }}>
              {savedOnly
                ? isHe
                  ? "לחץ על ♡ בכרטיס להוסיף"
                  : "Tap ♡ on any card"
                : t.tryChangingFilters}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
              gap: "1px",
              background: C.border,
              borderRadius: "6px",
              overflow: "hidden",
              border: `1px solid ${C.border}`,
            }}
          >
            {filtered.map((match, i) => (
              <MatchCard
                key={match.id}
                match={match}
                idx={i}
                sell={getSell(match.id)}
                buy={getBuy(match.id)}
                priceRange={getPrice(match.id)}
                hot={isHot(match.id)}
                saved={saved.has(match.id)}
                onSave={toggleSave}
                isHe={isHe}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ ...W, marginTop: "28px" }}>
        <div style={{ borderRadius: "6px", overflow: "hidden", border: `1px solid ${C.border}` }}>
          <div
            style={{
              background: C.usa,
              padding: "16px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-syne,'Syne',sans-serif)",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                FIFA World Cup 2026
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,.5)",
                  marginTop: "2px",
                  fontWeight: 300,
                }}
              >
                {isHe
                  ? "48 נבחרות · 104 משחקים · 16 ערים מארחות"
                  : "48 teams · 104 matches · 16 host cities"}
              </div>
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#fff",
                background: "rgba(255,255,255,.12)",
                padding: "5px 12px",
                borderRadius: "3px",
                border: "1px solid rgba(255,255,255,.15)",
                whiteSpace: "nowrap",
              }}
            >
              Jun 11 – Jul 19
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: C.border }}>
            {[
              {
                dot: C.usa,
                name: isHe ? "ארצות הברית" : "United States",
                n: isHe ? "78 משחקים" : "78 matches",
              },
              {
                dot: C.canada,
                name: isHe ? "קנדה" : "Canada",
                n: isHe ? "13 משחקים" : "13 matches",
              },
              {
                dot: C.mexico,
                name: isHe ? "מקסיקו" : "México",
                n: isHe ? "13 משחקים" : "13 matches",
              },
            ].map((c) => (
              <div
                key={c.name}
                style={{
                  background: "rgba(255,255,255,0.8)",
                  padding: "12px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: c.dot,
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: C.text }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: "10px", color: C.hint, marginTop: "1px" }}>
                    {c.n}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...W, marginTop: "20px", paddingBottom: "52px" }}>
        <div
          style={{
            padding: "24px",
            border: `1px solid ${C.border}`,
            borderRadius: "6px",
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-syne,'Syne',sans-serif)",
                fontSize: "16px",
                fontWeight: 800,
                color: C.text,
                marginBottom: "4px",
                letterSpacing: "-0.3px",
              }}
            >
              {isHe ? "יש לך כרטיסים למכור?" : "Got tickets to sell?"}
            </div>
            <div style={{ fontSize: "12px", fontWeight: 300, color: C.muted, lineHeight: 1.75 }}>
              {isHe
                ? "פרסם מודעה תוך 60 שניות. קונים יפנו אליך ישירות בוואטסאפ."
                : "Post a listing in 60 seconds. Buyers contact you directly on WhatsApp."}
            </div>
          </div>

          <Link
            href={isLoggedIn ? "/post-listing" : "/auth"}
            style={{
              padding: "12px 26px",
              background: C.usa,
              color: "#fff",
              fontSize: "13px",
              fontWeight: 700,
              borderRadius: "4px",
              textDecoration: "none",
              whiteSpace: "nowrap",
              letterSpacing: "0.02em",
              transition: "opacity 150ms",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = ".88")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            {isHe ? "פרסם מודעה →" : "Post listing →"}
          </Link>
        </div>
      </div>
    </main>
  );
}