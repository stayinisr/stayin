"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../lib/LanguageContext";

const C = {
  text:   "#0d1b3e",
  navy:   "#1a3a8f",
  red:    "#e63946",
  green:  "#006847",
  teal:   "#1abfb0",
  muted:  "#64748b",
  hint:   "#94a3b8",
  border: "#e8edf5",
  bg:     "#f8f9fc",
  white:  "#ffffff",
};
const W = { maxWidth: "1000px", margin: "0 auto", padding: "0 16px", width: "100%", boxSizing: "border-box" as const };

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
  venues: { name: string; city: string | null; city_he: string | null } | null;
  created_at: string;
};

type Artist = { id: string; name: string; name_he: string | null };

function formatDate(d: string | null) {
  if (!d) return null;
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`;
}
function formatTime(t: string | null) { return t ? t.slice(0,5) : null; }

function ttLabel(type: string | null, custom: string | null, isHe: boolean) {
  if (!type) return null;
  const m: Record<string,[string,string]> = { standing:["עמידה","Standing"], seated:["ישיבה","Seated"], vip:["VIP","VIP"], gallery:["גלריה","Gallery"], other:[custom||"אחר",custom||"Other"] };
  return isHe ? m[type]?.[0] : m[type]?.[1];
}

export default function ArtistShowPage() {
  const params = useParams();
  const artistId = params?.artistId as string;
  const { lang } = useLanguage();
  const isHe = lang === "he";
  const fBody = isHe ? "var(--font-he,'Heebo',sans-serif)" : "var(--font-dm,'DM Sans',sans-serif)";
  const fHe   = "var(--font-he,'Heebo',sans-serif)";
  const fSyne = "var(--font-syne,'Syne',sans-serif)";

  const [artist,   setArtist]   = useState<Artist | null>(null);
  const [listings, setListings] = useState<ShowListing[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<"all"|"sell"|"buy">("all");

  useEffect(() => {
    if (!artistId) return;
    async function load() {
      const [{ data: a }, { data: l }] = await Promise.all([
        supabase.from("artists").select("id,name,name_he").eq("id", artistId).maybeSingle(),
        supabase.from("show_listings")
          .select("id,type,price,quantity,ticket_type,ticket_type_custom,seats_row,seats_numbers,seated_together,notes,show_date,show_time,created_at,venues(name,city,city_he)")
          .eq("artist_id", artistId).eq("status","active").gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false }),
      ]);
      setArtist(a || null);
      setListings((l as unknown as ShowListing[]) || []);
      setLoading(false);
    }
    load();
  }, [artistId]);

  const filtered = useMemo(() => filter === "all" ? listings : listings.filter(l => l.type === filter), [listings, filter]);
  const sellCount = listings.filter(l => l.type === "sell").length;
  const buyCount  = listings.filter(l => l.type === "buy").length;
  const artistName = artist ? (isHe ? (artist.name_he || artist.name) : artist.name) : "";

  const smallCaps = { fontSize:"10px", fontWeight:600, letterSpacing:".12em", textTransform:"uppercase" as const, color:C.hint } as React.CSSProperties;

  return (
    <main style={{ background:C.bg, minHeight:"100vh", color:C.text, fontFamily:fBody }}>
      <style>{`
        @keyframes shi{from{background-position:-600px 0}to{background-position:600px 0}}
        .sk{background:linear-gradient(90deg,#f0f4f8 25%,#e8edf5 50%,#f0f4f8 75%);background-size:800px 100%;animation:shi 1.4s infinite linear;border-radius:4px;}
        .listing-card:hover{box-shadow:0 4px 20px rgba(13,27,62,.10)!important}
        .listing-card{transition:box-shadow 150ms}
      `}</style>

      {/* Top stripe */}
      <div style={{ height:3, background:`linear-gradient(90deg,${C.navy},${C.teal})` }} />

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#eef4ff 0%,#fdf0f2 50%,#edfff8 100%)", borderBottom:`1px solid ${C.border}`, position:"relative", overflow:"hidden" }}>
        {[
          { w:380, t:-100, r:-60, c:"rgba(26,191,176,.07)" },
          { w:260, b:-80,  l:-40, c:"rgba(26,58,143,.05)"  },
        ].map((b,i) => (
          <div key={i} style={{ position:"absolute", width:b.w, height:b.w, borderRadius:"50%", background:`radial-gradient(circle,${b.c},transparent 70%)`, top:(b as any).t, bottom:(b as any).b, left:(b as any).l, right:(b as any).r, pointerEvents:"none" }} />
        ))}

        <div style={{ ...W, paddingTop:36, paddingBottom:32 }}>
          <Link href="/live-shows" style={{ display:"inline-flex", alignItems:"center", gap:5, ...smallCaps, textDecoration:"none", marginBottom:16, color:C.hint }}>
            ← {isHe?"כל האמנים":"All artists"}
          </Link>

          <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <div style={{ width:56, height:56, borderRadius:14, background:`linear-gradient(135deg,${C.navy},${C.teal})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>🎵</div>
            <div>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:".24em", textTransform:"uppercase", color:C.teal, marginBottom:8 }}>LIVE SHOWS</div>
              <h1 style={{ fontFamily: isHe ? fHe : fSyne, fontSize:"clamp(22px,3.5vw,36px)", fontWeight:isHe?900:800, color:C.text, letterSpacing:isHe?"-.5px":".02em", margin:0 }}>
                {artistName || <span className="sk" style={{ display:"inline-block", width:200, height:32 }} />}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div style={{ borderBottom:`1px solid ${C.border}`, background:C.white }}>
        <div style={{ ...W, paddingTop:12, paddingBottom:12, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          {(["all","sell","buy"] as const).map(f => {
            const count = f==="all" ? listings.length : f==="sell" ? sellCount : buyCount;
            const label = f==="all" ? (isHe?"הכל":"All") : f==="sell" ? (isHe?"מוכרים":"Selling") : (isHe?"מחפשים":"Buying");
            const active = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{ padding:"5px 14px", fontSize:10, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", border:`1px solid ${active ? C.teal : C.border}`, color:active ? C.teal : C.hint, background:active ? "rgba(26,191,176,.06)" : C.white, cursor:"pointer", borderRadius:3, transition:"all 150ms", fontFamily:"var(--font-dm),sans-serif" }}>
                {label} {count > 0 && `(${count})`}
              </button>
            );
          })}

          <div style={{ marginRight:"auto" }}>
            <Link href={`/post-listing?tab=show`} style={{ display:"inline-flex", padding:"6px 14px", background:C.navy, color:"#fff", borderRadius:4, fontSize:11, fontWeight:700, textDecoration:"none", letterSpacing:".04em" }}>
              + {isHe?"פרסם מודעה":"Post listing"}
            </Link>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div style={{ ...W, paddingTop:24, paddingBottom:48 }}>
        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {Array.from({length:3}).map((_,i) => (
              <div key={i} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:18, display:"flex", flexDirection:"column", gap:10 }}>
                <div className="sk" style={{ height:14, width:"50%" }} />
                <div className="sk" style={{ height:10, width:"35%" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"72px 0" }}>
            <div style={{ fontSize:42, marginBottom:14 }}>🎵</div>
            <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:8 }}>{isHe?"אין מודעות עדיין":"No listings yet"}</div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:24 }}>{isHe?"היה הראשון לפרסם!":"Be the first to post!"}</div>
            <Link href="/post-listing?tab=show" style={{ display:"inline-flex", padding:"10px 20px", background:C.teal, color:"#fff", borderRadius:6, fontSize:13, fontWeight:700, textDecoration:"none" }}>
              {isHe?"פרסם מודעה":"Post listing"}
            </Link>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filtered.map(l => {
              const isSell = l.type === "sell";
              const venue = l.venues as any;
              const venueName = venue?.name || null;
              const venueCity = isHe ? venue?.city_he || venue?.city : venue?.city;
              const date = formatDate(l.show_date);
              const time = formatTime(l.show_time);
              const tt   = ttLabel(l.ticket_type, l.ticket_type_custom, isHe);
              return (
                <div key={l.id} className="listing-card" style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, overflow:"hidden", boxShadow:"0 1px 3px rgba(13,27,62,.04)" }}>
                  <div style={{ height:3, background: isSell ? `linear-gradient(90deg,${C.green},${C.teal})` : `linear-gradient(90deg,${C.navy},#6366f1)` }} />
                  <div style={{ padding:"16px 18px" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>

                      {/* Left */}
                      <div style={{ flex:1, minWidth:180 }}>
                        {/* Badges */}
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
                          <span style={{ fontSize:9, fontWeight:800, padding:"3px 8px", borderRadius:2, background:isSell?"rgba(0,104,71,.07)":"rgba(26,58,143,.07)", color:isSell?C.green:C.navy, border:`1px solid ${isSell?"rgba(0,104,71,.2)":"rgba(26,58,143,.18)"}`, letterSpacing:".06em", textTransform:"uppercase" }}>
                            {isSell ? (isHe?"מכירה":"Sell") : (isHe?"קנייה":"Buy")}
                          </span>
                          {tt && <span style={{ fontSize:9, fontWeight:600, padding:"3px 8px", borderRadius:2, background:C.bg, color:C.muted, border:`1px solid ${C.border}`, letterSpacing:".04em" }}>{tt}</span>}
                        </div>

                        {/* Venue + date */}
                        {(venueName || date) && (
                          <div style={{ fontSize:12, color:C.muted, marginBottom:8, fontWeight:500 }}>
                            {venueName && <span>📍 {venueName}{venueCity?` · ${venueCity}`:""}</span>}
                            {date && <span>{venueName?" · ":""}{date}{time?` · ${time}`:""}</span>}
                          </div>
                        )}

                        {/* Seat details */}
                        {(l.seats_row || l.seats_numbers || l.seated_together === "yes") && (
                          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:8 }}>
                            {l.seats_row && <span style={{ fontSize:10, padding:"2px 7px", background:C.bg, borderRadius:3, color:C.muted, fontWeight:600, border:`1px solid ${C.border}` }}>{isHe?"שורה":"Row"} {l.seats_row}</span>}
                            {l.seats_numbers && <span style={{ fontSize:10, padding:"2px 7px", background:C.bg, borderRadius:3, color:C.muted, fontWeight:600, border:`1px solid ${C.border}` }}>{l.seats_numbers}</span>}
                            {l.seated_together==="yes" && <span style={{ fontSize:10, padding:"2px 7px", background:"rgba(0,104,71,.06)", borderRadius:3, color:C.green, fontWeight:700, border:"1px solid rgba(0,104,71,.15)" }}>✓ {isHe?"יחד":"Together"}</span>}
                          </div>
                        )}

                        {l.notes && (
                          <div style={{ fontSize:12, color:C.hint, fontStyle:"italic", borderRight:`2px solid ${C.teal}`, paddingRight:10, lineHeight:1.5 }}>
                            "{l.notes}"
                          </div>
                        )}
                      </div>

                      {/* Right */}
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, flexShrink:0 }}>
                        {l.price ? (
                          <div>
                            <div style={{ fontSize:24, fontWeight:900, color:C.text, letterSpacing:"-.5px", lineHeight:1 }}>
                              ₪{l.price.toLocaleString()}
                            </div>
                            <div style={{ fontSize:10, color:C.hint, marginTop:3, textAlign:"left" }}>
                              × {l.quantity||1} {isHe?"כרטיסים":"tickets"}
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize:13, color:C.hint }}>{isHe?"מחיר גמיש":"Flexible"}</div>
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
