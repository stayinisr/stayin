"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../lib/LanguageContext";

const C = {
  text: "#0d1b3e", navy: "#1a3a8f", teal: "#1abfb0", red: "#e63946",
  green: "#006847", muted: "#64748b", hint: "#94a3b8", border: "#e8edf5",
};

type ShowListing = {
  id: string;
  type: "sell" | "buy";
  price: number | null;
  quantity: number | null;
  ticket_type: string | null;
  ticket_type_custom: string | null;
  seats_row: string | null;
  seats_numbers: string | null;
  seated_together: string | null;
  notes: string | null;
  show_date: string | null;
  show_time: string | null;
  city: string | null;
  venues: { name: string; city: string | null; city_he: string | null } | null;
  profiles: { full_name: string | null; country: string | null } | null;
  created_at: string;
};

type Artist = { id: string; name: string; name_he: string | null };

function formatDate(d: string | null) {
  if (!d) return null;
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}/${date.getFullYear()}`;
}

function formatTime(t: string | null) {
  if (!t) return null;
  return t.slice(0,5);
}

function ticketTypeLabel(type: string | null, custom: string | null, isHe: boolean) {
  if (!type) return null;
  const map: Record<string, [string,string]> = {
    standing: ["עמידה","Standing"],
    seated:   ["ישיבה","Seated"],
    vip:      ["VIP","VIP"],
    gallery:  ["גלריה","Gallery"],
    other:    [custom || "אחר", custom || "Other"],
  };
  return isHe ? map[type]?.[0] : map[type]?.[1];
}

export default function ArtistShowPage() {
  const params = useParams();
  const artistId = params?.artistId as string;
  const { lang } = useLanguage();
  const isHe = lang === "he";
  const fBody = isHe ? "var(--font-he,'Heebo',sans-serif)" : "var(--font-dm,'DM Sans',sans-serif)";
  const fSyne = "var(--font-syne,'Syne',sans-serif)";

  const [artist, setArtist] = useState<Artist | null>(null);
  const [listings, setListings] = useState<ShowListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all"|"sell"|"buy">("all");

  useEffect(() => {
    if (!artistId) return;
    async function load() {
      const [{ data: artistData }, { data: listingsData }] = await Promise.all([
        supabase.from("artists").select("id,name,name_he").eq("id", artistId).maybeSingle(),
        supabase
          .from("show_listings")
          .select("id,type,price,quantity,ticket_type,ticket_type_custom,seats_row,seats_numbers,seated_together,notes,show_date,show_time,city,created_at,venues(name,city,city_he),profiles(full_name,country)")
          .eq("artist_id", artistId)
          .eq("status", "active")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false }),
      ]);
      setArtist(artistData || null);
      setListings((listingsData as unknown as ShowListing[]) || []);
      setLoading(false);
    }
    load();
  }, [artistId]);

  const filtered = listings.filter(l => filter === "all" || l.type === filter);
  const sellCount = listings.filter(l => l.type === "sell").length;
  const buyCount  = listings.filter(l => l.type === "buy").length;

  const artistName = artist ? (isHe ? (artist.name_he || artist.name) : artist.name) : "";

  return (
    <main style={{ minHeight: "100vh", fontFamily: fBody }}>
      <div style={{ height: 3, background: `linear-gradient(90deg,${C.navy},${C.teal})` }} />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#eef2ff 0%,#fdf0f2 52%,#edfff8 100%)", padding: "40px 16px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 400, height: 400, top: -150, right: -80, borderRadius: "50%", background: "radial-gradient(circle,rgba(26,191,176,.08),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Link href="/live-shows" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: C.hint, textDecoration: "none", marginBottom: 16, letterSpacing: ".06em", textTransform: "uppercase" }}>
            ← {isHe ? "כל האמנים" : "All artists"}
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg,${C.navy},${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>
              🎵
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: C.teal, marginBottom: 6 }}>LIVE SHOWS</div>
              <h1 style={{ fontFamily: fSyne, fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 800, color: C.text, letterSpacing: "-.4px", margin: 0 }}>
                {artistName}
              </h1>
            </div>
          </div>

          {/* Stats + filters */}
          <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap", alignItems: "center" }}>
            {(["all","sell","buy"] as const).map(f => {
              const labels: Record<string, string> = {
                all:  isHe ? `הכל (${listings.length})` : `All (${listings.length})`,
                sell: isHe ? `מוכרים (${sellCount})` : `Selling (${sellCount})`,
                buy:  isHe ? `מחפשים (${buyCount})` : `Buying (${buyCount})`,
              };
              return (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700, border: `1px solid ${filter === f ? C.teal : C.border}`, background: filter === f ? C.teal : "#fff", color: filter === f ? "#fff" : C.hint, cursor: "pointer", transition: "all 150ms" }}>
                  {labels[f]}
                </button>
              );
            })}
            <div style={{ marginRight: "auto" }}>
              <Link href={`/post-listing?tab=show&artist=${artistId}`} style={{ padding: "8px 16px", background: C.navy, color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                + {isHe ? "פרסם מודעה" : "Post listing"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: C.hint }}>
            {isHe ? "טוען..." : "Loading..."}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              {isHe ? "אין מודעות עדיין" : "No listings yet"}
            </div>
            <Link href={`/post-listing?tab=show&artist=${artistId}`} style={{ padding: "10px 20px", background: C.teal, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              {isHe ? "פרסם ראשון!" : "Post first!"}
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(l => {
              const isSell = l.type === "sell";
              const venue = l.venues;
              const venueName = venue?.name || null;
              const venueCity = isHe ? venue?.city_he || venue?.city : venue?.city;
              const date = formatDate(l.show_date);
              const time = formatTime(l.show_time);
              const ttLabel = ticketTypeLabel(l.ticket_type, l.ticket_type_custom, isHe);

              return (
                <div key={l.id} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(13,27,62,.04)" }}>
                  {/* Top accent */}
                  <div style={{ height: 3, background: isSell ? `linear-gradient(90deg,${C.green},${C.teal})` : `linear-gradient(90deg,${C.navy},#6366f1)` }} />

                  <div style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>

                      {/* Left: venue + date */}
                      <div style={{ flex: 1, minWidth: 200 }}>
                        {/* Type badge */}
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: isSell ? "rgba(0,104,71,.08)" : "rgba(26,58,143,.08)", color: isSell ? C.green : C.navy, border: `1px solid ${isSell ? "rgba(0,104,71,.2)" : "rgba(26,58,143,.18)"}`, letterSpacing: ".05em" }}>
                            {isSell ? (isHe ? "מכירה" : "Sell") : (isHe ? "קנייה" : "Buy")}
                          </span>
                          {ttLabel && (
                            <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "#f1f5f9", color: C.muted, border: `1px solid ${C.border}` }}>
                              {ttLabel}
                            </span>
                          )}
                        </div>

                        {/* Venue + date */}
                        {(venueName || date) && (
                          <div style={{ fontSize: 13, color: C.muted, marginBottom: 10, fontWeight: 500 }}>
                            {venueName && <span>📍 {venueName}{venueCity ? ` · ${venueCity}` : ""}</span>}
                            {date && <span>{venueName ? " · " : ""}{date}{time ? ` · ${time}` : ""}</span>}
                          </div>
                        )}

                        {/* Seat details */}
                        {(l.seats_row || l.seats_numbers || l.seated_together === "yes") && (
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                            {l.seats_row && <span style={{ fontSize: 10, padding: "2px 8px", background: "#f1f5f9", borderRadius: 4, color: C.muted, fontWeight: 600 }}>{isHe ? "שורה" : "Row"} {l.seats_row}</span>}
                            {l.seats_numbers && <span style={{ fontSize: 10, padding: "2px 8px", background: "#f1f5f9", borderRadius: 4, color: C.muted, fontWeight: 600 }}>{l.seats_numbers}</span>}
                            {l.seated_together === "yes" && <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(34,197,94,.08)", borderRadius: 4, color: "#15803d", fontWeight: 700 }}>✓ {isHe ? "יחד" : "Together"}</span>}
                          </div>
                        )}

                        {l.notes && (
                          <div style={{ fontSize: 12, color: C.hint, fontStyle: "italic", borderRight: `2px solid ${C.teal}`, paddingRight: 10, lineHeight: 1.5 }}>
                            "{l.notes}"
                          </div>
                        )}
                      </div>

                      {/* Right: price + qty + contact */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                        {l.price ? (
                          <div>
                            <div style={{ fontSize: 26, fontWeight: 900, color: C.text, letterSpacing: "-.5px", lineHeight: 1 }}>
                              ₪{l.price.toLocaleString()}
                            </div>
                            <div style={{ fontSize: 10, color: C.hint, marginTop: 3, textAlign: "left" }}>
                              × {l.quantity || 1} {isHe ? "כרטיסים" : "tickets"}
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: 14, color: C.hint }}>
                            {isHe ? "מחיר גמיש" : "Flexible price"}
                          </div>
                        )}

                        {/* Seller info */}
                        {l.profiles?.full_name && (
                          <div style={{ fontSize: 11, color: C.hint, display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 22, height: 22, borderRadius: "50%", background: C.navy, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                              {l.profiles.full_name[0]}
                            </span>
                            {l.profiles.full_name}
                            {l.profiles.country && ` · ${l.profiles.country}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
