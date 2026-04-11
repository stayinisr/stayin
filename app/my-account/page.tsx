"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../lib/LanguageContext";
import { useToast } from "../../components/ToastProvider";

const C = { usa: "#1a3a6b", canada: "#e63946", mexico: "#006847", gold: "#d4a017", border: "#e8edf5", text: "#0d1b3e", muted: "#64748b", hint: "#94a3b8", faint: "#cbd5e1" };

type Profile = { full_name: string | null; phone: string | null; country: string | null; is_premium: boolean; is_admin: boolean; created_at: string | null; };
type ListingSummary = { id: string; type: string; price: number; status: string; expires_at: string | null; match_id: string; match: { fifa_match_number: number; home_team_name: string | null; away_team_name: string | null; } | null; };

export default function MyAccountPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const toast = useToast();
  const isHe = lang === "he";

  const [email, setEmail]     = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { router.push("/auth"); return; }
    setEmail(session.user.email ?? null);

    const [profileRes, listingsRes] = await Promise.all([
      supabase.from("profiles").select("full_name,phone,country,is_premium,is_admin,created_at").eq("id", session.user.id).maybeSingle(),
      supabase.from("listings").select("id,type,price,status,expires_at,match_id,matches(fifa_match_number,home_team_name,away_team_name)").eq("user_id", session.user.id).is("archived_at", null).order("created_at", { ascending: false }).limit(5),
    ]);

    if (profileRes.data) setProfile(profileRes.data as Profile);

    const raw = (listingsRes.data || []) as any[];
    setListings(raw.map(l => ({ id: l.id, type: l.type, price: l.price, status: l.status, expires_at: l.expires_at, match_id: l.match_id, match: l.matches ?? null })));

    const now = new Date().toISOString();
    setActiveCount(raw.filter(l => l.status === "active" && (!l.expires_at || l.expires_at > now)).length);
    setLoading(false);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : email?.[0]?.toUpperCase() ?? "?";

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(isHe ? "he-IL" : "en-US", { month: "long", year: "numeric" })
    : null;

  const profileComplete = !!(profile?.full_name && profile?.phone && profile?.country);

  const card: React.CSSProperties = { background: "rgba(255,255,255,0.88)", border: `1px solid ${C.border}`, borderRadius: "10px", backdropFilter: "blur(12px)", boxShadow: "0 2px 12px rgba(13,27,62,0.05)" };

  if (loading) return (
    <main style={{ minHeight: "100vh" }}>
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)` }} />
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <style>{`@keyframes sk{from{background-position:-400px 0}to{background-position:400px 0}}.sk{background:linear-gradient(90deg,#f0f4f8 25%,#e8edf5 50%,#f0f4f8 75%);background-size:600px 100%;animation:sk 1.4s infinite linear;border-radius:8px;}`}</style>
        {[160, 100, 80].map((h, i) => <div key={i} className="sk" style={{ height: `${h}px`, marginBottom: "12px" }} />)}
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh" }}>
      <style>{`@keyframes fsu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.fsu{animation:fsu 360ms cubic-bezier(0.16,1,0.3,1) both}.fsu1{animation-delay:50ms}.fsu2{animation-delay:100ms}.fsu3{animation-delay:150ms}.fsu4{animation-delay:200ms}`}</style>
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)` }} />

      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, color: C.hint, textDecoration: "none", marginBottom: "20px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          ← {isHe ? "כל המשחקים" : "All matches"}
        </Link>

        {/* ── PROFILE HERO ── */}
        <div className="fsu" style={{ ...card, padding: "24px", marginBottom: "12px" }}>
          <div style={{ height: "3px", background: `linear-gradient(90deg,${C.usa},${C.mexico})`, margin: "-24px -24px 20px" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Avatar */}
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: `linear-gradient(135deg, ${C.usa}, ${C.mexico})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 800, color: "#fff", flexShrink: 0, boxShadow: "0 4px 16px rgba(26,58,107,0.25)" }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap", marginBottom: "3px" }}>
                <span style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "18px", fontWeight: 800, color: C.text }}>
                  {profile?.full_name || (isHe ? "אנונימי" : "Anonymous")}
                </span>
                {profile?.is_premium && <span style={{ fontSize: "9px", fontWeight: 800, padding: "2px 8px", borderRadius: "3px", background: `linear-gradient(135deg,${C.gold},#fbbf24)`, color: "#fff", letterSpacing: "0.06em" }}>⭐ PREMIUM</span>}
                {profile?.is_admin && <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px", background: "rgba(26,58,107,0.1)", color: C.usa, border: `1px solid rgba(26,58,107,0.2)`, letterSpacing: "0.06em" }}>ADMIN</span>}
              </div>
              <div style={{ fontSize: "12px", color: C.hint }}>{email}</div>
              {memberSince && <div style={{ fontSize: "11px", color: C.faint, marginTop: "2px" }}>{isHe ? `חבר מאז ${memberSince}` : `Member since ${memberSince}`}</div>}
              {profile?.country && <div style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>📍 {profile.country}</div>}
            </div>
          </div>

          {/* Profile completeness */}
          {!profileComplete && (
            <Link href="/complete-profile" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "16px", padding: "12px 14px", background: "rgba(230,57,70,0.05)", border: `1px solid rgba(230,57,70,0.2)`, borderRadius: "8px", textDecoration: "none" }}>
              <span style={{ fontSize: "16px" }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: C.canada }}>{isHe ? "הפרופיל לא מלא" : "Profile incomplete"}</div>
                <div style={{ fontSize: "11px", color: C.muted }}>{isHe ? "נדרש ליצירת קשר עם מוכרים ופרסום מודעות" : "Required to contact sellers and post listings"}</div>
              </div>
              <span style={{ fontSize: "12px", color: C.canada }}>→</span>
            </Link>
          )}
        </div>

        {/* ── STATS ── */}
        <div className="fsu fsu1" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "12px" }}>
          {[
            { v: activeCount, l: isHe ? "מודעות פעילות" : "Active listings", c: C.mexico },
            { v: profile?.is_premium ? "∞" : `${activeCount}/10`, l: isHe ? "מגבלה" : "Limit", c: C.usa },
            { v: profile?.phone ? "✓" : "—", l: isHe ? "וואטסאפ" : "WhatsApp", c: profile?.phone ? C.mexico : C.faint },
          ].map((s, i) => (
            <div key={i} style={{ ...card, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "18px", fontWeight: 800, color: s.c, marginBottom: "3px" }}>{s.v}</div>
              <div style={{ fontSize: "10px", fontWeight: 600, color: C.hint, textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="fsu fsu2" style={{ ...card, padding: "6px", marginBottom: "12px" }}>
          {[
            { href: "/post-listing", icon: "🎟️", label: isHe ? "פרסם מודעה חדשה" : "Post a new listing", accent: true },
            { href: "/my-listings", icon: "📋", label: isHe ? "כל המודעות שלי" : "All my listings", accent: false },
            { href: "/complete-profile", icon: "✏️", label: isHe ? "עריכת פרופיל" : "Edit profile", accent: false },
          ].map(({ href, icon, label, accent }) => (
            <Link key={href} href={href}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 14px", borderRadius: "8px", textDecoration: "none", color: accent ? C.usa : C.text, fontWeight: accent ? 700 : 500, fontSize: "13px", background: accent ? "rgba(26,58,107,0.05)" : "transparent", transition: "background 150ms" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = accent ? "rgba(26,58,107,0.08)" : "rgba(13,27,62,0.03)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = accent ? "rgba(26,58,107,0.05)" : "transparent")}>
              <span style={{ fontSize: "16px" }}>{icon}</span>
              {label}
              <span style={{ marginInlineStart: "auto", color: C.faint }}>›</span>
            </Link>
          ))}
        </div>

        {/* ── RECENT LISTINGS ── */}
        {listings.length > 0 && (
          <div className="fsu fsu3" style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.hint, marginBottom: "8px" }}>
              {isHe ? "מודעות אחרונות" : "Recent listings"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {listings.map(l => {
                const isActive = l.status === "active" && (!l.expires_at || new Date(l.expires_at).getTime() > Date.now());
                return (
                  <Link key={l.id} href={`/matches/${l.match_id}`}
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", ...card, textDecoration: "none", transition: "transform 150ms" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = "translateY(-1px)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "none")}>
                    <div style={{ width: "30px", height: "30px", borderRadius: "6px", background: l.type === "sell" ? "rgba(0,104,71,0.1)" : "rgba(26,58,107,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: l.type === "sell" ? C.mexico : C.usa, flexShrink: 0 }}>
                      {l.type === "sell" ? "↑" : "↓"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {l.match ? `Match ${l.match.fifa_match_number} · ${l.match.home_team_name ?? "TBD"} vs ${l.match.away_team_name ?? "TBD"}` : "—"}
                      </div>
                      <div style={{ fontSize: "11px", color: C.hint }}>
                        {l.type === "sell" ? (isHe ? "מכירה" : "Sell") : (isHe ? "קנייה" : "Buy")} · <span style={{ color: C.usa, fontWeight: 600 }}>${l.price}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px", background: isActive ? "rgba(0,104,71,0.08)" : "#f1f5f9", color: isActive ? C.mexico : C.faint, border: `1px solid ${isActive ? "rgba(0,104,71,0.2)" : C.border}`, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {isActive ? (isHe ? "פעיל" : "Active") : (isHe ? "לא פעיל" : "Inactive")}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── LOGOUT ── */}
        <div className="fsu fsu4">
          <button onClick={() => setShowLogout(true)}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: `1px solid rgba(230,57,70,0.2)`, background: "rgba(230,57,70,0.04)", color: C.canada, fontWeight: 600, fontSize: "13px", cursor: "pointer", transition: "background 150ms" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(230,57,70,0.08)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(230,57,70,0.04)")}>
            {isHe ? "התנתקות" : "Log out"}
          </button>
        </div>
      </div>

      {/* Logout modal */}
      {showLogout && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(13,27,62,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99, padding: "1.5rem" }}
          onClick={e => { if (e.target === e.currentTarget) setShowLogout(false); }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "32px", maxWidth: "340px", width: "100%", textAlign: "center", boxShadow: "0 32px 80px rgba(13,27,62,0.2)" }}>
            <div style={{ fontSize: "36px", marginBottom: "14px" }}>👋</div>
            <h3 style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "20px", fontWeight: 800, color: C.text, marginBottom: "8px" }}>{isHe ? "להתנתק?" : "Log out?"}</h3>
            <p style={{ fontSize: "13px", color: C.muted, marginBottom: "24px", lineHeight: 1.7 }}>{isHe ? "תוכל להתחבר שוב בכל עת" : "You can log in again anytime"}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={handleLogout} disabled={loggingOut}
                style={{ padding: "12px", borderRadius: "6px", background: C.canada, color: "#fff", fontWeight: 700, fontSize: "13px", border: "none", cursor: loggingOut ? "not-allowed" : "pointer", opacity: loggingOut ? 0.7 : 1 }}>
                {loggingOut ? (isHe ? "מתנתק..." : "Logging out...") : (isHe ? "התנתק" : "Log out")}
              </button>
              <button onClick={() => setShowLogout(false)}
                style={{ padding: "12px", borderRadius: "6px", border: `1px solid ${C.border}`, background: "#fff", color: C.muted, fontWeight: 500, fontSize: "13px", cursor: "pointer" }}>
                {isHe ? "ביטול" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
