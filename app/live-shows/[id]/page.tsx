"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../lib/LanguageContext";

type Artist = { id: string; name: string; name_he: string | null; image_url?: string | null };
type Venue = { id: string; name: string; city: string; city_he: string | null };
type Concert = {
  id: string;
  artist_id: string | null;
  venue_id: string | null;
  concert_date: string;
  concert_time: string | null;
  status: string | null;
};
type ConcertListing = {
  id: string;
  user_id: string | null;
  concert_id: string | null;
  type: string;
  price: number;
  quantity: number;
  notes: string | null;
  status: string | null;
  expires_at: string | null;
  archived_at: string | null;
  created_at: string | null;
};
type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
};
type EnrichedListing = ConcertListing & { profile: Profile | null };

const C = {
  purple: "#8338ec",
  purpleSoft: "rgba(131,56,236,0.07)",
  purpleBorder: "rgba(131,56,236,0.18)",
  navy: "#1a3a8f",
  red: "#e63946",
  teal: "#1abfb0",
  bg: "#f8f9fc",
  white: "#ffffff",
  border: "#e8edf5",
  text: "#0d1b3e",
  muted: "#64748b",
  hint: "#94a3b8",
  faint: "#cbd5e1",
  green: "#22c55e",
} as const;

const fHe = "var(--font-he,'Heebo',sans-serif)";
const fEn = "var(--font-dm,'DM Sans',sans-serif)";
const fSyne = "var(--font-syne,'Syne',sans-serif)";
function fBody(isHe: boolean) { return isHe ? fHe : fEn; }

