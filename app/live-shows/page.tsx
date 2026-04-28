"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../lib/LanguageContext";

// ── Design tokens (same as rest of site) ────────────────────────────────────
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

type Artist = {
  id: string;
  name: string;
  name_he: string | null;
  sell_count: number;
  buy_count: number;
};

export default function LiveShowsPage() {
  const { lang } = useLanguage();
  const isHe = lang === "he";
  const fHe   = "var(--font-he,'Heebo',sans-serif)";
  const fSyne = "var(--font-syne,'Syne',sans-serif)";
  const fBody = isHe ? fHe : "var(--font-dm,'DM Sans',sans-serif)";

  const [artists,  setArtists]  = useState<Artist[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<"all"|"sell"|"buy">("all");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("show_listings")
        .select("artist_id, type, artists(id, name, name_he)")
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString());

      if (!data) { setLoading(false); return; }

      const map = new Map<string, Artist>();
      for (const row of data) {
        const a = row.artists as any;
        if (!a) continue;
        if (!map.has(a.id)) map.set(a.id, { id: a.id, name: a.name, name_he: a.name_he, sell_count: 0, buy_count: 0 });
        const e = map.get(a.id)!;
        if (row.type === "sell") e.sell_count++; else e.buy_count++;
      }

      setArtists(Array.from(map.values()).sort((a, b) =>
        (isHe ? (a.name_he || a.name) : a.name).localeCompare(isHe ? (b.name_he || b.name) : b.name, isHe ? "he" : "en")
      ));
      setLoading(false);
    }
    load();
  }, [isHe]);

  const filtered = useMemo(() => {
    return artists.filter(a => {
      const q = search.toLowerCase();
      if (q && !a.name.toLowerCase().includes(q) && !(a.name_he || "").includes(q)) return false;
      if (filter === "sell" && a.sell_count === 0) return false;
      if (filter === "buy"  && a.buy_count  === 0) return false;
      return true;
    });
  }, [artists, search, filter]);

  const smallCaps = { fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: C.hint } as React.CSSProperties;

  return (
    <main style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: fBody }}>
      <style>{`
        @keyframes shi{from{background-position:-600px 0}to{background-position:600px 0}}
        .sk{background:linear-gradient(90deg,#f0f4f8 25%,#e8edf5 50%,#f0f4f8 75%);background-size:800px 100%;animation:shi 1.4s infinite linear;border-radius:4px;}
        .artist-card:hover{box-shadow:0 4px 20px rgba(13,27,62,.10)!important;transform:translateY(-1px)}
        .artist-card{transition:box-shadow 150ms,transform 150ms}
      `}</style>

      {/* Top stripe */}
      <div style={{ height: 3, background: "linear-gradient(90deg,#7c3aed,#e63946)" }} />

      {/* Hero — same pattern as WC page */}
      <div style={{ background: "linear-gradient(135deg,#eef4ff 0%,#fdf0f2 50%,#edfff8 100%)", borderBottom: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
        {[
          { w:380, t:-100, r:-60,  c:"rgba(26,191,176,.07)"  },
          { w:300, b:-80,  l:-40,  c:"rgba(26,58,143,.05)"   },
          { w:240, t:30,   r:"28%",c:"rgba(0,104,71,.04)"    },
        ].map((b,i) => (
          <div key={i} style={{ position:"absolute", width:b.w, height:b.w, borderRadius:"50%", background:`radial-gradient(circle,${b.c},transparent 70%)`, top:(b as any).t, bottom:(b as any).b, left:(b as any).l, right:(b as any).r, pointerEvents:"none" }} />
        ))}

        <div style={{ ...W, paddingTop: 44, paddingBottom: 40 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:22, ...smallCaps }}>
            <span style={{ display:"flex", gap:4 }}>
              {["#7c3aed","#e63946","#7c3aed"].map((c,i) => <span key={i} style={{ width:6, height:6, borderRadius:"50%", background:c, display:"inline-block" }} />)}
            </span>
            {isHe ? "הופעות חיות · מרקטפלייס כרטיסים" : "Live Shows · Ticket Marketplace"}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:32, alignItems:"center" }}>
            <div>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:".24em", textTransform:"uppercase", background:"linear-gradient(135deg,#7c3aed,#e63946)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", marginBottom:16 }}>
                STAY IN THE SHOW
              </div>
              <h1 style={{ fontFamily: isHe ? fHe : fSyne, fontSize:"clamp(36px,5vw,60px)", fontWeight:900, lineHeight:.95, letterSpacing:"-.5px", marginBottom:16,
                background:"linear-gradient(135deg,#7c3aed 0%,#c026d3 40%,#e63946 100%)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                {isHe ? <>כרטיסים<br />להופעות.</> : <>Live<br />Shows.</>}
              </h1>
              <p style={{ fontSize:14, fontWeight:400, color:C.muted, lineHeight:1.8, maxWidth:400, marginBottom:24 }}>
                {isHe ? "כרטיסים להופעות בין אנשים, בלי עמלה. מצא כרטיס לאמן האהוב עליך." : "Tickets to live shows between people, no fees. Find tickets to your favorite artist."}
              </p>
              <Link href="/post-listing?tab=show" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 22px", background:"linear-gradient(135deg,#7c3aed,#e63946)", color:"#fff", borderRadius:6, fontSize:13, fontWeight:700, textDecoration:"none", letterSpacing:".03em" }}>
                🎵 {isHe ? "פרסם מודעה להופעה" : "Post show listing"}
              </Link>
            </div>
            <div style={{ fontSize:80, lineHeight:1, opacity:.15, userSelect:"none" }}>🎵</div>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div style={{ borderBottom:`1px solid ${C.border}`, background:C.white }}>
        <div style={{ ...W, paddingTop:14, paddingBottom:14, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          {/* Search */}
          <div style={{ position:"relative", flexShrink:0 }}>
            <span style={{ position:"absolute", right:isHe?10:undefined, left:isHe?undefined:10, top:"50%", transform:"translateY(-50%)", color:C.hint, fontSize:13 }}>🔍</span>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isHe ? "חפש אמן..." : "Search artist..."}
              style={{ padding: isHe?"8px 32px 8px 12px":"8px 12px 8px 32px", borderRadius:4, border:`1px solid ${C.border}`, fontSize:12, color:C.text, outline:"none", background:C.white, width:200, fontFamily:fBody }}
            />
          </div>

          {/* Type filter */}
          {(["all","sell","buy"] as const).map(f => {
            const label = f === "all" ? (isHe?"הכל":"All") : f === "sell" ? (isHe?"מוכרים":"Selling") : (isHe?"מחפשים":"Buying");
            const active = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{ padding:"5px 14px", fontSize:10, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", border:`1px solid ${active ? "#7c3aed" : C.border}`, color:active ? "#7c3aed" : C.hint, background:active ? "rgba(124,58,237,.06)" : C.white, cursor:"pointer", borderRadius:3, transition:"all 150ms", fontFamily:"var(--font-dm),sans-serif" }}>
                {label}
              </button>
            );
          })}

          <div style={{ marginRight:"auto", fontSize:12, color:C.hint }}>
            {!loading && `${filtered.length} ${isHe?"אמנים":"artists"}`}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ ...W, paddingTop:28, paddingBottom:48 }}>
        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
            {Array.from({length:8}).map((_,i) => (
              <div key={i} style={{ height:76, borderRadius:8, border:`1px solid ${C.border}`, background:C.white, display:"flex", alignItems:"center", gap:14, padding:"0 16px" }}>
                <div className="sk" style={{ width:40, height:40, borderRadius:10 }} />
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
                  <div className="sk" style={{ height:14, width:"60%" }} />
                  <div className="sk" style={{ height:10, width:"40%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎵</div>
            <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:8 }}>
              {search ? (isHe?"לא נמצאו תוצאות":"No results") : (isHe?"אין מודעות עדיין":"No listings yet")}
            </div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:24 }}>
              {isHe?"היה הראשון לפרסם מודעה להופעה!":"Be the first to post a show listing!"}
            </div>
            <Link href="/post-listing?tab=show" style={{ display:"inline-flex", padding:"10px 20px", background:C.teal, color:"#fff", borderRadius:6, fontSize:13, fontWeight:700, textDecoration:"none" }}>
              {isHe?"פרסם מודעה":"Post listing"}
            </Link>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
            {filtered.map((artist, idx) => {
              const name = isHe ? (artist.name_he || artist.name) : artist.name;
              const grads = [
                "linear-gradient(135deg,#7c3aed,#e63946)",
                "linear-gradient(135deg,#e63946,#4f46e5)",
                "linear-gradient(135deg,#4f46e5,#7c3aed)",
                "linear-gradient(135deg,#7c3aed,#1abfb0)",
                "linear-gradient(135deg,#d4a017,#e63946)",
              ];
              const grad = grads[idx % grads.length];
              return (
                <Link key={artist.id} href={`/live-shows/${artist.id}`} style={{ textDecoration:"none" }}>
                  <div className="artist-card" style={{ borderRadius:16, overflow:"hidden", background:"#fff", boxShadow:"0 4px 20px rgba(13,27,62,.10)" }}>
                    {/* Body — vinyl + name side by side */}
                    <div style={{ padding:"20px 18px", display:"flex", alignItems:"center", gap:16, position:"relative", overflow:"hidden", minHeight:120 }}>
                      {/* Vinyl record */}
                      <div style={{ width:80, height:80, borderRadius:"50%", flexShrink:0, position:"relative" }}>
                        {/* Grooves */}
                        <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"conic-gradient(#1a1a1a 0deg,#2d2d2d 30deg,#1a1a1a 60deg,#2d2d2d 90deg,#1a1a1a 120deg,#2d2d2d 150deg,#1a1a1a 180deg,#2d2d2d 210deg,#1a1a1a 240deg,#2d2d2d 270deg,#1a1a1a 300deg,#2d2d2d 330deg,#1a1a1a 360deg)" }} />
                        {/* Color overlay */}
                        <div style={{ position:"absolute", inset:10, borderRadius:"50%", background:grad, opacity:.5 }} />
                        {/* Shine */}
                        <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"linear-gradient(135deg,rgba(255,255,255,.22) 0%,transparent 55%)" }} />
                        {/* Center hole */}
                        <div style={{ position:"absolute", width:14, height:14, borderRadius:"50%", background:"#fff", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:2 }} />
                      </div>
                      {/* Text */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:10, fontWeight:800, letterSpacing:".18em", textTransform:"uppercase" as const,
                          background:grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
                          marginBottom:8 }}>🎵 LIVE SHOW</div>
                        <div style={{ fontSize:"clamp(22px,3.5vw,30px)", fontWeight:900, lineHeight:.95, letterSpacing:"-1px",
                          background:grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
                          wordBreak:"break-word" as const }}>
                          {name}
                        </div>
                      </div>
                    </div>
                    {/* Footer */}
                    <div style={{ padding:"10px 18px 13px", display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px solid rgba(13,27,62,.05)" }}>
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap" as const }}>
                        {artist.sell_count > 0 && (
                          <span style={{ fontSize:9, fontWeight:800, padding:"3px 10px", borderRadius:999, background:"rgba(0,104,71,.07)", color:C.green, border:"1px solid rgba(0,104,71,.2)", letterSpacing:".05em", textTransform:"uppercase" as const }}>
                            {artist.sell_count} {isHe?"מוכרים":"selling"}
                          </span>
                        )}
                        {artist.buy_count > 0 && (
                          <span style={{ fontSize:9, fontWeight:800, padding:"3px 10px", borderRadius:999, background:"rgba(26,58,143,.07)", color:C.navy, border:"1px solid rgba(26,58,143,.18)", letterSpacing:".05em", textTransform:"uppercase" as const }}>
                            {artist.buy_count} {isHe?"מחפשים":"buying"}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize:13, opacity:.25 }}>{isHe?"←":"→"}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
