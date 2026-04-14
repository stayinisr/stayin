"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../lib/LanguageContext";
import { useToast } from "../../components/ToastProvider";
import { teamCode } from "../../lib/teams";

const C = { usa: "#1a3a6b", canada: "#e63946", mexico: "#006847", gold: "#d4a017", border: "#e8edf5", text: "#0d1b3e", muted: "#64748b", hint: "#94a3b8", faint: "#cbd5e1", bg: "#f8f9fc" };
type Plan = "free" | "premium" | "unlimited";

const PLAN_LIMITS = {
  free:      { max_listings: 10,   max_featured: 2,  bump_hours: 4 },
  premium:   { max_listings: 25,   max_featured: 5,  bump_hours: 1 },
  unlimited: { max_listings: 9999, max_featured: 20, bump_hours: 1 },
};

function getPlanLimits(plan: Plan) { return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free; }

type Listing = {
  id: string; match_id: string; type: string; category: string; quantity: number; price: number;
  notes: string | null; status: string; expires_at: string | null; is_featured?: boolean;
  last_bumped_at?: string | null; first_published_at?: string | null; archived_at?: string | null;
  match?: { fifa_match_number: number; home_team_name: string | null; away_team_name: string | null; city: string; match_date: string; } | null;
};

function BumpTimer({ lastBumped, plan, isHe, onBump }: { lastBumped?: string | null; plan: Plan; isHe: boolean; onBump: () => void; }) {
  const [ms, setMs] = useState(0);
  const bumpHours = getPlanLimits(plan).bump_hours;
  useEffect(() => {
    if (!lastBumped) { setMs(0); return; }
    function tick() { setMs(Math.max(0, new Date(lastBumped!).getTime() + bumpHours * 3600000 - Date.now())); }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [lastBumped, bumpHours]);

  const canBump = ms === 0;
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
  const timer = `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "7px", border: `1px solid ${canBump ? "rgba(0,104,71,0.25)" : C.border}`, background: canBump ? "rgba(0,104,71,0.06)" : "rgba(0,0,0,0.02)", transition: "all 150ms" }}>
      <div>
        <div style={{ fontSize: "12px", fontWeight: 700, color: canBump ? C.mexico : C.hint }}>🚀 {isHe ? "הקפץ מודעה" : "Bump listing"}</div>
        <div style={{ fontSize: "10px", color: C.muted, marginTop: "1px" }}>
          {canBump ? (isHe ? "מעלה אותך לראש הרשימה" : "Moves you to top of list") : (isHe ? `זמין שוב בעוד` : "Available again in")}
        </div>
      </div>
      {canBump
        ? <button onClick={onBump} style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 800, border: "none", borderRadius: "6px", background: C.mexico, color: "#fff", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            {isHe ? "הקפץ עכשיו →" : "Bump now →"}
          </button>
        : <span style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "18px", fontWeight: 800, color: C.hint, letterSpacing: "1px" }}>{timer}</span>
      }
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
  const [plan, setPlan] = useState<Plan>("free");
  const isPremium = plan !== "free";

  useEffect(() => { loadPage(); }, []);

  async function loadPage() {
    setLoading(true);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) { router.push("/auth"); return; }
    setEmail(user.email ?? null);

    const { data: profile } = await supabase.from("profiles").select("is_premium, plan").eq("id", user.id).maybeSingle();
    setPlan((profile?.plan as Plan) ?? (profile?.is_premium ? "premium" : "free"));

    const { data: raw } = await supabase.from("listings").select("*").eq("user_id", user.id).is("archived_at", null).order("created_at", { ascending: false });
    const ids = [...new Set((raw || []).map((l: any) => l.match_id))];
    let mMap: Record<string, any> = {};
    if (ids.length) {
      const { data: md } = await supabase.from("matches").select("id,fifa_match_number,home_team_name,away_team_name,city,match_date").in("id", ids);
      mMap = Object.fromEntries((md || []).map((m: any) => [m.id, m]));
    }
    setListings((raw || []).map((l: any) => ({ ...l, match: mMap[l.match_id] || null })));
    setLoading(false);
  }

  function isExp(e: string | null) { return e ? new Date(e).getTime() < Date.now() : false; }

  const activeCount   = useMemo(() => listings.filter(l => l.status === "active" && !isExp(l.expires_at)).length, [listings]);
  const featuredCount = useMemo(() => listings.filter(l => !!l.is_featured && l.status === "active" && !isExp(l.expires_at)).length, [listings]);

  async function handleClose(id: string) {
    const { error } = await supabase.from("listings").update({ status: "closed" }).eq("id", id);
    if (!error) { toast.success(isHe ? "המודעה נסגרה" : "Listing closed"); loadPage(); }
    else toast.error(isHe ? "שגיאה" : "Error");
  }

  async function handleRenew(id: string) {
    const exp = new Date(Date.now() + 7 * 86400000).toISOString();
    const { error } = await supabase.from("listings").update({ status: "active", expires_at: exp }).eq("id", id);
    if (!error) { toast.success(isHe ? "חודש ל-7 ימים ✓" : "Renewed for 7 days ✓"); loadPage(); }
  }

  async function handleDelete(id: string) {
    if (!confirm(isHe ? "למחוק את המודעה?" : "Delete this listing?")) return;
    const { error } = await supabase.from("listings").update({ archived_at: new Date().toISOString(), status: "closed" }).eq("id", id);
    if (!error) { toast.success(isHe ? "המודעה נמחקה" : "Listing deleted"); loadPage(); }
  }

  async function handleFeatureOn(listing: Listing) {
    const maxFeat = getPlanLimits(plan).max_featured;
    if (featuredCount >= maxFeat) { toast.warning(isHe ? `ניתן להדגיש עד ${maxFeat} מודעות בלבד` : `Max ${maxFeat} featured listings`); return; }
    const payload: any = { is_featured: true };
    if (!(listing as any).first_featured_at) payload.first_featured_at = new Date().toISOString();
    const { error } = await supabase.from("listings").update(payload).eq("id", listing.id);
    if (!error) { toast.success(isHe ? "מודעה הפכה למוזהבת ⭐" : "Listing is now gold ⭐"); loadPage(); }
  }

  async function handleFeatureOff(id: string) {
    const { error } = await supabase.from("listings").update({ is_featured: false }).eq("id", id);
    if (!error) { toast.show(isHe ? "ההדגשה הוסרה" : "Gold removed", "info"); loadPage(); }
  }

  async function handleBump(id: string) {
    const { error } = await supabase.from("listings").update({ last_bumped_at: new Date().toISOString() }).eq("id", id);
    if (!error) { toast.success(isHe ? "המודעה הוקפצה 🚀" : "Listing bumped 🚀"); loadPage(); }
  }

  const card: React.CSSProperties = { background: "rgba(255,255,255,0.88)", border: `1px solid ${C.border}`, borderRadius: "10px", backdropFilter: "blur(12px)", boxShadow: "0 2px 12px rgba(13,27,62,0.05)" };

  return (
    <main style={{ minHeight: "100vh" }}>
      <style>{`@keyframes fsu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.fsu{animation:fsu 360ms cubic-bezier(0.16,1,0.3,1) both}.fsu1{animation-delay:40ms}.fsu2{animation-delay:80ms}`}</style>
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)` }} />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.75rem" }}>

        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, color: C.hint, textDecoration: "none", marginBottom: "20px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          ← {isHe ? "כל המשחקים" : "All matches"}
        </Link>

        {/* Header card */}
        <div className="fsu" style={{ ...card, padding: "20px 24px", marginBottom: "12px" }}>
          <div style={{ height: "2px", background: C.usa, margin: "-20px -24px 18px" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: C.usa, marginBottom: "6px" }}>STAY IN THE GAME</div>
              <h1 style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, color: C.text, letterSpacing: "-0.3px", marginBottom: "4px" }}>
                {isHe ? "המודעות שלי" : "My listings"}
              </h1>
              <p style={{ fontSize: "12px", color: C.hint }}>
                {email}
                {plan === "premium" && <span style={{ color: C.gold, fontWeight: 700, marginInlineStart: "6px" }}>⭐ Premium</span>}
                {plan === "unlimited" && <span style={{ color: C.mexico, fontWeight: 700, marginInlineStart: "6px" }}>🚀 Unlimited</span>}
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: "1px", background: C.border, borderRadius: "8px", overflow: "hidden", border: `1px solid ${C.border}` }}>
              {[
                { n: activeCount, l: isHe ? "פעילות" : "Active", c: C.mexico },
                { n: plan === "unlimited" ? "∞" : `${activeCount}/${getPlanLimits(plan).max_listings}`, l: isHe ? "מגבלה" : "Limit", c: C.usa },
                { n: `${featuredCount}/${getPlanLimits(plan).max_featured}`, l: isHe ? "מוזהבות" : "Gold", c: C.gold },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.9)", padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "17px", fontWeight: 800, color: s.c }}>{s.n}</div>
                  <div style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.hint, marginTop: "2px" }}>{s.l}</div>
                </div>
              ))}
            </div>

            <Link href="/post-listing"
              style={{ padding: "11px 20px", background: C.usa, color: "#fff", fontSize: "12px", fontWeight: 700, borderRadius: "6px", textDecoration: "none", letterSpacing: "0.02em" }}>
              + {isHe ? "מודעה חדשה" : "New listing"}
            </Link>
          </div>
        </div>

        {/* Listings */}
        <div className="fsu fsu1">
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <style>{`@keyframes sk{from{background-position:-600px 0}to{background-position:600px 0}}.sk{background:linear-gradient(90deg,#f0f4f8 25%,#e8edf5 50%,#f0f4f8 75%);background-size:800px 100%;animation:sk 1.4s infinite linear;border-radius:8px;}`}</style>
              {[1,2,3].map(i => <div key={i} className="sk" style={{ height: "100px" }} />)}
            </div>
          ) : listings.length === 0 ? (
            <div style={{ ...card, padding: "56px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "14px" }}>📋</div>
              <p style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "18px", fontWeight: 800, color: C.text, marginBottom: "8px" }}>{isHe ? "אין לך מודעות עדיין" : "No listings yet"}</p>
              <p style={{ fontSize: "13px", color: C.muted, marginBottom: "20px" }}>{isHe ? "פרסם מודעה ראשונה וצא למכירה" : "Post your first listing and start selling"}</p>
              <Link href="/post-listing" style={{ display: "inline-block", padding: "12px 28px", background: C.usa, color: "#fff", fontSize: "13px", fontWeight: 700, borderRadius: "6px", textDecoration: "none" }}>
                {isHe ? "+ פרסם מודעה" : "+ Post listing"}
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {listings.map(listing => {
                const expired = isExp(listing.expires_at);
                const isActive = listing.status === "active" && !expired;
                const statusLabel = listing.status === "closed" ? (isHe ? "סגורה" : "Closed") : expired ? (isHe ? "פג תוקף" : "Expired") : (isHe ? "פעילה" : "Active");
                const statusColor = isActive ? C.mexico : C.faint;

                return (
                  <div key={listing.id} style={{
                    background: "#ffffff",
                    border: `1px solid ${C.border}`,
                    borderRadius: "10px",
                    overflow: "hidden",
                    boxShadow: "0 2px 12px rgba(13,27,62,0.06)",
                    position: "relative",
                  }}>
                    {/* Top bar — Gold: 3-color gradient | Regular: solid accent */}
                    <div style={{ height: "3px", background: listing.is_featured ? `linear-gradient(90deg,${C.usa},${C.gold},${C.mexico})` : listing.type === "sell" ? C.mexico : C.usa }} />

                    {/* Gold glow */}
                    {listing.is_featured && (
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "120px", background: "radial-gradient(ellipse at 50% 0%, rgba(212,160,23,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
                    )}

                    {/* Card body */}
                    <div style={{ padding: "16px 20px", position: "relative" }}>

                      {/* Badges row */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
                        {listing.is_featured && (
                          <span style={{ fontSize: "9px", fontWeight: 800, padding: "3px 10px", borderRadius: "3px", background: `linear-gradient(135deg,${C.gold},#fbbf24)`, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            ⭐ GOLD LISTING
                          </span>
                        )}
                        <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px", textTransform: "uppercase", letterSpacing: "0.05em", background: listing.type === "sell" ? "rgba(0,104,71,0.08)" : "rgba(26,58,107,0.07)", color: listing.type === "sell" ? C.mexico : C.usa, border: `1px solid ${listing.type === "sell" ? "rgba(0,104,71,0.2)" : "rgba(26,58,107,0.15)"}` }}>
                          {listing.type === "sell" ? (isHe ? "מכירה" : "Sell") : (isHe ? "קנייה" : "Buy")}
                        </span>
                        <span style={{ fontSize: "9px", fontWeight: 600, padding: "2px 8px", borderRadius: "3px", background: "#f1f5f9", color: C.hint, border: `1px solid ${C.border}` }}>
                          {listing.category}
                        </span>
                        <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "3px", background: isActive ? "rgba(0,104,71,0.07)" : "rgba(0,0,0,0.03)", color: statusColor, border: `1px solid ${isActive ? "rgba(0,104,71,0.18)" : "rgba(0,0,0,0.07)"}`, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          {statusLabel}
                        </span>
                        {listing.expires_at && (
                          <span style={{ fontSize: "9px", color: expired ? C.canada : C.hint, marginInlineStart: "2px" }}>
                            · {isHe ? "תוקף" : "Exp"} {new Date(listing.expires_at).toLocaleDateString(isHe ? "he-IL" : "en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>

                      {/* Match title */}
                      <div style={{ fontSize: "13px", fontWeight: 600, color: C.muted, marginBottom: "6px" }}>
                        {listing.match ? (
                          <>
                            Match {listing.match.fifa_match_number} ·{" "}
                            <img src={`https://flagcdn.com/w20/${teamCode(listing.match.home_team_name)}.png`} style={{ height: "11px", borderRadius: "2px", verticalAlign: "middle", margin: "0 3px 1px 0" }} />
                            {listing.match.home_team_name || "TBD"} vs{" "}
                            <img src={`https://flagcdn.com/w20/${teamCode(listing.match.away_team_name)}.png`} style={{ height: "11px", borderRadius: "2px", verticalAlign: "middle", margin: "0 3px 1px 0" }} />
                            {listing.match.away_team_name || "TBD"} · {listing.match.city}
                          </>
                        ) : "—"}
                      </div>

                      {/* Price — hero (matches page style) */}
                      <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "10px" }}>
                        <span style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: listing.is_featured ? "32px" : "24px", fontWeight: 800, color: C.text, letterSpacing: "-1px", lineHeight: 1 }}>
                          {listing.type === "sell" ? `$${listing.price}` : (isHe ? `עד $${listing.price}` : `Up to $${listing.price}`)}
                        </span>
                        <span style={{ fontSize: "12px", color: C.hint }}>
                          {isHe ? "לכרטיס" : "/ ticket"} × {listing.quantity}
                        </span>
                        {listing.quantity > 1 && listing.type === "sell" && (
                          <span style={{ fontSize: "13px", fontWeight: 700, color: C.gold }}>= ${listing.price * listing.quantity}</span>
                        )}
                      </div>

                      {/* Notes — matches page style */}
                      {listing.notes && (
                        <p style={{ fontSize: "12px", color: C.muted, fontStyle: "italic", lineHeight: 1.65, marginBottom: "12px", borderLeft: `2px solid ${C.gold}`, paddingLeft: "10px" }}>
                          "{listing.notes}"
                        </p>
                      )}
                    </div>

                    {/* Management bar — Option 3: Bump hero */}
                    <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 20px", background: "#fafbfd", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {/* Bump hero */}
                      <BumpTimer lastBumped={listing.last_bumped_at} plan={plan} isHe={isHe} onBump={() => handleBump(listing.id)} />
                      {/* Small actions row */}
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                        <Link href={`/post-listing?listingId=${listing.id}`}
                          style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, border: `1px solid ${C.border}`, borderRadius: "5px", background: "#fff", color: C.muted, textDecoration: "none", whiteSpace: "nowrap" }}>
                          {isHe ? "✏️ ערוך" : "✏️ Edit"}
                        </Link>
                        {listing.is_featured
                          ? <button onClick={() => handleFeatureOff(listing.id)} style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, border: `1px solid ${C.border}`, borderRadius: "5px", background: "#fff", color: C.muted, cursor: "pointer", whiteSpace: "nowrap" }}>{isHe ? "הסר Gold" : "Remove Gold"}</button>
                          : <button onClick={() => handleFeatureOn(listing)} style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 700, border: "1px solid rgba(212,160,23,0.4)", borderRadius: "5px", background: "rgba(212,160,23,0.08)", color: "#92400e", cursor: "pointer", whiteSpace: "nowrap" }}>⭐ Gold</button>
                        }
                        {isActive
                          ? <button onClick={() => handleClose(listing.id)} style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, border: `1px solid ${C.border}`, borderRadius: "5px", background: "#fff", color: C.muted, cursor: "pointer", whiteSpace: "nowrap" }}>{isHe ? "סגור" : "Close"}</button>
                          : <button onClick={() => handleRenew(listing.id)} style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 700, border: `1px solid ${C.usa}`, borderRadius: "5px", background: "rgba(26,58,107,0.06)", color: C.usa, cursor: "pointer", whiteSpace: "nowrap" }}>{isHe ? "חדש 7 ימים" : "Renew 7d"}</button>
                        }
                        <Link href={`/matches/${listing.match_id}`}
                          style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, border: `1px solid ${C.border}`, borderRadius: "5px", background: "#fff", color: C.hint, textDecoration: "none", whiteSpace: "nowrap" }}>
                          {isHe ? "👁 צפה" : "👁 View"}
                        </Link>
                        <button onClick={() => handleDelete(listing.id)} style={{ marginInlineStart: "auto", padding: "6px 12px", fontSize: "11px", fontWeight: 600, border: "1px solid rgba(230,57,70,0.2)", borderRadius: "5px", background: "rgba(230,57,70,0.05)", color: C.canada, cursor: "pointer", whiteSpace: "nowrap" }}>
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
    </main>
  );
}