function formatDate(d: string, isHe: boolean) {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString(isHe ? "he-IL" : "en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isActiveListing(l: ConcertListing) {
  return l.status === "active" && !l.archived_at && (!l.expires_at || new Date(l.expires_at) > new Date());
}

function phoneForWa(phone?: string | null) {
  if (!phone) return "";
  let p = phone.replace(/[^0-9+]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("0")) p = `972${p.slice(1)}`;
  return p;
}

function ListingCard({ listing, isHe, concertTitle }: { listing: EnrichedListing; isHe: boolean; concertTitle: string }) {
  const isSell = listing.type === "sell";
  const phone = phoneForWa(listing.profile?.phone);
  const message = encodeURIComponent(
    isHe
      ? `היי, ראיתי את המודעה שלך ב-Stayin לגבי ${concertTitle}. זה עדיין רלוונטי?`
      : `Hi, I saw your listing on Stayin for ${concertTitle}. Is it still available?`
  );
  const wa = phone ? `https://wa.me/${phone}?text=${message}` : "";

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden" }}>
      <div style={{ height: "2px", background: isSell ? C.purple : C.teal }} />
      <div style={{ padding: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
          <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: isSell ? C.purple : C.teal, background: isSell ? C.purpleSoft : "rgba(26,191,176,0.08)", padding: "4px 9px", borderRadius: "3px" }}>
            {isSell ? (isHe ? "מכירה" : "Sell") : (isHe ? "קנייה" : "Buy")}
          </span>
          <span style={{ fontSize: "11px", color: C.hint }}>
            {listing.created_at ? formatDate(listing.created_at, isHe) : ""}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "5px", padding: "10px" }}>
            <div style={{ fontSize: "10px", color: C.hint, fontWeight: 700 }}>{isHe ? "כמות" : "Quantity"}</div>
            <div style={{ fontFamily: fSyne, fontSize: "20px", fontWeight: 800, color: C.text }}>{listing.quantity}</div>
          </div>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "5px", padding: "10px" }}>
            <div style={{ fontSize: "10px", color: C.hint, fontWeight: 700 }}>{isHe ? "מחיר לכרטיס" : "Price / ticket"}</div>
            <div style={{ fontFamily: fSyne, fontSize: "20px", fontWeight: 800, color: C.navy }}>₪{Number(listing.price).toLocaleString()}</div>
          </div>
        </div>

        {listing.notes && (
          <p style={{ fontSize: "13px", lineHeight: 1.65, color: C.muted, marginBottom: "14px", whiteSpace: "pre-wrap" }}>
            {listing.notes}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", paddingTop: "12px", borderTop: `1px solid ${C.border}` }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: C.text }}>
              {listing.profile?.full_name || (isHe ? "משתמש Stayin" : "Stayin user")}
            </div>
            <div style={{ fontSize: "11px", color: C.hint }}>
              {[listing.profile?.city, listing.profile?.country].filter(Boolean).join(" · ") || (isHe ? "פנייה ישירה" : "Direct contact")}
            </div>
          </div>

          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, background: C.green, color: "#fff", padding: "9px 13px", borderRadius: "4px", textDecoration: "none", fontSize: "12px", fontWeight: 800 }}>
              WhatsApp
            </a>
          ) : (
            <span style={{ flexShrink: 0, color: C.hint, fontSize: "11px", fontWeight: 700 }}>
              {isHe ? "אין טלפון" : "No phone"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LiveShowDetailsPage() {
  const params = useParams();
  const concertId = String(params?.id || "");
  const { lang } = useLanguage();
  const isHe = lang === "he";

  const [concert, setConcert] = useState<Concert | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [listings, setListings] = useState<EnrichedListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!concertId) return;
    load();
  }, [concertId]);

  async function load() {
    setLoading(true);

    const { data: concertData } = await supabase
      .from("concerts")
      .select("id,artist_id,venue_id,concert_date,concert_time,status")
      .eq("id", concertId)
      .maybeSingle();

    setConcert((concertData || null) as Concert | null);

    if (concertData?.artist_id) {
      const { data } = await supabase.from("artists").select("id,name,name_he,image_url").eq("id", concertData.artist_id).maybeSingle();
      setArtist((data || null) as Artist | null);
    }

    if (concertData?.venue_id) {
      const { data } = await supabase.from("venues").select("id,name,city,city_he").eq("id", concertData.venue_id).maybeSingle();
      setVenue((data || null) as Venue | null);
    }

    const { data: listingData } = await supabase
      .from("concert_listings")
      .select("id,user_id,concert_id,type,price,quantity,notes,status,expires_at,archived_at,created_at")
      .eq("concert_id", concertId)
      .eq("status", "active")
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    const activeListings = ((listingData || []) as ConcertListing[]).filter(isActiveListing);
    const userIds = Array.from(new Set(activeListings.map(l => l.user_id).filter(Boolean))) as string[];
    let profilesById: Record<string, Profile> = {};

    if (userIds.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id,full_name,phone,country,city")
        .in("id", userIds);
      profilesById = Object.fromEntries(((profiles || []) as Profile[]).map(p => [p.id, p]));
    }

    setListings(activeListings.map(l => ({ ...l, profile: l.user_id ? profilesById[l.user_id] || null : null })));
    setLoading(false);
  }

  const title = isHe ? (artist?.name_he || artist?.name || "הופעה") : (artist?.name || "Live show");
  const sellListings = useMemo(() => listings.filter(l => l.type === "sell"), [listings]);
  const buyListings = useMemo(() => listings.filter(l => l.type === "buy"), [listings]);
  const prices = sellListings.map(l => Number(l.price)).filter(Boolean);
  const priceRange = prices.length ? (Math.min(...prices) === Math.max(...prices) ? `₪${Math.min(...prices).toLocaleString()}` : `₪${Math.min(...prices).toLocaleString()}–₪${Math.max(...prices).toLocaleString()}`) : null;

  const W: React.CSSProperties = { maxWidth: "1100px", margin: "0 auto", padding: "0 16px" };
  const smallCaps: React.CSSProperties = { fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.hint };

  return (
    <main style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: fBody(isHe) }}>
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.purple} 33.3%,${C.red} 33.3% 66.6%,${C.teal} 66.6%)` }} />

      <section style={{ background: "linear-gradient(135deg,#f3eeff 0%,#fff0f8 50%,#edfff8 100%)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ ...W, paddingTop: "38px", paddingBottom: "34px" }}>
          <Link href="/live-shows" style={{ color: C.purple, textDecoration: "none", fontSize: "12px", fontWeight: 800 }}>
            {isHe ? "← חזרה להופעות" : "← Back to live shows"}
          </Link>

          <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr auto", gap: "24px", alignItems: "end" }}>
            <div>
              <div style={{ ...smallCaps, marginBottom: "12px" }}>{isHe ? "הופעה חיה" : "Live Show"}</div>
              <h1 style={{ fontFamily: isHe ? fHe : fSyne, fontSize: "clamp(34px,5vw,62px)", lineHeight: 1, margin: 0, fontWeight: isHe ? 900 : 800, color: C.text }}>
                {loading ? (isHe ? "טוען הופעה..." : "Loading show...") : title}
              </h1>
              <p style={{ marginTop: "14px", color: C.muted, fontSize: "15px", lineHeight: 1.8 }}>
                {venue?.name || ""}{venue ? " · " : ""}{isHe ? venue?.city_he : venue?.city}
                {concert ? <><br />{formatDate(concert.concert_date, isHe)}{concert.concert_time ? ` · ${concert.concert_time.slice(0, 5)}` : ""}</> : null}
              </p>
            </div>

            <Link href={`/post-listing?type=concert&concertId=${concertId}`} style={{ padding: "12px 20px", background: C.purple, color: "#fff", borderRadius: "4px", textDecoration: "none", fontSize: "13px", fontWeight: 800, whiteSpace: "nowrap" }}>
              {isHe ? "+ פרסם מודעה" : "+ Post listing"}
            </Link>
          </div>
        </div>
      </section>

      <section style={{ ...W, paddingTop: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: C.border, border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden", marginBottom: "22px" }}>
          {[
            { v: sellListings.length, l: isHe ? "מודעות מכירה" : "Sell listings", c: C.purple },
            { v: buyListings.length, l: isHe ? "מודעות קנייה" : "Buy listings", c: C.teal },
            { v: priceRange || "—", l: isHe ? "טווח מחירים" : "Price range", c: C.navy },
          ].map((s) => (
            <div key={s.l} style={{ background: C.white, padding: "18px 14px", textAlign: "center" }}>
              <div style={{ fontFamily: fSyne, fontSize: "22px", fontWeight: 800, color: s.c }}>{s.v}</div>
              <div style={{ ...smallCaps, marginTop: "4px" }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px", paddingBottom: "52px" }}>
          {loading ? (
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "28px", color: C.hint, textAlign: "center" }}>
              {isHe ? "טוען מודעות..." : "Loading listings..."}
            </div>
          ) : listings.length === 0 ? (
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "52px 22px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>🎵</div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: C.text, marginBottom: "6px" }}>{isHe ? "אין עדיין מודעות להופעה הזאת" : "No listings for this show yet"}</div>
              <div style={{ fontSize: "13px", color: C.hint, marginBottom: "18px" }}>{isHe ? "אפשר להיות הראשון שמפרסם מודעה." : "You can be the first to post one."}</div>
              <Link href={`/post-listing?type=concert&concertId=${concertId}`} style={{ display: "inline-block", padding: "10px 16px", background: C.purple, color: "#fff", borderRadius: "4px", textDecoration: "none", fontSize: "12px", fontWeight: 800 }}>
                {isHe ? "+ פרסם מודעה" : "+ Post listing"}
              </Link>
            </div>
          ) : (
            listings.map(l => <ListingCard key={l.id} listing={l} isHe={isHe} concertTitle={title} />)
          )}
        </div>
      </section>
    </main>
  );
}
