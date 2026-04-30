"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../lib/LanguageContext";
import { useToast } from "../../components/ToastProvider";
import { teamName, flagImgSrc } from "../../lib/teams";
import ShareListingTicket from "../../components/ShareListingTicket";
import ShareAllTicket from "../../components/ShareAllTicket";

const C = {
  usa: "#1a3a6b",
  canada: "#e63946",
  mexico: "#006847",
  gold: "#d4a017",
  border: "#e8edf5",
  text: "#0d1b3e",
  muted: "#64748b",
  hint: "#94a3b8",
  faint: "#cbd5e1",
  bg: "#f8f9fc",
  teal: "#1abfb0",
  blue: "#1a3a8f",
  green: "#006847",
};

type Plan = "free" | "premium" | "unlimited";

const PLAN_LIMITS = {
  free: { max_listings: 10, max_featured: 2, bump_hours: 4 },
  premium: { max_listings: 25, max_featured: 5, bump_hours: 1 },
  unlimited: { max_listings: 9999, max_featured: 20, bump_hours: 1 },
};

function getPlanLimits(plan: Plan) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

type Listing = {
  id: string;
  match_id: string;
  type: string;
  category: string;
  quantity: number;
  price: number;
  notes: string | null;
  status: string;
  expires_at: string | null;
  is_featured?: boolean;
  last_bumped_at?: string | null;
  first_published_at?: string | null;
  archived_at?: string | null;
  israeli_match_id?: string | null;
  seated_together?: string | null;
  seats_block?: string | null;
  seats_row?: string | null;
  seats_numbers?: string | null;
  match?: {
    fifa_match_number: number;
    home_team_name: string | null;
    away_team_name: string | null;
    city: string;
    match_date: string;
    stage?: string | null;
  } | null;
  ilMatch?: {
    home_team: string;
    away_team: string;
    home_team_en: string;
    away_team_en: string;
    city: string | null;
    stadium: string | null;
    match_date: string;
    match_time: string | null;
    round: string;
    round_en: string;
    competition: string;
    stage?: string | null;
  } | null;
};

function isGroupStage(stage?: string | null) {
  return !!stage && (stage.startsWith("Group") || stage === "Group Stage");
}

function hasRealTeam(name: string | null | undefined) {
  return !!name && name !== "TBD" && name !== "TBC";
}

