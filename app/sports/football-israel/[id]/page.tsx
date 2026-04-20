"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { useLanguage } from "../../../../lib/LanguageContext";
import { useToast } from "../../../../components/ToastProvider";
import { getTeamLogo } from "../../../../lib/teamLogos";

// ── Types ─────────────────────────────────────────────────────────────────────
type ILMatchDetail = {
  id: string;
  competition: string;
  round: string;
  round_en: string;
  home_team: string;
  away_team: string;
  home_team_en: string;
  away_team_en: string;
  stadium: string | null;
  stadium_en: string | null;
  city: string | null;
  city_en: string | null;
  match_date: string;
  match_time: string | null;
  status: string;
};

type ListingItem = {
  id: string;
  user_id: string;
  israeli_match_id: string;
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
  blue:       "#1a3a8f",
  green:      "#006847",
  teal:       "#1abfb0",
  bg:         "#f8f9fc",
  white:      "#ffffff",
  border:     "#e8edf5",
  text:       "#0d1b3e",
  muted:      "#64748b",
  hint:       "#94a3b8",
  faint:      "#cbd5e1",
  gold:       "#d4a017",
  goldLight:  "rgba(212,160,23,0.1)",
  green2:     "#22c55e",
  greenDark:  "#065f46",
  greenLight: "rgba(0,104,71,0.08)",
  red:        "#e63946",
} as const;

