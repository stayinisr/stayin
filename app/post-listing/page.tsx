"use client";

import { Suspense, useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../lib/LanguageContext";
import { useToast } from "../../components/ToastProvider";
import SuccessModal from "../../components/SuccessModal";
import { teamName, flagImgSrc } from "../../lib/teams";

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  usa:    "#1a3a6b",
  canada: "#e63946",
  mexico: "#006847",
  blue:   "#1a3a8f",
  green:  "#006847",
  teal:   "#1abfb0",
  border: "#e8edf5",
  text:   "#0d1b3e",
  muted:  "#64748b",
  hint:   "#94a3b8",
  faint:  "#cbd5e1",
  bg:     "#f8f9fc",
  gold:   "#d4a017",
};

// ── WC Match type ─────────────────────────────────────────────────────────────
type MatchItem = {
  id: string;
  fifa_match_number: number;
  home_team_name: string | null;
  away_team_name: string | null;
  city: string;
  stadium: string;
  match_date: string;
  stage?: string | null;
};

// ── IL Match type ─────────────────────────────────────────────────────────────
type ILMatch = {
  id: string;
  competition: string;
  round: string;
  round_en: string;
  home_team: string;
  away_team: string;
  home_team_en: string;
  away_team_en: string;
  match_date: string;
  match_time: string | null;
  status: string;
};

// ── League type ───────────────────────────────────────────────────────────────
type LeagueType = "wc" | "il" | "show";

// ── WC helpers ────────────────────────────────────────────────────────────────
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
  const g = stage.match(/^Group\s+([A-Z])$/i);
  if (g) return `בית ${g[1].toUpperCase()}`;
  return stage;
}

function TeamInline({ name, stage, isHe }: { name: string | null; stage?: string | null; isHe: boolean }) {
  const showFlag = isGroupStage(stage) && hasRealTeam(name);
  const imgSrc = showFlag ? flagImgSrc(name) : "";
  const label = teamName(name, isHe);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: isHe ? "var(--font-he,'Heebo',sans-serif)" : "var(--font-dm,'DM Sans',sans-serif)", fontSize: "11px", fontWeight: 600, color: C.hint, lineHeight: 1.45, verticalAlign: "middle" }}>
      {showFlag && imgSrc ? (
        <span style={{ width: "16px", height: "11px", borderRadius: "3px", overflow: "hidden", background: "#fff", border: "1px solid rgba(13,27,62,0.10)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <img src={imgSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </span>
      ) : null}
      <span>{label}</span>
    </span>
  );
}

function matchOptionLabel(m: MatchItem, isHe: boolean) {
  const home = teamName(m.home_team_name, isHe);
  const away = teamName(m.away_team_name, isHe);
  return isHe ? `משחק ${m.fifa_match_number} — ${home} / ${away}` : `Match ${m.fifa_match_number} — ${home} / ${away}`;
}

function ilMatchOptionLabel(m: ILMatch, isHe: boolean) {
  const home  = isHe ? m.home_team : m.home_team_en;
  const away  = isHe ? m.away_team : m.away_team_en;
  const round = isHe ? m.round     : m.round_en;
  const date  = new Date(m.match_date).toLocaleDateString(isHe ? "he-IL" : "en-GB", { day: "2-digit", month: "2-digit" });
  return `${round} — ${home} / ${away} · ${date}`;
}