function stageLabel(stage: string | null | undefined, isHe: boolean) {
  if (!stage) return "";
  if (!isHe) return stage;

  if (stage === "Group Stage") return "שלב הבתים";
  if (stage === "Round of 32") return "32 האחרונות";
  if (stage === "Round of 16") return "16 האחרונות";
  if (stage === "Quarter Finals") return "רבע הגמר";
  if (stage === "Semi Finals") return "חצי הגמר";
  if (stage === "Third Place") return "מקום שלישי";
  if (stage === "Final") return "הגמר";

  const groupMatch = stage.match(/^Group\s+([A-Z])$/i);
  if (groupMatch) return `בית \u2068${groupMatch[1].toUpperCase()}\u2069`;

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

function formatMatchMeta(
  match:
    | {
        city: string;
        match_date: string;
        stage?: string | null;
      }
    | null
    | undefined,
  isHe: boolean
) {
  if (!match) return "";
  return [
    match.stage ? stageLabel(match.stage, isHe) : "",
    match.city,
    formatMatchDate(match.match_date),
  ]
    .filter(Boolean)
    .join(" · ");
}

function TeamInline({
  name,
  stage,
  isHe,
}: {
  name: string | null;
  stage?: string | null;
  isHe: boolean;
}) {
  const showFlag = isGroupStage(stage) && hasRealTeam(name);
  const imgSrc = showFlag ? flagImgSrc(name) : "";
  const label = teamName(name, isHe);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: isHe
          ? "var(--font-he,'Heebo',sans-serif)"
          : "var(--font-dm,'DM Sans',sans-serif)",
        fontSize: "13px",
        fontWeight: 600,
        color: C.muted,
        lineHeight: 1.35,
        verticalAlign: "middle",
      }}
    >
      {showFlag && imgSrc ? (
        <span
          style={{
            width: "16px",
            height: "11px",
            borderRadius: "3px",
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

function BumpTimer({
  lastBumped,
  plan,
  isHe,
  onBump,
}: {
  lastBumped?: string | null;
  plan: Plan;
  isHe: boolean;
  onBump: () => void;
}) {
  const [ms, setMs] = useState(0);
  const bumpHours = getPlanLimits(plan).bump_hours;

  useEffect(() => {
    if (!lastBumped) {
      setMs(0);
      return;
    }
    function tick() {
      setMs(
        Math.max(
          0,
          new Date(lastBumped!).getTime() + bumpHours * 3600000 - Date.now()
        )
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastBumped, bumpHours]);

  const canBump = ms === 0;
  const h = Math.floor(ms / 3600000),
    m = Math.floor((ms % 3600000) / 60000),
    s = Math.floor((ms % 60000) / 1000);
  const timer = `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(
    2,
    "0"
  )}`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderRadius: "7px",
        border: `1px solid ${canBump ? "rgba(0,104,71,0.25)" : C.border}`,
        background: canBump ? "rgba(0,104,71,0.06)" : "rgba(0,0,0,0.02)",
        transition: "all 150ms",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: canBump ? C.mexico : C.hint,
          }}
        >
          🚀 {isHe ? "הקפץ מודעה" : "Bump listing"}
        </div>
        <div style={{ fontSize: "10px", color: C.muted, marginTop: "1px" }}>
          {canBump
            ? isHe
              ? "מעלה אותך לראש הרשימה"
              : "Moves you to top of list"
            : isHe
            ? `זמין שוב בעוד`
            : "Available again in"}
        </div>
      </div>
      {canBump ? (
        <button
          onClick={onBump}
          style={{
            padding: "8px 16px",
            fontSize: "12px",
            fontWeight: 800,
            border: "none",
            borderRadius: "6px",
            background: C.mexico,
            color: "#fff",
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          {isHe ? "הקפץ עכשיו →" : "Bump now →"}
        </button>
      ) : (
        <span
          style={{
            fontFamily: "var(--font-syne,'Syne',sans-serif)",
            fontSize: "18px",
            fontWeight: 800,
            color: C.hint,
            letterSpacing: "1px",
          }}
        >
          {timer}
        </span>
      )}
    </div>
  );
}

export default function MyListingsPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const toast = useToast();
  const isHe = lang === "he";

  const [email, setEmail] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareAllOpen, setShareAllOpen] = useState(false);
  const [shareListingId, setShareListingId] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan>("free");
  const [showListings, setShowListings] = useState<any[]>([]);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      router.push("/auth");
      return;
    }
    setEmail(user.email ?? null);

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium, plan")
      .eq("id", user.id)
      .maybeSingle();

    setPlan(
      (profile?.plan as Plan) ?? (profile?.is_premium ? "premium" : "free")
    );

    const { data: raw } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    const wcIds = [...new Set((raw || []).filter((l: any) => l.match_id).map((l: any) => l.match_id))];
    const ilIds = [...new Set((raw || []).filter((l: any) => l.israeli_match_id).map((l: any) => l.israeli_match_id))];
    let mMap: Record<string, any> = {};
    let ilMap: Record<string, any> = {};

    if (wcIds.length) {
      const { data: md } = await supabase
        .from("matches")
        .select("id,fifa_match_number,home_team_name,away_team_name,city,match_date,stage")
        .in("id", wcIds);
      mMap = Object.fromEntries((md || []).map((m: any) => [m.id, m]));
    }

    if (ilIds.length) {
      const { data: ild } = await supabase
        .from("israeli_matches")
        .select("id,home_team,away_team,home_team_en,away_team_en,city,stadium,match_date,match_time,round,round_en,competition")
        .in("id", ilIds);
      ilMap = Object.fromEntries((ild || []).map((m: any) => [m.id, m]));
    }

    setListings(
      (raw || []).map((l: any) => ({
        ...l,
        match: l.match_id ? mMap[l.match_id] || null : null,
        ilMatch: l.israeli_match_id ? ilMap[l.israeli_match_id] || null : null,
      }))
    );

    // Fetch show listings
    const { data: showRaw } = await supabase
      .from("show_listings")
      .select("id,type,price,quantity,ticket_type,show_date,show_time,status,created_at,expires_at,artist_id,venue_id,artists(name,name_he),venues(name,city_he)")
      .eq("user_id", user.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false });
    setShowListings(showRaw || []);

    setLoading(false);
  }

  function isExp(e: string | null) {
    return e ? new Date(e).getTime() < Date.now() : false;
  }

  const activeCount = useMemo(
    () =>
      listings.filter((l) => l.status === "active" && !isExp(l.expires_at))
        .length,
    [listings]
  );
  const featuredCount = useMemo(
    () =>
      listings.filter(
        (l) => !!l.is_featured && l.status === "active" && !isExp(l.expires_at)
      ).length,
    [listings]
  );
  const showActiveCount   = useMemo(() => showListings.filter((l: any) => l.status === "active" && !isExp(l.expires_at)).length, [showListings]);
  const showFeaturedCount = useMemo(() => showListings.filter((l: any) => !!l.is_featured && l.status === "active").length, [showListings]);
  const SHOW_MAX = 10;
  const SHOW_MAX_GOLD = 2;

  async function handleClose(id: string) {
    const { error } = await supabase
      .from("listings")
      .update({ status: "closed" })
      .eq("id", id);
    if (!error) {
      toast.success(isHe ? "המודעה נסגרה" : "Listing closed");
      loadPage();
    } else toast.error(isHe ? "שגיאה" : "Error");
  }

  async function handleRenew(id: string) {
    const exp = new Date(Date.now() + 7 * 86400000).toISOString();
    const { error } = await supabase
      .from("listings")
      .update({ status: "active", expires_at: exp })
      .eq("id", id);
    if (!error) {
      toast.success(isHe ? "חודש ל-7 ימים ✓" : "Renewed for 7 days ✓");
      loadPage();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(isHe ? "למחוק את המודעה?" : "Delete this listing?"))
      return;
    const { error } = await supabase
      .from("listings")
      .update({ archived_at: new Date().toISOString(), status: "closed" })
      .eq("id", id);
    if (!error) {
      toast.success(isHe ? "המודעה נמחקה" : "Listing deleted");
      loadPage();
    }
  }

  async function handleShowClose(id: string) {
    const { error } = await supabase.from("show_listings").update({ status: "closed" }).eq("id", id);
    if (!error) {
      toast.success(isHe ? "המודעה נסגרה" : "Listing closed");
      setShowListings(prev => prev.map((x: any) => x.id === id ? { ...x, status: "closed" } : x));
    } else toast.error(isHe ? "שגיאה" : "Error");
  }

  async function handleShowRenew(id: string) {
    const exp = new Date(Date.now() + 7 * 86400000).toISOString();
    const { error } = await supabase.from("show_listings").update({ status: "active", expires_at: exp }).eq("id", id);
    if (!error) {
      toast.success(isHe ? "חודש ל-7 ימים ✓" : "Renewed for 7 days ✓");
      setShowListings(prev => prev.map((x: any) => x.id === id ? { ...x, status: "active", expires_at: exp } : x));
    }
  }

  async function handleShowDelete(id: string) {
    if (!confirm(isHe ? "למחוק את המודעה?" : "Delete this listing?")) return;
    const { error } = await supabase.from("show_listings").update({ status: "archived" }).eq("id", id);
    if (!error) {
      toast.success(isHe ? "המודעה נמחקה" : "Listing deleted");
      setShowListings(prev => prev.filter((x: any) => x.id !== id));
    }
  }

  async function handleFeatureOn(listing: Listing) {
    const maxFeat = getPlanLimits(plan).max_featured;
    if (featuredCount >= maxFeat) {
      toast.warning(
        isHe
          ? `ניתן להדגיש עד ${maxFeat} מודעות בלבד`
          : `Max ${maxFeat} featured listings`
      );
      return;
    }
    const payload: any = { is_featured: true };
    if (!(listing as any).first_featured_at)
      payload.first_featured_at = new Date().toISOString();
    const { error } = await supabase
      .from("listings")
      .update(payload)
      .eq("id", listing.id);
    if (!error) {
      toast.success(isHe ? "מודעה הפכה למוזהבת ⭐" : "Listing is now gold ⭐");
      loadPage();
    }
  }

  async function handleFeatureOff(id: string) {
    const { error } = await supabase
      .from("listings")
      .update({ is_featured: false })
      .eq("id", id);
    if (!error) {
      toast.show(isHe ? "ההדגשה הוסרה" : "Gold removed", "info");
      loadPage();
    }
  }

  async function handleBump(id: string) {
    const { error } = await supabase
      .from("listings")
      .update({ last_bumped_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) {
      toast.success(isHe ? "המודעה הוקפצה 🚀" : "Listing bumped 🚀");
      loadPage();
    }
  }

  const card: CSSProperties = {
    background: "rgba(255,255,255,0.88)",
    border: `1px solid ${C.border}`,
    borderRadius: "10px",
    backdropFilter: "blur(12px)",
    boxShadow: "0 2px 12px rgba(13,27,62,0.05)",
  };

  return (
    <main style={{ minHeight: "100vh" }}>
      <style>{`@keyframes fsu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.fsu{animation:fsu 360ms cubic-bezier(0.16,1,0.3,1) both}.fsu1{animation-delay:40ms}.fsu2{animation-delay:80ms}`}</style>
      <div
        style={{
          height: "3px",
          background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)`,
        }}
      />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.75rem" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11px",
            fontWeight: 600,
            color: C.hint,
            textDecoration: "none",
            marginBottom: "20px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          ← {isHe ? "כל המשחקים" : "All matches"}
        </Link>

        <div className="fsu" style={{ ...card, padding: "20px 24px", marginBottom: "12px" }}>
          <div style={{ height: "2px", background: C.usa, margin: "-20px -24px 18px" }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: C.usa,
                  marginBottom: "6px",
                }}
              >
                STAY IN THE GAME
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-syne,'Syne',sans-serif)",
                  fontSize: "clamp(20px,3vw,28px)",
                  fontWeight: 800,
                  color: C.text,
                  letterSpacing: "-0.3px",
                  marginBottom: "4px",
                }}
              >
                {isHe ? "המודעות שלי" : "My listings"}
              </h1>
              <p style={{ fontSize: "12px", color: C.hint }}>
                {email}
                {plan === "premium" && (
                  <span
                    style={{
                      color: C.gold,
                      fontWeight: 700,
                      marginInlineStart: "6px",
                    }}
                  >
                    ⭐ Premium
                  </span>
                )}
                {plan === "unlimited" && (
                  <span
                    style={{
                      color: C.mexico,
                      fontWeight: 700,
                      marginInlineStart: "6px",
                    }}
                  >
                    🚀 Unlimited
                  </span>
                )}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1px",
                background: C.border,
                borderRadius: "8px",
                overflow: "hidden",
                border: `1px solid ${C.border}`,
              }}
            >
              {[
                { n: activeCount, l: isHe ? "פעילות" : "Active", c: C.mexico },
                {
                  n:
                    plan === "unlimited"
                      ? "∞"
                      : `${activeCount}/${getPlanLimits(plan).max_listings}`,
                  l: isHe ? "מגבלה" : "Limit",
                  c: C.usa,
                },
                {
                  n: `${featuredCount}/${getPlanLimits(plan).max_featured}`,
                  l: isHe ? "מוזהבות" : "Gold",
                  c: C.gold,
                },
                {
                  n: `${showActiveCount}/10`,
                  l: isHe ? "🎵 הופעות" : "🎵 Shows",
                  c: "#7c3aed",
                },
                {
                  n: `${showFeaturedCount}/2`,
                  l: isHe ? "🎵 Gold" : "🎵 Gold",
                  c: "#d4a017",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    padding: "12px 16px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-syne,'Syne',sans-serif)",
                      fontSize: "17px",
                      fontWeight: 800,
                      color: s.c,
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

            <button
              onClick={() => setShareAllOpen(true)}
              style={{ padding: "11px 18px", fontSize: "12px", fontWeight: 700, background: "#25D366", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              📤 {isHe ? "שתף הכל" : "Share all"}
            </button>
            <Link
              href="/post-listing"
              style={{ padding: "11px 20px", background: C.usa, color: "#fff", fontSize: "12px", fontWeight: 700, borderRadius: "6px", textDecoration: "none", letterSpacing: "0.02em" }}
            >
              + {isHe ? "מודעה חדשה" : "New listing"}
            </Link>
          </div>
        </div>

        <div className="fsu fsu1">
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <style>{`@keyframes sk{from{background-position:-600px 0}to{background-position:600px 0}}.sk{background:linear-gradient(90deg,#f0f4f8 25%,#e8edf5 50%,#f0f4f8 75%);background-size:800px 100%;animation:sk 1.4s infinite linear;border-radius:8px;}`}</style>
              {[1, 2, 3].map((i) => (
                <div key={i} className="sk" style={{ height: "100px" }} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div style={{ ...card, padding: "56px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "14px" }}>📋</div>
              <p
                style={{
                  fontFamily: "var(--font-syne,'Syne',sans-serif)",
                  fontSize: "18px",
                  fontWeight: 800,
                  color: C.text,
                  marginBottom: "8px",
                }}
              >
                {isHe ? "אין לך מודעות עדיין" : "No listings yet"}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: C.muted,
                  marginBottom: "20px",
                }}
              >
                {isHe
                  ? "פרסם מודעה ראשונה וצא למכירה"
                  : "Post your first listing and start selling"}
              </p>
              <Link
                href="/post-listing"
                style={{
                  display: "inline-block",
                  padding: "12px 28px",
                  background: C.usa,
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  borderRadius: "6px",
                  textDecoration: "none",
                }}
              >
                {isHe ? "+ פרסם מודעה" : "+ Post listing"}
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {listings.map((listing) => {
                const expired = isExp(listing.expires_at);
                const isActive = listing.status === "active" && !expired;
                const statusLabel =
                  listing.status === "closed"
                    ? isHe
                      ? "סגורה"
                      : "Closed"
                    : expired
                    ? isHe
                      ? "פג תוקף"
                      : "Expired"
                    : isHe
                    ? "פעילה"
                    : "Active";
                const statusColor = isActive ? C.mexico : C.faint;

                return (
                  <div
                    key={listing.id}
                    style={{
                      background: "#ffffff",
                      border: `1px solid ${C.border}`,
                      borderRadius: "10px",
                      overflow: "hidden",
                      boxShadow: "0 2px 12px rgba(13,27,62,0.06)",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        height: "3px",
                        background: listing.is_featured
                          ? `linear-gradient(90deg,${C.usa},${C.gold},${C.mexico})`
                          : listing.type === "sell"
                          ? C.mexico
                          : C.usa,
                      }}
                    />

                    {listing.is_featured && (
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
                    )}

                    <div style={{ padding: "16px 20px", position: "relative" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        {listing.is_featured && (
                          <span
                            style={{
                              fontSize: "9px",
                              fontWeight: 800,
                              padding: "3px 10px",
                              borderRadius: "3px",
                              background: `linear-gradient(135deg,${C.gold},#fbbf24)`,
                              color: "#fff",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                            }}
                          >
                            ⭐ GOLD LISTING
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "3px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            background:
                              listing.type === "sell"
                                ? "rgba(0,104,71,0.08)"
                                : "rgba(26,58,107,0.07)",
                            color: listing.type === "sell" ? C.mexico : C.usa,
                            border: `1px solid ${
                              listing.type === "sell"
                                ? "rgba(0,104,71,0.2)"
                                : "rgba(26,58,107,0.15)"
                            }`,
                          }}
                        >
                          {listing.type === "sell"
                            ? isHe
                              ? "מכירה"
                              : "Sell"
                            : isHe
                            ? "קנייה"
                            : "Buy"}
                        </span>
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: "3px",
                            background: "#f1f5f9",
                            color: C.hint,
                            border: `1px solid ${C.border}`,
                          }}
                        >
                          {listing.category}
                        </span>
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: "3px",
                            background: isActive
                              ? "rgba(0,104,71,0.07)"
                              : "rgba(0,0,0,0.03)",
                            color: statusColor,
                            border: `1px solid ${
                              isActive
                                ? "rgba(0,104,71,0.18)"
                                : "rgba(0,0,0,0.07)"
                            }`,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {statusLabel}
                        </span>
                        {listing.expires_at && (
                          <span
                            style={{
                              fontSize: "9px",
                              color: expired ? C.canada : C.hint,
                              marginInlineStart: "2px",
                            }}
                          >
                            · {isHe ? "תוקף" : "Exp"}{" "}
                            {new Date(listing.expires_at).toLocaleDateString(
                              isHe ? "he-IL" : "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: C.muted,
                          marginBottom: "6px",
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: "6px",
                          lineHeight: 1.45,
                        }}
                      >
                        {listing.match ? (
                          <>
                            <span>
                              {isHe ? "משחק" : "Match"}{" "}
                              {listing.match.fifa_match_number} ·
                            </span>
                            <TeamInline name={listing.match.home_team_name} stage={listing.match.stage} isHe={isHe} />
                            <span style={{ color: C.hint, fontWeight: 400 }}>{isHe ? "נגד" : "vs"}</span>
                            <TeamInline name={listing.match.away_team_name} stage={listing.match.stage} isHe={isHe} />
                            <span style={{ flexBasis: "100%" }}>{formatMatchMeta(listing.match, isHe)}</span>
                          </>
                        ) : listing.ilMatch ? (
                          <>
                            <span style={{ fontWeight: 600 }}>
                              {isHe ? listing.ilMatch.home_team : listing.ilMatch.home_team_en}
                              {" "}{isHe ? "נגד" : "vs"}{" "}
                              {isHe ? listing.ilMatch.away_team : listing.ilMatch.away_team_en}
                            </span>
                            <span style={{ flexBasis: "100%", color: C.hint, fontWeight: 400 }}>
                              {isHe ? listing.ilMatch.round : listing.ilMatch.round_en}
                              {listing.ilMatch.city ? ` · ${listing.ilMatch.city}` : ""}
                              {" · "}{listing.ilMatch.match_date?.slice(0,10)}
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-syne,'Syne',sans-serif)",
                            fontSize: listing.is_featured ? "32px" : "24px",
                            fontWeight: 800,
                            color: C.text,
                            letterSpacing: "-1px",
                            lineHeight: 1,
                          }}
                        >
                          {listing.type === "sell"
                            ? `$${listing.price}`
                            : isHe
                            ? `עד $${listing.price}`
                            : `Up to $${listing.price}`}
                        </span>
                        <span style={{ fontSize: "12px", color: C.hint }}>
                          {isHe ? "לכרטיס" : "/ ticket"} × {listing.quantity}
                        </span>
                        {listing.quantity > 1 && listing.type === "sell" && (
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: C.gold,
                            }}
                          >
                            = ${listing.price * listing.quantity}
                          </span>
                        )}
                      </div>

                      {/* Seat details */}
                      {(listing.category || listing.seats_block || listing.seats_row || listing.seats_numbers || listing.seated_together) && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                          {listing.category && (
                            <span style={{ fontSize: "10px", padding: "2px 8px", background: "#f1f5f9", borderRadius: "4px", color: C.hint, fontWeight: 600 }}>{listing.category}</span>
                          )}
                          {listing.seats_block && (
                            <span style={{ fontSize: "10px", padding: "2px 8px", background: "#f1f5f9", borderRadius: "4px", color: C.muted, fontWeight: 600 }}>{isHe ? "בלוק" : "Blk"} {listing.seats_block}</span>
                          )}
                          {listing.seats_row && (
                            <span style={{ fontSize: "10px", padding: "2px 8px", background: "#f1f5f9", borderRadius: "4px", color: C.muted, fontWeight: 600 }}>{isHe ? "שורה" : "Row"} {listing.seats_row}</span>
                          )}
                          {listing.seats_numbers && (
                            <span style={{ fontSize: "10px", padding: "2px 8px", background: "#f1f5f9", borderRadius: "4px", color: C.muted, fontWeight: 600 }}>{listing.seats_numbers}</span>
                          )}
                          {listing.seated_together === "yes" && (
                            <span style={{ fontSize: "10px", padding: "2px 8px", background: "rgba(34,197,94,0.08)", borderRadius: "4px", color: "#15803d", fontWeight: 700 }}>✓ {isHe ? "יחד" : "Together"}</span>
                          )}
                        </div>
                      )}

                      {listing.notes && (
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
                          "{listing.notes}"
                        </p>
                      )}
                    </div>

                    <div
                      style={{
                        borderTop: `1px solid ${C.border}`,
                        padding: "10px 20px",
                        background: "#fafbfd",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <BumpTimer
                        lastBumped={listing.last_bumped_at}
                        plan={plan}
                        isHe={isHe}
                        onBump={() => handleBump(listing.id)}
                      />

                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <Link
                          href={`/post-listing?listingId=${listing.id}`}
                          style={{
                            padding: "6px 12px",
                            fontSize: "11px",
                            fontWeight: 600,
                            border: `1px solid ${C.border}`,
                            borderRadius: "5px",
                            background: "#fff",
                            color: C.muted,
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isHe ? "✏️ ערוך" : "✏️ Edit"}
                        </Link>

                        {listing.is_featured ? (
                          <button
                            onClick={() => handleFeatureOff(listing.id)}
                            style={{
                              padding: "6px 12px",
                              fontSize: "11px",
                              fontWeight: 600,
                              border: `1px solid ${C.border}`,
                              borderRadius: "5px",
                              background: "#fff",
                              color: C.muted,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {isHe ? "הסר Gold" : "Remove Gold"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFeatureOn(listing)}
                            style={{
                              padding: "6px 12px",
                              fontSize: "11px",
                              fontWeight: 700,
                              border: "1px solid rgba(212,160,23,0.4)",
                              borderRadius: "5px",
                              background: "rgba(212,160,23,0.08)",
                              color: "#92400e",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            ⭐ Gold
                          </button>
                        )}

                        {isActive ? (
                          <button
                            onClick={() => handleClose(listing.id)}
                            style={{
                              padding: "6px 12px",
                              fontSize: "11px",
                              fontWeight: 600,
                              border: `1px solid ${C.border}`,
                              borderRadius: "5px",
                              background: "#fff",
                              color: C.muted,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {isHe ? "סגור" : "Close"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRenew(listing.id)}
                            style={{
                              padding: "6px 12px",
                              fontSize: "11px",
                              fontWeight: 700,
                              border: `1px solid ${C.usa}`,
                              borderRadius: "5px",
                              background: "rgba(26,58,107,0.06)",
                              color: C.usa,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {isHe ? "חדש 7 ימים" : "Renew 7d"}
                          </button>
                        )}

                        <Link
                          href={listing.match_id ? `/matches/${listing.match_id}` : `/sports/football-israel/${listing.israeli_match_id}`}
                          style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, border: `1px solid ${C.border}`, borderRadius: "5px", background: "#fff", color: C.hint, textDecoration: "none", whiteSpace: "nowrap" }}
                        >
                          {isHe ? "👁 צפה" : "👁 View"}
                        </Link>

                        <button
                          onClick={() => setShareListingId(listing.id)}
                          style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 700, border: "1px solid rgba(37,211,102,.3)", borderRadius: "5px", background: "rgba(37,211,102,.06)", color: "#15803d", cursor: "pointer", whiteSpace: "nowrap" as const }}
                        >
                          📤 {isHe ? "שתף" : "Share"}
                        </button>

                        <button
                          onClick={() => handleDelete(listing.id)}
                          style={{
                            marginInlineStart: "auto",
                            padding: "6px 12px",
                            fontSize: "11px",
                            fontWeight: 600,
                            border: "1px solid rgba(230,57,70,0.2)",
                            borderRadius: "5px",
                            background: "rgba(230,57,70,0.05)",
                            color: C.canada,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isHe ? "🗑 מחק" : "🗑 Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* ── SHOW LISTINGS ── */}
      {showListings.length > 0 && (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px 32px", boxSizing: "border-box" as const }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.teal, letterSpacing: ".12em", textTransform: "uppercase" as const, marginBottom: 12 }}>
            🎵 {isHe ? "הופעות חיות" : "Live Shows"}
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {showListings.map((sl: any) => {
              const artistName = isHe ? (sl.artists?.name_he || sl.artists?.name) : sl.artists?.name;
              const venueName  = sl.venues?.name || null;
              const venueCity  = sl.venues?.city_he || null;
              const isSell     = sl.type === "sell";
              const expired    = sl.expires_at ? new Date(sl.expires_at) < new Date() : false;
              const isActive   = sl.status === "active" && !expired;
              return (
                <div key={sl.id} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", opacity: expired ? .6 : 1 }}>
                  <div style={{ height: 2, background: "linear-gradient(90deg,#7c3aed,#e63946)" }} />
                  <div style={{ padding: "14px 16px" }}>
                    {/* Top row: artist + price */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 2, background: isSell ? "rgba(0,104,71,.07)" : "rgba(26,58,143,.07)", color: isSell ? C.green : C.blue, border: `1px solid ${isSell ? "rgba(0,104,71,.2)" : "rgba(26,58,143,.18)"}`, letterSpacing: ".05em", textTransform: "uppercase" as const }}>
                            {isSell ? (isHe ? "מכירה" : "Sell") : (isHe ? "קנייה" : "Buy")}
                          </span>
                          {!isActive && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 2, background: "rgba(148,163,184,.1)", color: C.hint, border: `1px solid ${C.border}` }}>{isHe ? "סגור" : "Closed"}</span>}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 3 }}>{artistName || "—"}</div>
                        <div style={{ fontSize: 11, color: C.hint }}>
                          {venueName && <span>📍 {venueName}{venueCity ? ` · ${venueCity}` : ""}</span>}
                          {sl.show_date && <span>{venueName ? " · " : ""}{sl.show_date.slice(0,10)}</span>}
                          {sl.show_time && <span> · {sl.show_time.slice(0,5)}</span>}
                        </div>
                      </div>
                      {sl.price && <div style={{ fontSize: 18, fontWeight: 900, color: C.text, flexShrink: 0 }}>₪{Number(sl.price).toLocaleString()}</div>}
                    </div>
                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                      {/* Edit */}
                      <a href={`/post-listing?tab=show&showListingId=${sl.id}`} style={{ fontSize: 11, color: C.muted, textDecoration: "none", padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: 4, whiteSpace: "nowrap" as const, background: "#fff" }}>
                        ✏️ {isHe ? "ערוך" : "Edit"}
                      </a>

                      {/* Gold */}
                      {sl.is_featured ? (
                        <button onClick={async () => {
                          await supabase.from("show_listings").update({ is_featured: false }).eq("id", sl.id);
                          setShowListings(prev => prev.map((x: any) => x.id === sl.id ? { ...x, is_featured: false } : x));
                        }} style={{ fontSize: 11, color: C.muted, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 4, cursor: "pointer", padding: "5px 10px", whiteSpace: "nowrap" as const }}>
                          {isHe ? "הסר Gold" : "Remove Gold"}
                        </button>
                      ) : (
                        <button onClick={async () => {
                          if (showFeaturedCount >= SHOW_MAX_GOLD) { toast.warning(isHe ? `מקסימום ${SHOW_MAX_GOLD} מודעות Gold להופעות` : `Max ${SHOW_MAX_GOLD} featured show listings`); return; }
                          await supabase.from("show_listings").update({ is_featured: true, first_featured_at: new Date().toISOString() }).eq("id", sl.id);
                          setShowListings(prev => prev.map((x: any) => x.id === sl.id ? { ...x, is_featured: true } : x));
                          toast.success(isHe ? "מודעה הפכה למוזהבת ⭐" : "Listing is now gold ⭐");
                        }} style={{ fontSize: 11, color: C.gold, background: `rgba(212,160,23,.08)`, border: `1px solid rgba(212,160,23,.3)`, borderRadius: 4, cursor: "pointer", padding: "5px 10px", whiteSpace: "nowrap" as const, fontWeight: 700 }}>
                          ⭐ Gold
                        </button>
                      )}

                      {/* View */}
                      <a href={`/live-shows/${sl.artist_id}`} style={{ fontSize: 11, color: C.hint, textDecoration: "none", padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: 4, whiteSpace: "nowrap" as const }}>
                        👁 {isHe ? "צפה" : "View"}
                      </a>

                      {/* Close / Renew */}
                      {isActive ? (
                        <button onClick={() => handleShowClose(sl.id)} style={{ fontSize: 11, color: C.muted, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 4, cursor: "pointer", padding: "5px 10px", whiteSpace: "nowrap" as const }}>
                          {isHe ? "סגור" : "Close"}
                        </button>
                      ) : (
                        <button onClick={() => handleShowRenew(sl.id)} style={{ fontSize: 11, color: C.blue, background: "rgba(26,58,143,.06)", border: `1px solid rgba(26,58,143,.2)`, borderRadius: 4, cursor: "pointer", padding: "5px 10px", whiteSpace: "nowrap" as const, fontWeight: 700 }}>
                          {isHe ? "חדש 7 ימים" : "Renew 7d"}
                        </button>
                      )}

                      {/* Delete */}
                      <button onClick={() => handleShowDelete(sl.id)} style={{ fontSize: 11, color: C.canada, background: "rgba(230,57,70,.06)", border: "1px solid rgba(230,57,70,.2)", borderRadius: 4, cursor: "pointer", padding: "5px 10px", whiteSpace: "nowrap" as const }}>
                        🗑 {isHe ? "מחק" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Share single listing */}
      {shareAllOpen && (
        <ShareAllTicket
          open={shareAllOpen}
          listings={listings
            .filter(l => l.status === "active" && !isExp(l.expires_at))
            .map(l => ({
              id: l.id,
              type: l.type,
              price: l.price,
              quantity: l.quantity,
              match_id: l.match_id,
              israeli_match_id: l.israeli_match_id,
              matchName: l.match
                ? `${teamName(l.match.home_team_name, isHe)} ${isHe ? "נגד" : "vs"} ${teamName(l.match.away_team_name, isHe)}`
                : l.ilMatch
                ? `${isHe ? l.ilMatch.home_team : l.ilMatch.home_team_en} ${isHe ? "נגד" : "vs"} ${isHe ? l.ilMatch.away_team : l.ilMatch.away_team_en}`
                : "",
              matchMeta: l.match
                ? `${l.match.city ?? ""} · ${l.match.match_date?.slice(0,10) ?? ""}`
                : l.ilMatch
                ? `${l.ilMatch.city ?? ""} · ${l.ilMatch.match_date?.slice(0,10) ?? ""}`
                : "",
              isWC: !!l.match_id,
            }))}
          isHe={isHe}
          onClose={() => setShareAllOpen(false)}
        />
      )}

      {shareListingId && (() => {
        const l = listings.find(x => x.id === shareListingId);
        if (!l) return null;
        const matchData = l.match ? {
          id: l.match_id ?? "",
          home_team_name: l.match.home_team_name,
          away_team_name: l.match.away_team_name,
          city: l.match.city,
          stadium: null,
          match_date: l.match.match_date,
          match_time: null,
          stage: l.match.stage,
          fifa_match_number: l.match.fifa_match_number,
          competition: "wc",
        } : l.ilMatch ? {
          id: l.israeli_match_id ?? "",
          home_team_name: isHe ? l.ilMatch.home_team : l.ilMatch.home_team_en,
          away_team_name: isHe ? l.ilMatch.away_team : l.ilMatch.away_team_en,
          city: l.ilMatch.city,
          stadium: l.ilMatch.stadium,
          match_date: l.ilMatch.match_date,
          match_time: l.ilMatch.match_time,
          stage: isHe ? l.ilMatch.round : l.ilMatch.round_en,
          fifa_match_number: null,
          competition: l.ilMatch.competition,
        } : null;
        if (!matchData) return null;
        return (
          <ShareListingTicket
            key={shareListingId}
            listing={l}
            match={matchData}
            isHe={isHe}
            initialOpen={true}
            onClose={() => setShareListingId(null)}
          />
        );
      })()}
    </main>
  );
}