const TEAM_COLORS: Record<string, string> = {
  "מכבי תל אביב":       "#FDE400",
  "מכבי חיפה":          "#007B40",
  "הפועל תל אביב":      "#E63946",
  "הפועל באר שבע":      "#C0392B",
  'בית"ר ירושלים':      "#FFCE00",
  "הפועל ירושלים":      "#E67E22",
  "הפועל חיפה":         "#E63946",
  "הפועל פתח תקוה":     "#E63946",
  "מכבי נתניה":         "#F4C430",
  "בני סכנין":          "#006400",
  "מכבי בני ריינה":     "#FDE400",
  "מ.ס. אשדוד":         "#1a3a8f",
  "עירוני טבריה":       "#9B59B6",
  "עירוני קריית שמונה": "#6B2D8B",
  "בני יהודה תל אביב":  "#E63946",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatMatchDate(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

// ── Team Logo ─────────────────────────────────────────────────────────────────
function TeamLogo({ name, size = 32 }: { name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const src   = getTeamLogo(name);
  const color = TEAM_COLORS[name] ?? C.hint;
  if (err || !src) {
    return (
      <span style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: `${color}22`, border: `2px solid ${color}55`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 800, color, fontFamily: "var(--font-syne,'Syne',sans-serif)" }}>
        {name.slice(0,1)}
      </span>
    );
  }
  return <Image src={src} alt={name} width={size} height={size} style={{ objectFit: "contain", flexShrink: 0 }} onError={() => setErr(true)} />;
}

// ── Countdown ─────────────────────────────────────────────────────────────────
function Countdown({ date, time, isHe }: { date: string; time: string | null; isHe: boolean }) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0, over: false });
  useEffect(() => {
    const target = new Date(`${date}T${(time || "20:00").slice(0,5)}:00`).getTime();
    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) { setT({ d:0,h:0,m:0,s:0,over:true }); return; }
      setT({ d: Math.floor(diff/86400000), h: Math.floor((diff%86400000)/3600000), m: Math.floor((diff%3600000)/60000), s: Math.floor((diff%60000)/1000), over: false });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [date, time]);
  if (t.over) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ fontSize: "10px", fontWeight: 600, color: C.hint, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
        {isHe ? "עד הקיקאוף" : "Kickoff in"}
      </span>
      <div style={{ display: "flex", gap: "4px" }}>
        {[{ v: t.d, l: isHe?"י":"d" },{ v: t.h, l: isHe?"ש":"h" },{ v: t.m, l: isHe?"ד":"m" },{ v: t.s, l: isHe?"ש":"s" }].map(({ v, l }) => (
          <div key={l} style={{ textAlign: "center" as const, minWidth: "36px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "5px 4px" }}>
            <div style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "15px", fontWeight: 800, color: C.text, lineHeight: 1 }}>{String(v).padStart(2,"0")}</div>
            <div style={{ fontSize: "8px", fontWeight: 700, color: C.hint, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginTop: "2px" }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Trust Badge ───────────────────────────────────────────────────────────────
function TrustBadge({ profile, isHe }: { profile: ProfileItem | null; isHe: boolean }) {
  if (!profile) return null;
  const age   = profile.created_at ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000) : 0;
  const score = Math.min(100, (profile.phone?40:0) + (profile.country?20:0) + Math.min(40, age/3));
  const verified = score >= 80, trusted = score >= 50;
  const label = verified ? (isHe?"מאומת":"Verified") : trusted ? (isHe?"מהימן":"Trusted") : (isHe?"חדש":"New");
  const color = verified ? C.green : trusted ? C.blue : C.hint;
  return (
    <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "3px", background: `${color}15`, color, border: `1px solid ${color}28`, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
      {verified ? "✓ " : ""}{label}
    </span>
  );
}

// ── Gold Listing ──────────────────────────────────────────────────────────────
function GoldListing({ item, isBestValue, isHe, viewerLoggedIn, viewerProfileComplete, onContact }: {
  item: EnrichedListing; isBestValue: boolean; isHe: boolean;
  viewerLoggedIn: boolean; viewerProfileComplete: boolean;
  onContact: (item: EnrichedListing) => void;
}) {
  const isSell = item.type === "sell";
  return (
    <div style={{ background: C.goldLight, border: `1.5px solid ${C.gold}44`, borderRadius: "8px", padding: "16px 18px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,${C.gold},${C.gold}88)` }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" as const }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", flexWrap: "wrap" as const }}>
            <span style={{ fontSize: "9px", fontWeight: 800, padding: "2px 8px", borderRadius: "3px", background: C.gold, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
              ⭐ {isHe ? "מודגש" : "Featured"}
            </span>
            {isBestValue && (
              <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px", background: C.greenLight, color: C.greenDark, border: `1px solid ${C.green}33`, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                {isHe ? "מחיר מומלץ" : "Best value"}
              </span>
            )}
            <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px", background: isSell ? "rgba(26,58,143,0.08)" : "rgba(37,211,102,0.08)", color: isSell ? C.blue : "#15803d", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
              {isSell ? (isHe?"מכירה":"SELL") : (isHe?"קנייה":"BUY")}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "6px" }}>
            <span style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "22px", fontWeight: 900, color: C.text, letterSpacing: "-0.5px" }}>
              ₪{item.price.toLocaleString()}
            </span>
            <span style={{ fontSize: "11px", color: C.muted }}>{isHe ? `לכרטיס · ${item.quantity} כרטיסים` : `per ticket · ${item.quantity} tickets`}</span>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" as const, fontSize: "11px", color: C.muted, marginBottom: item.notes ? "8px" : "0" }}>
            <span>{item.category}</span>
            {item.seated_together === "yes" && <span style={{ color: C.green2 }}>✓ {isHe?"ביחד":"Together"}</span>}
            {item.seats_block && <span>{isHe?"בלוק":"Block"} {item.seats_block}</span>}
          </div>
          {item.notes && <p style={{ fontSize: "12px", color: C.muted, margin: "6px 0 0", lineHeight: 1.5 }}>{item.notes}</p>}
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: C.muted }}>{item.profile?.full_name || (isHe?"משתמש":"User")}</span>
            <TrustBadge profile={item.profile} isHe={isHe} />
          </div>
          <button
            onClick={() => onContact(item)}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", background: "#25D366", color: "#fff", border: "none", borderRadius: "5px", fontSize: "12px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as const }}
          >
            <span style={{ fontSize: "14px" }}>💬</span>
            {isHe ? "וואטסאפ" : "WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Regular Listing ───────────────────────────────────────────────────────────
function RegularListing({ item, isBestValue, isNew, isHe, viewerLoggedIn, viewerProfileComplete, onContact }: {
  item: EnrichedListing; isBestValue: boolean; isNew: boolean; isHe: boolean;
  viewerLoggedIn: boolean; viewerProfileComplete: boolean;
  onContact: (item: EnrichedListing) => void;
}) {
  const [hov, setHov] = useState(false);
  const isSell = item.type === "sell";
  return (
    <div
      style={{ background: hov ? "rgba(248,249,252,0.95)" : C.white, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px 16px", transition: "all 150ms", boxShadow: hov ? "0 2px 12px rgba(13,27,62,0.07)" : "0 1px 4px rgba(13,27,62,0.04)" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" as const }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
          {/* Type badge */}
          <div style={{ width: "36px", height: "36px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: isSell ? "rgba(26,58,143,0.07)" : "rgba(37,211,102,0.08)", border: `1px solid ${isSell ? "rgba(26,58,143,0.14)" : "rgba(37,211,102,0.2)"}` }}>
            <span style={{ fontSize: "9px", fontWeight: 800, color: isSell ? C.blue : "#15803d", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{isSell ? (isHe?"מכ":"SEL") : (isHe?"קנ":"BUY")}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px", flexWrap: "wrap" as const }}>
              <span style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "16px", fontWeight: 800, color: C.text, letterSpacing: "-0.3px" }}>
                ₪{item.price.toLocaleString()}
              </span>
              <span style={{ fontSize: "10px", color: C.muted }}>{isHe?`× ${item.quantity} כרטיסים`:`× ${item.quantity} tickets`}</span>
              {isBestValue && <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "2px", background: C.greenLight, color: C.greenDark, border: `1px solid ${C.green}33` }}>{isHe?"מחיר מומלץ":"Best value"}</span>}
              {isNew && <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "2px", background: "rgba(26,191,176,0.1)", color: C.teal, border: "1px solid rgba(26,191,176,0.2)" }}>{isHe?"חדש":"New"}</span>}
            </div>
            <div style={{ display: "flex", gap: "8px", fontSize: "10px", color: C.hint, flexWrap: "wrap" as const }}>
              <span>{item.category}</span>
              {item.seated_together === "yes" && <span style={{ color: C.green2 }}>✓ {isHe?"ביחד":"Together"}</span>}
              {item.seats_block && <span>{isHe?"בלוק":"Block"} {item.seats_block}</span>}
              {item.profile?.full_name && <span>· {item.profile.full_name}</span>}
              <TrustBadge profile={item.profile} isHe={isHe} />
            </div>
            {item.notes && <p style={{ fontSize: "11px", color: C.muted, margin: "4px 0 0", lineHeight: 1.5 }}>{item.notes}</p>}
          </div>
        </div>
        <button
          onClick={() => onContact(item)}
          style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", background: "#25D366", color: "#fff", border: "none", borderRadius: "5px", fontSize: "11px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as const, flexShrink: 0 }}
        >
          <span style={{ fontSize: "13px" }}>💬</span>
          {isHe ? "וואטסאפ" : "WhatsApp"}
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ILMatchPage() {
  const { id: matchId } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const toast    = useToast();
  const isHe     = lang === "he";

  const [match,                setMatch]                = useState<ILMatchDetail | null>(null);
  const [listings,             setListings]             = useState<EnrichedListing[]>([]);
  const [loading,              setLoading]              = useState(true);
  const [viewerLoggedIn,       setViewerLoggedIn]       = useState(false);
  const [viewerProfileComplete,setViewerProfileComplete]= useState(false);
  const [showLoginModal,       setShowLoginModal]       = useState(false);

  const [typeFilter, setTypeFilter] = useState<"all"|"sell"|"buy">("all");
  const [minPrice,   setMinPrice]   = useState("");
  const [maxPrice,   setMaxPrice]   = useState("");
  const [sortBy,     setSortBy]     = useState("featured");

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!matchId) return;

    async function load() {
      setLoading(true);

      // Match details
      const { data: matchData } = await supabase
        .from("israeli_matches")
        .select("*")
        .eq("id", matchId)
        .single();
      setMatch(matchData as ILMatchDetail);

      // Listings + profiles
      const { data: listingData } = await supabase
        .from("listings")
        .select("*")
        .eq("israeli_match_id", matchId)
        .eq("status", "active")
        .is("archived_at", null);

      if (listingData && listingData.length > 0) {
        const userIds = [...new Set(listingData.map((l: any) => l.user_id))];
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id,full_name,phone,country,city,created_at")
          .in("id", userIds);
        const profileMap = Object.fromEntries((profileData || []).map((p: ProfileItem) => [p.id, p]));
        setListings(listingData.map((l: any) => ({ ...l, profile: profileMap[l.user_id] || null })));
      } else {
        setListings([]);
      }

      // Viewer
      const { data: { user } } = await supabase.auth.getUser();
      setViewerLoggedIn(!!user);
      if (user) {
        const { data: p } = await supabase.from("profiles").select("phone,full_name").eq("id", user.id).single();
        setViewerProfileComplete(!!(p?.phone && p?.full_name));
      }

      setLoading(false);
    }

    load();

    // Realtime
    const ch = supabase.channel(`il-match-${matchId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "listings", filter: `israeli_match_id=eq.${matchId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [matchId]);

  // ── Contact ───────────────────────────────────────────────────────────────
  function handleContact(item: EnrichedListing) {
    if (!viewerLoggedIn) { setShowLoginModal(true); return; }
    const phone = item.profile?.phone?.replace(/\D/g, "");
    if (!phone) { toast.show(isHe ? "אין מספר טלפון" : "No phone number", "error"); return; }
    const matchName = match ? `${isHe ? match.home_team : match.home_team_en} vs ${isHe ? match.away_team : match.away_team_en}` : "";
    const msg = item.type === "sell"
      ? `היי, ראיתי את המודעה שלך ב-Stayin – ${item.quantity} כרטיסים ל${matchName} ב-₪${item.price} לכרטיס. עוד זמין?`
      : `היי, ראיתי שאתה מחפש כרטיסים ל${matchName} ב-Stayin. יש לי – נדבר?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const mn = minPrice ? Number(minPrice) : null;
    const mx = maxPrice ? Number(maxPrice) : null;
    let list = listings.filter(l => {
      if (typeFilter !== "all" && l.type !== typeFilter) return false;
      if (l.type === "sell") {
        if (mn !== null && l.price < mn) return false;
        if (mx !== null && l.price > mx) return false;
      }
      return true;
    });
    if (sortBy === "featured")   list = [...list].sort((a,b) => (b.is_featured?1:0) - (a.is_featured?1:0) || new Date(b.first_published_at||0).getTime() - new Date(a.first_published_at||0).getTime());
    if (sortBy === "price_low")  list = [...list].sort((a,b) => a.price - b.price);
    if (sortBy === "price_high") list = [...list].sort((a,b) => b.price - a.price);
    if (sortBy === "newest")     list = [...list].sort((a,b) => new Date(b.first_published_at||0).getTime() - new Date(a.first_published_at||0).getTime());
    return list;
  }, [listings, typeFilter, minPrice, maxPrice, sortBy]);

  const sellCount = listings.filter(l => l.type === "sell").length;
  const buyCount  = listings.filter(l => l.type === "buy").length;

  const sellPrices = listings.filter(l => l.type === "sell").map(l => l.price).filter(Boolean);
  const bestValueIds = new Set(
    sellPrices.length
      ? listings.filter(l => l.type === "sell" && l.price === Math.min(...sellPrices)).map(l => l.id)
      : []
  );

  const W = { maxWidth: "860px", margin: "0 auto", padding: "0 16px" } as const;

  const t = {
    loginRequired:        isHe ? "נדרשת התחברות" : "Login required",
    cannotPostWithoutLogin: isHe ? "כדי לצור קשר עם המוכר יש להתחבר תחילה." : "Please log in to contact the seller.",
    continueWithoutLogin: isHe ? "המשך ללא התחברות" : "Continue without login",
  };

  if (loading) return (
    <main style={{ background: C.bg, minHeight: "100vh" }}>
      <style>{`@keyframes shi{from{background-position:-600px 0}to{background-position:600px 0}}.sk{background:linear-gradient(90deg,#f0f4f8 25%,#e8edf5 50%,#f0f4f8 75%);background-size:800px 100%;animation:shi 1.4s infinite linear;border-radius:3px;}`}</style>
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.blue} 33.3%,${C.green} 33.3% 66.6%,${C.teal} 66.6%)` }} />
      <div style={{ ...W, paddingTop: "48px" }}>
        {[80,220,140,180].map((w,i) => <div key={i} className="sk" style={{ height: i===1?32:14, width:`${w}px`, marginBottom:"16px" }} />)}
      </div>
    </main>
  );

  if (!match) return (
    <main style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" as const }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚽</div>
        <p style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "20px", fontWeight: 800, color: C.text }}>{isHe ? "משחק לא נמצא" : "Match not found"}</p>
        <Link href="/sports/football-israel" style={{ display: "inline-block", marginTop: "16px", color: C.blue, fontSize: "13px", fontWeight: 600 }}>{isHe ? "← חזרה לכדורגל ישראלי" : "← Back to Israeli Football"}</Link>
      </div>
    </main>
  );

  const isCup = match.competition === "state_cup";

  return (
    <main style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{`
        @keyframes lp{0%,100%{opacity:1}50%{opacity:.2}}.ld{animation:lp 2s infinite}
        @keyframes shi{from{background-position:-600px 0}to{background-position:600px 0}}.sk{background:linear-gradient(90deg,#f0f4f8 25%,#e8edf5 50%,#f0f4f8 75%);background-size:800px 100%;animation:shi 1.4s infinite linear;border-radius:2px;}
        .fsu{animation:fsu .4s ease both}@keyframes fsu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fsu2{animation:fsu .4s .06s ease both}
      `}</style>

      {/* 3px top bar */}
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.blue} 33.3%,${C.green} 33.3% 66.6%,${C.teal} 66.6%)` }} />

      {/* ── HEADER ── */}
      <div style={{ background: "transparent", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ ...W, paddingTop: "32px", paddingBottom: "32px" }}>

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px", fontSize: "11px", color: C.hint, fontWeight: 500 }}>
            <Link href="/" style={{ color: C.hint, textDecoration: "none" }}>{isHe?"דף הבית":"Home"}</Link>
            <span>/</span>
            <Link href="/sports/football-israel" style={{ color: C.hint, textDecoration: "none" }}>{isHe?"כדורגל ישראלי":"Israeli Football"}</Link>
            <span>/</span>
            <span style={{ color: C.muted }}>{isHe ? match.round : match.round_en}</span>
          </div>

          {/* Round + competition badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px", flexWrap: "wrap" as const }}>
            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: C.faint }}>{isHe ? match.round : match.round_en}</span>
            {isCup && (
              <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px", background: "rgba(212,160,23,0.1)", color: "#b8860b", border: "1px solid rgba(212,160,23,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
                {isHe?"גביע המדינה":"State Cup"}
              </span>
            )}
          </div>

          {/* Teams */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px", flexWrap: "wrap" as const }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <TeamLogo name={match.home_team} size={44} />
              <div>
                <div style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "clamp(18px,3vw,26px)", fontWeight: 900, letterSpacing: "-0.5px", color: C.text, lineHeight: 1 }}>
                  {isHe ? match.home_team : match.home_team_en}
                </div>
                <div style={{ fontSize: "10px", color: C.hint, fontWeight: 500, marginTop: "3px" }}>{isHe?"בית":"Home"}</div>
              </div>
            </div>

            <div style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "14px", fontWeight: 900, color: C.faint, padding: "6px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "4px" }}>VS</div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <TeamLogo name={match.away_team} size={44} />
              <div>
                <div style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "clamp(18px,3vw,26px)", fontWeight: 900, letterSpacing: "-0.5px", color: C.text, lineHeight: 1 }}>
                  {isHe ? match.away_team : match.away_team_en}
                </div>
                <div style={{ fontSize: "10px", color: C.hint, fontWeight: 500, marginTop: "3px" }}>{isHe?"חוץ":"Away"}</div>
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" as const, marginBottom: "20px" }}>
            <span style={{ fontSize: "12px", color: C.muted }}>
              📅 {formatMatchDate(match.match_date)}{match.match_time ? ` · ${match.match_time.slice(0,5)}` : ""}
            </span>
            {(match.city || match.stadium) && (
              <span style={{ fontSize: "12px", color: C.muted }}>
                📍 {isHe ? (match.city || match.city_en) : (match.city_en || match.city)}
                {(match.stadium || match.stadium_en) ? ` · ${isHe ? (match.stadium || match.stadium_en) : (match.stadium_en || match.stadium)}` : ""}
              </span>
            )}
          </div>

          {/* Countdown */}
          <Countdown date={match.match_date} time={match.match_time} isHe={isHe} />
        </div>
      </div>

      {/* ── LISTINGS ── */}
      <div style={{ ...W, marginTop: "24px" }}>

        {/* Filter bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" as const, background: C.white, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "10px 14px", boxShadow: "0 1px 4px rgba(13,27,62,0.04)" }}>
          {/* Type tabs */}
          <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden" }}>
            {(["all","sell","buy"] as const).map(v => (
              <button
                key={v}
                onClick={() => setTypeFilter(v)}
                style={{ padding: "5px 12px", fontSize: "11px", fontWeight: 700, border: "none", cursor: "pointer", transition: "all 150ms", fontFamily: "var(--font-dm,'DM Sans',sans-serif)", background: typeFilter === v ? C.blue : "transparent", color: typeFilter === v ? "#fff" : C.muted }}
              >
                {v === "all" ? (isHe?"הכל":"All") : v === "sell" ? `${isHe?"מכירה":"Sell"} (${sellCount})` : `${isHe?"קנייה":"Buy"} (${buyCount})`}
              </button>
            ))}
          </div>

          {/* Price */}
          <span style={{ fontSize: "10px", color: C.hint, fontWeight: 600 }}>₪</span>
          <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder={isHe?"מינ׳":"min"} style={{ width: "58px", padding: "5px 8px", border: `1px solid ${C.border}`, borderRadius: "4px", fontSize: "11px", background: C.bg, color: C.text, outline: "none" }} />
          <span style={{ fontSize: "10px", color: C.faint }}>—</span>
          <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder={isHe?"מקס׳":"max"} style={{ width: "58px", padding: "5px 8px", border: `1px solid ${C.border}`, borderRadius: "4px", fontSize: "11px", background: C.bg, color: C.text, outline: "none" }} />

          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: "4px", fontSize: "11px", background: C.bg, color: C.text, outline: "none", cursor: "pointer", marginInlineStart: "auto" }}>
            <option value="featured">{isHe?"מודגשות + חדש":"Featured + newest"}</option>
            <option value="price_low">{isHe?"מחיר: נמוך לגבוה":"Price: low → high"}</option>
            <option value="price_high">{isHe?"מחיר: גבוה לנמוך":"Price: high → low"}</option>
            <option value="newest">{isHe?"חדשות ביותר":"Newest first"}</option>
          </select>

          <span style={{ fontSize: "11px", color: C.hint }}>{filtered.length} {isHe?"תוצאות":"results"}</span>
        </div>

        {/* Disclaimer */}
        <div style={{ marginBottom: "10px", fontSize: "11px", color: C.muted, background: "rgba(255,255,255,0.72)", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "10px 12px", boxShadow: "0 1px 4px rgba(13,27,62,0.04)" }}>
          {isHe
            ? "Stayin היא פלטפורמה לחיבור בין משתמשים בלבד. האתר אינו צד לעסקה ואינו אחראי לתוכן המודעות, למחיר, לתשלום או להעברת הכרטיסים."
            : "Stayin is a platform that only connects users. The platform is not a party to any transaction and is not responsible for listing content, pricing, payment, or ticket transfer."}
        </div>

        {/* List */}
        <div className="fsu fsu2">
          {filtered.length === 0 ? (
            <div style={{ padding: "56px 24px", textAlign: "center" as const, background: C.white, border: `1px solid ${C.border}`, borderRadius: "10px", boxShadow: "0 1px 4px rgba(13,27,62,0.04)" }}>
              <div style={{ fontSize: "40px", marginBottom: "14px" }}>🎟️</div>
              <p style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "20px", fontWeight: 800, color: C.text, marginBottom: "8px" }}>
                {isHe ? "אין מודעות עדיין" : "No listings yet"}
              </p>
              <p style={{ fontSize: "13px", color: C.muted, marginBottom: "24px" }}>
                {isHe ? "היה הראשון לפרסם מודעה למשחק הזה" : "Be the first to post a listing for this match"}
              </p>
              <button
                onClick={() => { if (!viewerLoggedIn) { setShowLoginModal(true); return; } window.location.href = `/post-listing?matchId=${matchId}`; }}
                style={{ padding: "12px 28px", background: C.blue, color: "#fff", fontSize: "13px", fontWeight: 700, border: "none", borderRadius: "5px", cursor: "pointer" }}
              >
                + {isHe ? "פרסם מודעה ראשונה" : "Post first listing"}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: "10px", paddingBottom: "52px" }}>
              {filtered.map(item => {
                const bv  = bestValueIds.has(item.id);
                const isN = !!item.first_published_at && Date.now() - new Date(item.first_published_at).getTime() < 86400000;
                return item.is_featured
                  ? <GoldListing key={item.id} item={item} isBestValue={bv} isHe={isHe} viewerLoggedIn={viewerLoggedIn} viewerProfileComplete={viewerProfileComplete} onContact={handleContact} />
                  : <RegularListing key={item.id} item={item} isBestValue={bv} isNew={isN} isHe={isHe} viewerLoggedIn={viewerLoggedIn} viewerProfileComplete={viewerProfileComplete} onContact={handleContact} />;
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── LOGIN MODAL ── */}
      {showLoginModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(13,27,62,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99, padding: "1.5rem" }} onClick={e => { if (e.target === e.currentTarget) setShowLoginModal(false); }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "32px", maxWidth: "360px", width: "100%", textAlign: "center" as const, boxShadow: "0 32px 80px rgba(13,27,62,0.2)" }}>
            <div style={{ fontSize: "36px", marginBottom: "14px" }}>🔐</div>
            <h3 style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "20px", fontWeight: 800, color: C.text, marginBottom: "8px" }}>{t.loginRequired}</h3>
            <p style={{ fontSize: "13px", color: C.muted, marginBottom: "24px", lineHeight: 1.7 }}>{t.cannotPostWithoutLogin}</p>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: "10px" }}>
              <Link href="/auth" style={{ display: "block", padding: "12px", background: C.blue, color: "#fff", borderRadius: "5px", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
                {isHe ? "התחבר / הרשמה" : "Login / Sign up"}
              </Link>
              <button onClick={() => setShowLoginModal(false)} style={{ padding: "12px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "5px", fontSize: "12px", fontWeight: 500, color: C.muted, cursor: "pointer" }}>
                {t.continueWithoutLogin}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