// ── Page content ──────────────────────────────────────────────────────────────
function PostListingPageContent() {
  const router  = useRouter();
  const params  = useSearchParams();
  const { t, lang } = useLanguage();
  const toast   = useToast();
  const isHe    = lang === "he";

  const preMatchId = params.get("matchId") || "";
  const preType    = params.get("type") || "sell";
  const editId     = params.get("listingId") || "";

  // League toggle — default to IL if ?type=israeli
  const [league, setLeague] = useState<LeagueType>(
    params.get("type") === "israeli" ? "il" : "wc"
  );

  // WC matches
  const [wcMatches,  setWcMatches]  = useState<MatchItem[]>([]);
  const [artists,    setArtists]    = useState<{id: string; name: string; name_he: string | null}[]>([]);
  const [venues,     setVenues]     = useState<{id: string; name: string; city: string | null; city_he: string | null}[]>([]);
  const [artistId,   setArtistId]   = useState("");
  const [venueId,    setVenueId]    = useState("");
  const [showDate,   setShowDate]   = useState("");
  const [showTime,   setShowTime]   = useState("");
  const [ticketType, setTicketType] = useState("standing");
  const [ticketTypeCustom, setTicketTypeCustom] = useState("");
  const [loadingWC,  setLoadingWC]  = useState(false);

  // IL matches
  const [ilMatches,  setIlMatches]  = useState<ILMatch[]>([]);
  const [loadingIL,  setLoadingIL]  = useState(false);

  const [submitting,   setSubmitting]   = useState(false);
  const [showSuccess,  setShowSuccess]  = useState(false);
  const [successMatchId, setSuccessMatchId] = useState("");

  // Form state
  const [type,           setType]           = useState(preType === "israeli" ? "sell" : preType);
  const [matchId,        setMatchId]        = useState(preMatchId);
  const [category,       setCategory]       = useState("Category 1");
  const [quantity,       setQuantity]       = useState(1);
  const [price,          setPrice]          = useState("");
  const [notes,          setNotes]          = useState("");
  const [seatedTogether, setSeatedTogether] = useState("unknown");
  const [seatsBlock,     setSeatsBlock]     = useState("");
  const [seatsRow,       setSeatsRow]       = useState("");
  const [seatsNums,      setSeatsNums]      = useState("");
  const [acceptedTerms,  setAcceptedTerms]  = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);

  // Reset matchId when league changes
  useEffect(() => { setMatchId(""); }, [league]);

  // Load WC matches
  useEffect(() => {
    if (league === "wc") {
      setLoadingWC(true);
      supabase.from("matches").select("id,fifa_match_number,home_team_name,away_team_name,city,stadium,match_date,stage").order("fifa_match_number", { ascending: true })
        .then(({ data }) => { setWcMatches((data || []) as MatchItem[]); setLoadingWC(false); });
    }
  }, [league]);

  // Load IL matches
  useEffect(() => {
    if (league === "show") {
      supabase.from("artists").select("id,name,name_he").order("name_he").then(({ data }) => setArtists(data || []));
      supabase.from("venues").select("id,name,city,city_he").order("city").then(({ data }) => setVenues(data || []));
    }
    if (league === "il") {
      setLoadingIL(true);
      supabase.from("israeli_matches").select("id,competition,round,round_en,home_team,away_team,home_team_en,away_team_en,match_date,match_time,status").neq("status", "finished").order("match_date", { ascending: true })
        .then(({ data }) => { setIlMatches((data || []) as ILMatch[]); setLoadingIL(false); });
    }
  }, [league]);

  // Load edit
  useEffect(() => {
    if (editId) loadEdit(editId);
  }, [editId]);

  // Pre-fill matchId for WC links
  useEffect(() => {
    if (!editId && preMatchId && league === "wc") setMatchId(preMatchId);
  }, [preMatchId, league, editId]);

  async function loadEdit(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }
    const { data, error } = await supabase.from("listings").select("*").eq("id", id).eq("user_id", user.id).single();
    if (error || !data) { router.push("/my-listings"); return; }
    setType(data.type);
    // Detect league from which match_id is set
    if (data.israeli_match_id) { setLeague("il"); setMatchId(data.israeli_match_id); }
    else { setLeague("wc"); setMatchId(data.match_id); }
    setCategory(data.category);
    setQuantity(data.quantity);
    setPrice(String(data.price));
    setNotes(data.notes || "");
    setSeatedTogether(data.seated_together || "unknown");
    setSeatsBlock(data.seats_block || "");
    setSeatsRow(data.seats_row || "");
    setSeatsNums(data.seats_numbers || "");
  }

  const selectedWCMatch = useMemo(() => wcMatches.find(m => m.id === matchId), [wcMatches, matchId]);
  const selectedILMatch = useMemo(() => ilMatches.find(m => m.id === matchId), [ilMatches, matchId]);

  const loading = league === "wc" ? loadingWC : loadingIL;

  async function handleSubmit() {
    if (!acceptedTerms) { setShowTermsError(true); toast.error(isHe ? "יש לאשר את התנאים כדי לפרסם מודעה" : "You must accept the terms to publish a listing"); return; }
    if (!matchId) { toast.error(t.selectMatchAlert); return; }
    if (!price || Number(price) <= 0) { toast.error(t.validPriceAlert); return; }
    if (quantity <= 0) { toast.error(t.validQuantityAlert); return; }

    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); toast.error(t.loginFirst); router.push("/auth"); return; }

    const { data: profile } = await supabase.from("profiles").select("full_name,phone,country,last_post_at,is_premium,plan").eq("id", user.id).maybeSingle();
    if (!profile?.full_name || !profile?.phone || !profile?.country) { setSubmitting(false); toast.error(t.saveProfileFirst); router.push("/complete-profile"); return; }

    if (!editId && profile.last_post_at && !profile.is_premium && Date.now() - new Date(profile.last_post_at).getTime() < 30000) {
      setSubmitting(false); toast.error(t.postEvery30Seconds); return;
    }

    // Get match date for expiry
    const matchDate = league === "wc"
      ? selectedWCMatch?.match_date
      : selectedILMatch?.match_date;

    const exp = matchDate
      ? new Date(matchDate + "T23:59:59").toISOString()
      : new Date(Date.now() + 7 * 86400000).toISOString();

    const payload: Record<string, any> = {
      type,
      category,
      quantity,
      price: Number(price),
      notes: notes.trim() || null,
      seated_together: quantity > 1 ? seatedTogether : "unknown",
      seats_block: seatsBlock.trim() || null,
      seats_row: seatsRow.trim() || null,
      seats_numbers: seatsNums.trim() || null,
      status: "active",
      expires_at: exp,
    };

    // Attach to correct match table
    if (league === "show") {
      if (!artistId) { toast.error(isHe ? "בחר אמן" : "Select artist"); setSubmitting(false); return; }
      const now2 = new Date().toISOString();
      const { error: showErr } = await supabase.from("show_listings").insert({
        user_id: user.id,
        artist_id: artistId,
        venue_id: venueId || null,
        show_date: showDate || null,
        show_time: showTime || null,
        type,
        price: price ? Number(price) : null,
        quantity: Number(quantity) || 1,
        ticket_type: ticketType,
        ticket_type_custom: ticketType === "other" ? ticketTypeCustom : null,
        seats_row: seatsRow.trim() || null,
        seats_numbers: seatsNums.trim() || null,
        seated_together: quantity > 1 ? seatedTogether : "unknown",
        notes: notes.trim() || null,
        first_published_at: now2,
      });
      setSubmitting(false);
      if (showErr) { toast.error(isHe ? "פרסום נכשל" : "Failed to post"); return; }
      toast.success(isHe ? "המודעה פורסמה!" : "Listing posted!");
      router.push("/live-shows");
      return;
    }
    if (league === "il") {
      payload.israeli_match_id = matchId;
      payload.match_id = null;
    } else {
      payload.match_id = matchId;
      payload.israeli_match_id = null;
    }

    const userPlan = (profile.plan as string) ?? (profile.is_premium ? "premium" : "free");
    const planLimits: Record<string, number> = { free: 10, premium: 25, unlimited: 9999 };
    const maxListings = planLimits[userPlan] ?? 10;

    if (editId) {
      const { error } = await supabase.from("listings").update(payload).eq("id", editId).eq("user_id", user.id);
      setSubmitting(false);
      if (error) { toast.error(isHe ? "עדכון נכשל" : "Update failed"); return; }
      await supabase.from("profiles").update({ last_post_at: new Date().toISOString() }).eq("id", user.id);
      toast.success(t.listingUpdated);
      router.push(league === "il" ? `/sports/football-israel/${matchId}` : `/matches/${matchId}`);
      return;
    }

    // Check limit
    const { data: active } = await supabase.from("listings").select("id").eq("user_id", user.id).eq("status", "active").is("archived_at", null).gt("expires_at", new Date().toISOString());
    if ((active || []).length >= maxListings) { setSubmitting(false); toast.error(t.limitReached10); return; }

    // Check duplicate
    const dupQuery = supabase.from("listings").select("id").eq("user_id", user.id).eq("type", type).eq("category", category).is("archived_at", null);
    const { data: dup } = league === "il"
      ? await dupQuery.eq("israeli_match_id", matchId).maybeSingle()
      : await dupQuery.eq("match_id", matchId).maybeSingle();
    if (dup) { setSubmitting(false); toast.error(t.alreadySimilarListing); return; }

    const now = new Date().toISOString();
    const { error } = await supabase.from("listings").insert({ user_id: user.id, first_published_at: now, last_bumped_at: now, ...payload });
    setSubmitting(false);
    if (error) { toast.error(isHe ? "פרסום נכשל" : "Failed to post"); return; }

    await supabase.from("profiles").update({ last_post_at: now }).eq("id", user.id);
    setSuccessMatchId(matchId);
    setShowSuccess(true);
  }

  // ── Styles ─────────────────────────────────────────────────────────────────
  const card: CSSProperties = { background: "rgba(255,255,255,0.88)", border: `1px solid ${C.border}`, borderRadius: "10px", backdropFilter: "blur(12px)", boxShadow: "0 2px 16px rgba(13,27,62,0.06)", padding: "22px" };
  const lbl: CSSProperties  = { display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.hint, marginBottom: "7px" };
  const inp: CSSProperties  = { width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.9)", border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "13px", color: C.text, outline: "none", boxSizing: "border-box", fontFamily: "var(--font-dm),var(--font-he),sans-serif" };

  // Active color based on league
  const accentColor = league === "il" ? C.blue : C.usa;
  const currency    = league === "il" ? "₪" : "$";

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{ height: "3px", background: league === "il"
        ? `linear-gradient(90deg,${C.blue} 33.3%,${C.green} 33.3% 66.6%,${C.teal} 66.6%)`
        : `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)` }} />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1rem", width: "100%", boxSizing: "border-box" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, color: C.hint, textDecoration: "none", marginBottom: "20px", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
          ← {isHe ? "חזרה" : "Back"}
        </Link>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: accentColor, marginBottom: "10px" }}>
            STAY IN THE GAME
          </div>
          <h1 style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, letterSpacing: "-0.5px", color: C.text, lineHeight: 1.1 }}>
            {editId
              ? (isHe ? "עריכת מודעה" : "Edit listing")
              : type === "sell"
              ? (isHe ? "מכירת כרטיסים" : "Sell tickets")
              : (isHe ? "חיפוש כרטיסים" : "Looking to buy")}
          </h1>
          <p style={{ fontSize: "13px", color: C.muted, marginTop: "8px", fontWeight: 300 }}>
            {editId ? t.updateListingDetails : t.postListingSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 items-start lg:grid-cols-[1fr_360px]">
          <div style={card}>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              {/* ── LEAGUE SELECTOR ── */}
              {!editId && (
                <div>
                  <label style={lbl}>{isHe ? "לאיזה אירוע?" : "Which event?"}</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", background: C.border, borderRadius: "6px", overflow: "hidden" }}>
                    {([
                      ["wc",   "🌍", isHe ? "מונדיאל 2026"  : "World Cup 2026"],
                      ["il",   "⚽", isHe ? "כדורגל ישראלי" : "Israeli Football"],
                      ["show", "🎵", isHe ? "הופעות חיות"   : "Live Shows"],
                    ] as [LeagueType, string, string][]).map(([v, icon, label]) => (
                      <button key={v} type="button" onClick={() => setLeague(v)} style={{ padding: "13px 8px", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer", transition: "all 150ms", background: league === v ? (v === "il" ? C.blue : v === "show" ? C.teal : C.usa) : "rgba(255,255,255,0.9)", color: league === v ? "#fff" : C.hint, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "20px" }}>{icon}</span>
                        <span style={{ fontSize: "11px" }}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SELL / BUY ── */}
              <div>
                <label style={lbl}>{t.listingType}</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: C.border, borderRadius: "6px", overflow: "hidden" }}>
                  {["sell", "buy"].map((v) => (
                    <button key={v} type="button" onClick={() => setType(v)} style={{ padding: "11px", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer", transition: "all 150ms", background: type === v ? (v === "sell" ? C.mexico : accentColor) : "rgba(255,255,255,0.9)", color: type === v ? "#fff" : C.hint }}>
                      {v === "sell" ? (isHe ? "🎟️ מכירה" : "🎟️ Sell") : (isHe ? "🔍 קנייה" : "🔍 Buy")}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── SHOW FIELDS ── */}
              {league === "show" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* Artist */}
                  <div>
                    <label style={lbl}>{isHe ? "אמן / להקה" : "Artist / Band"}</label>
                    <select value={artistId} onChange={e => setArtistId(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                      <option value="">{isHe ? "בחר אמן..." : "Select artist..."}</option>
                      {artists.map(a => (
                        <option key={a.id} value={a.id}>{isHe ? (a.name_he || a.name) : a.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Venue */}
                  <div>
                    <label style={lbl}>{isHe ? "מקום ההופעה" : "Venue"}</label>
                    <select value={venueId} onChange={e => setVenueId(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                      <option value="">{isHe ? "בחר מקום..." : "Select venue..."}</option>
                      {venues.map(v => (
                        <option key={v.id} value={v.id}>{v.name}{v.city_he ? ` · ${isHe ? v.city_he : v.city}` : ""}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date + Time */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={lbl}>{isHe ? "תאריך" : "Date"}</label>
                      <input type="date" value={showDate} onChange={e => setShowDate(e.target.value)} style={inp} />
                    </div>
                    <div>
                      <label style={lbl}>{isHe ? "שעה" : "Time"}</label>
                      <input type="time" value={showTime} onChange={e => setShowTime(e.target.value)} style={inp} />
                    </div>
                  </div>

                  {/* Ticket type */}
                  <div>
                    <label style={lbl}>{isHe ? "סוג כרטיס" : "Ticket type"}</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: C.border, borderRadius: "6px", overflow: "hidden", marginBottom: ticketType === "other" ? "10px" : 0 }}>
                      {([
                        ["standing", isHe ? "עמידה" : "Standing"],
                        ["seated",   isHe ? "ישיבה" : "Seated"],
                        ["vip",      "VIP"],
                        ["gallery",  isHe ? "גלריה" : "Gallery"],
                        ["other",    isHe ? "אחר" : "Other"],
                      ] as [string,string][]).map(([v, lbl2]) => (
                        <button key={v} type="button" onClick={() => setTicketType(v)}
                          style={{ padding: "10px 6px", fontSize: "11px", fontWeight: 700, border: "none", cursor: "pointer", transition: "all 150ms", background: ticketType === v ? C.teal : "rgba(255,255,255,.9)", color: ticketType === v ? "#fff" : C.hint }}>
                          {lbl2}
                        </button>
                      ))}
                    </div>
                    {ticketType === "other" && (
                      <input type="text" placeholder={isHe ? "פרט את סוג הכרטיס..." : "Describe ticket type..."} value={ticketTypeCustom} onChange={e => setTicketTypeCustom(e.target.value)} style={inp} />
                    )}
                  </div>
                </div>
              )}

              {/* ── MATCH SELECTOR ── */}
              <div>
                <label style={lbl}>{t.match}</label>
                <select dir={isHe ? "rtl" : "ltr"} value={matchId} onChange={(e) => setMatchId(e.target.value)} disabled={loading} style={{ ...inp, cursor: "pointer" }}>
                  <option value="">{loading ? t.loading : t.selectMatch}</option>
                  {league === "wc"
                    ? wcMatches.map(m => <option key={m.id} value={m.id}>{matchOptionLabel(m, isHe)}</option>)
                    : ilMatches.map(m => <option key={m.id} value={m.id}>{ilMatchOptionLabel(m, isHe)}</option>)
                  }
                </select>
              </div>

              {/* ── CATEGORY — WC only ── */}
              {league === "wc" && <div>
                <label style={lbl}>{t.category}</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {["Category 1", "Category 2", "Category 3", "Category 4"].map((c) => (
                    <button key={c} type="button" onClick={() => setCategory(c)} style={{ padding: "9px 4px", fontSize: "11px", fontWeight: 600, border: `1px solid ${category === c ? accentColor : C.border}`, borderRadius: "6px", background: category === c ? `${accentColor}11` : "rgba(255,255,255,0.9)", color: category === c ? accentColor : C.muted, cursor: "pointer", transition: "all 150ms" }}>
                      {c.replace("Category ", isHe ? "קטג' " : "Cat ")}
                    </button>
                  ))}
                </div>
              </div>}

              {/* ── QUANTITY ── */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label style={lbl}>{t.quantity}</label>
                  <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} style={inp} />
                </div>
                {quantity > 1 && (
                  <div>
                    <label style={lbl}>{t.seatsTogetherQuestion}</label>
                    <select value={seatedTogether} onChange={(e) => setSeatedTogether(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                      <option value="yes">{t.yes}</option>
                      <option value="no">{t.no}</option>
                      <option value="unknown">{t.notSure}</option>
                    </select>
                  </div>
                )}
              </div>

              {/* ── SEAT INFO ── */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { l: t.blockOptional, v: seatsBlock, set: setSeatsBlock, ph: "A / 101" },
                  { l: t.rowOptional,   v: seatsRow,   set: setSeatsRow,   ph: "12" },
                  { l: t.seatsOptional, v: seatsNums,  set: setSeatsNums,  ph: "14-15" },
                ].map(({ l, v, set, ph }) => (
                  <div key={l}>
                    <label style={lbl}>{l}</label>
                    <input type="text" value={v} onChange={(e) => set(e.target.value)} placeholder={ph} style={inp} />
                  </div>
                ))}
              </div>

              {/* ── PRICE ── */}
              <div>
                <label style={lbl}>{t.price}</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", insetInlineStart: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: C.hint, pointerEvents: "none" as const }}>
                    {currency}
                  </span>
                  <input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="350" style={{ ...inp, paddingInlineStart: "28px" }} />
                </div>
              </div>

              {/* ── NOTES ── */}
              <div>
                <label style={lbl}>{t.notesOptional}</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder={t.addUsefulDetails} style={{ ...inp, resize: "vertical", lineHeight: 1.7 }} />
                <p style={{ fontSize: "10px", color: C.faint, marginTop: "5px" }}>
                  {isHe ? "הערות אלה יופיעו במודעה שלך" : "These notes will appear on your listing"}
                </p>
              </div>

              {/* ── TERMS ── */}
              <div style={{ border: `1px solid ${showTermsError ? "#ef4444" : C.border}`, borderRadius: "8px", background: showTermsError ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.7)", padding: "12px 14px" }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", fontSize: "12px", color: showTermsError ? "#b91c1c" : C.text, lineHeight: 1.6 }}>
                  <input type="checkbox" checked={acceptedTerms} onChange={(e) => { setAcceptedTerms(e.target.checked); if (e.target.checked) setShowTermsError(false); }} style={{ marginTop: "2px", accentColor: showTermsError ? "#ef4444" : accentColor, width: "16px", height: "16px", flexShrink: 0 }} />
                  <span>
                    {isHe ? (
                      <>אני מאשר/ת את{" "}<Link href="/terms-of-use" style={{ textDecoration: "underline" }}>תנאי השימוש</Link>{" "}ואת{" "}<Link href="/privacy-policy" style={{ textDecoration: "underline" }}>מדיניות הפרטיות</Link>, ומבין/ה שהאתר אינו צד לעסקה והאחריות על המחיר, תוכן המודעה וחוקיותה היא על המפרסם בלבד.</>
                    ) : (
                      <>I agree to the{" "}<Link href="/terms-of-use" style={{ textDecoration: "underline" }}>Terms of Use</Link>{" "}and{" "}<Link href="/privacy-policy" style={{ textDecoration: "underline" }}>Privacy Policy</Link>, and understand that the platform is not a party to the transaction and that responsibility for the listing content, price, and legality rests solely with the publisher.</>
                    )}
                  </span>
                </label>
                {showTermsError && (
                  <p style={{ marginTop: "8px", fontSize: "11px", fontWeight: 600, color: "#b91c1c" }}>
                    {isHe ? "כדי לפרסם מודעה צריך לאשר את תנאי השימוש." : "You must accept the Terms of Use before publishing a listing."}
                  </p>
                )}
              </div>

              {/* ── SUBMIT ── */}
              <button type="button" onClick={handleSubmit} disabled={submitting} style={{ padding: "13px", background: accentColor, color: "#fff", fontSize: "13px", fontWeight: 700, border: "none", borderRadius: "6px", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, letterSpacing: "0.02em" }}>
                {submitting ? t.loading : editId ? t.saveChanges : t.createListing}
              </button>
            </div>
          </div>

          {/* ── PREVIEW PANEL ── */}
          <div className="relative lg:sticky lg:top-5">
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.hint, marginBottom: "10px" }}>
              {isHe ? "תצוגה מקדימה" : "Live preview"}
            </div>

            <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 12px rgba(13,27,62,0.06)" }}>
              <div style={{ height: "2px", background: type === "sell" ? C.mexico : accentColor }} />
              <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", gap: "5px", marginBottom: "10px", flexWrap: "wrap" as const }}>
                  <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "3px", textTransform: "uppercase" as const, letterSpacing: "0.05em", background: type === "sell" ? "rgba(0,104,71,0.08)" : `${accentColor}11`, color: type === "sell" ? C.mexico : accentColor, border: `1px solid ${type === "sell" ? "rgba(0,104,71,0.2)" : `${accentColor}33`}` }}>
                    {type === "sell" ? (isHe ? "מכירה" : "Sell") : (isHe ? "קנייה" : "Buy")}
                  </span>
                  <span style={{ fontSize: "9px", fontWeight: 600, padding: "2px 7px", borderRadius: "3px", background: "#f1f5f9", color: C.hint, border: `1px solid ${C.border}` }}>
                    {category}
                  </span>
                  {league === "il" && (
                    <span style={{ fontSize: "9px", fontWeight: 600, padding: "2px 7px", borderRadius: "3px", background: "rgba(26,191,176,0.1)", color: C.teal, border: "1px solid rgba(26,191,176,0.2)" }}>
                      {isHe ? "כדורגל ישראלי" : "IL Football"}
                    </span>
                  )}
                </div>

                <div style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: price ? "24px" : "18px", fontWeight: 800, color: price ? C.text : C.faint, letterSpacing: "-0.5px", marginBottom: "6px" }}>
                  {price ? `${currency}${price}` : (isHe ? "מחיר..." : "Price...")}
                  {price && quantity > 1 && <span style={{ fontSize: "12px", color: C.hint, fontWeight: 400, marginInlineStart: "8px" }}>× {quantity} = {currency}{Number(price) * quantity}</span>}
                </div>

                {(seatsBlock || seatsRow || seatsNums || (quantity > 1 && seatedTogether === "yes")) && (
                  <div style={{ display: "flex", gap: "5px", marginBottom: "8px", flexWrap: "wrap" as const }}>
                    {seatsBlock && <span style={{ fontSize: "10px", padding: "2px 7px", background: "#f1f5f9", borderRadius: "3px", color: C.muted }}>{isHe ? "בלוק" : "Blk"} {seatsBlock}</span>}
                    {seatsRow   && <span style={{ fontSize: "10px", padding: "2px 7px", background: "#f1f5f9", borderRadius: "3px", color: C.muted }}>{isHe ? "שורה" : "Row"} {seatsRow}</span>}
                    {seatsNums  && <span style={{ fontSize: "10px", padding: "2px 7px", background: "#f1f5f9", borderRadius: "3px", color: C.muted }}>{seatsNums}</span>}
                    {quantity > 1 && seatedTogether === "yes" && <span style={{ fontSize: "10px", padding: "2px 7px", background: "rgba(34,197,94,0.08)", borderRadius: "3px", color: "#15803d" }}>✓ {isHe ? "יחד" : "Together"}</span>}
                  </div>
                )}

                {notes && <p style={{ fontSize: "11px", color: C.muted, fontStyle: "italic", lineHeight: 1.55, marginBottom: "10px" }}>"{notes}"</p>}

                {/* Match preview */}
                {league === "wc" && selectedWCMatch ? (
                  <div style={{ fontSize: "11px", color: C.hint, paddingTop: "10px", borderTop: `1px solid ${C.border}`, display: "flex", flexWrap: "wrap" as const, alignItems: "center", gap: "6px", lineHeight: 1.5 }}>
                    <span>⚽ {isHe ? "משחק" : "Match"} {selectedWCMatch.fifa_match_number} ·</span>
                    <TeamInline name={selectedWCMatch.home_team_name} stage={selectedWCMatch.stage} isHe={isHe} />
                    <span>{isHe ? "נגד" : "vs"}</span>
                    <TeamInline name={selectedWCMatch.away_team_name} stage={selectedWCMatch.stage} isHe={isHe} />
                    <span style={{ flexBasis: "100%" }}>{stageLabel(selectedWCMatch.stage, isHe)} · {selectedWCMatch.city} · {selectedWCMatch.match_date}</span>
                  </div>
                ) : league === "il" && selectedILMatch ? (
                  <div style={{ fontSize: "11px", color: C.hint, paddingTop: "10px", borderTop: `1px solid ${C.border}`, lineHeight: 1.6 }}>
                    <span>⚽ {isHe ? selectedILMatch.home_team : selectedILMatch.home_team_en} {isHe ? "נגד" : "vs"} {isHe ? selectedILMatch.away_team : selectedILMatch.away_team_en}</span>
                    <br />
                    <span>{isHe ? selectedILMatch.round : selectedILMatch.round_en} · {selectedILMatch.match_date}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: "11px", color: C.faint, paddingTop: "10px", borderTop: `1px solid ${C.border}` }}>
                    {isHe ? "בחר משחק..." : "Select a match..."}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: "12px", padding: "12px 14px", background: `${accentColor}08`, border: `1px solid ${accentColor}18`, borderRadius: "8px" }}>
              <p style={{ fontSize: "11px", color: C.muted, lineHeight: 1.7 }}>
                {isHe ? "המודעה תהיה פעילה עד לאחר המשחק. תוכל לערוך או למחוק אותה בכל עת מהאזור האישי." : "Your listing stays live until after the match. You can edit or delete it anytime from My Listings."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <SuccessModal
          matchId={successMatchId}
          redirectUrl={league === "il" ? `/sports/football-israel/${successMatchId}` : `/matches/${successMatchId}`}
        />
      )}
    </main>
  );
}

export default function PostListingPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100vh" }} />}>
      <PostListingPageContent />
    </Suspense>
  );
}
