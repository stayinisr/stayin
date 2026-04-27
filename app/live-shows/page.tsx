"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../lib/LanguageContext";

const C = {
  text: "#0d1b3e", navy: "#1a3a8f", teal: "#1abfb0",
  muted: "#64748b", hint: "#94a3b8", border: "#e8edf5",
  bg: "#f8f9fc",
};

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
  const fBody = isHe ? "var(--font-he,'Heebo',sans-serif)" : "var(--font-dm,'DM Sans',sans-serif)";
  const fSyne = "var(--font-syne,'Syne',sans-serif)";

  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      // Get all active show_listings with artist info
      const { data } = await supabase
        .from("show_listings")
        .select("artist_id, type, artists(id, name, name_he)")
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString());

      if (!data) { setLoading(false); return; }

      // Group by artist
      const map = new Map<string, Artist>();
      for (const row of data) {
        const a = row.artists as any;
        if (!a) continue;
        if (!map.has(a.id)) {
          map.set(a.id, { id: a.id, name: a.name, name_he: a.name_he, sell_count: 0, buy_count: 0 });
        }
        const entry = map.get(a.id)!;
        if (row.type === "sell") entry.sell_count++;
        else entry.buy_count++;
      }

      setArtists(Array.from(map.values()).sort((a, b) =>
        (isHe ? (a.name_he || a.name) : a.name).localeCompare(isHe ? (b.name_he || b.name) : b.name)
      ));
      setLoading(false);
    }
    load();
  }, [isHe]);

  const filtered = artists.filter(a => {
    const q = search.toLowerCase();
    return !q || a.name.toLowerCase().includes(q) || (a.name_he || "").includes(q);
  });

  return (
    <main style={{ minHeight: "100vh", fontFamily: fBody }}>
      {/* Top stripe */}
      <div style={{ height: 3, background: `linear-gradient(90deg,${C.navy},${C.teal})` }} />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#eef2ff 0%,#fdf0f2 52%,#edfff8 100%)", padding: "48px 16px 40px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 500, height: 500, top: -200, right: -100, borderRadius: "50%", background: "radial-gradient(circle,rgba(26,191,176,.08),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: C.teal, marginBottom: 10 }}>STAYIN · LIVE SHOWS</div>
          <h1 style={{ fontFamily: fSyne, fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, color: C.text, letterSpacing: "-.5px", marginBottom: 10 }}>
            {isHe ? "🎵 הופעות חיות" : "🎵 Live Shows"}
          </h1>
          <p style={{ fontSize: 14, color: C.muted, maxWidth: 500, lineHeight: 1.6 }}>
            {isHe
              ? "כרטיסים להופעות בין אנשים, בלי עמלה. מצא כרטיס לאמן האהוב עליך."
              : "Tickets to live shows between people, no fees. Find tickets to your favorite artist."}
          </p>

          <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isHe ? "חפש אמן..." : "Search artist..."}
              style={{ padding: "11px 16px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, outline: "none", background: "rgba(255,255,255,.9)", width: 260, fontFamily: fBody }}
            />
            <Link
              href="/post-listing?tab=show"
              style={{ padding: "11px 20px", background: C.teal, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
            >
              + {isHe ? "פרסם מודעה" : "Post listing"}
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px" }}>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: C.hint, fontSize: 14 }}>
            {isHe ? "טוען..." : "Loading..."}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              {search ? (isHe ? "לא נמצאו תוצאות" : "No results found") : (isHe ? "אין מודעות עדיין" : "No listings yet")}
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
              {isHe ? "היה הראשון לפרסם מודעה להופעה!" : "Be the first to post a show listing!"}
            </div>
            <Link href="/post-listing?tab=show" style={{ padding: "10px 20px", background: C.teal, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              {isHe ? "פרסם מודעה" : "Post listing"}
            </Link>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: C.hint, marginBottom: 20, fontWeight: 600 }}>
              {filtered.length} {isHe ? "אמנים עם מודעות פעילות" : "artists with active listings"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
              {filtered.map(artist => {
                const displayName = isHe ? (artist.name_he || artist.name) : artist.name;
                const total = artist.sell_count + artist.buy_count;
                return (
                  <Link
                    key={artist.id}
                    href={`/live-shows/${artist.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, transition: "all 150ms", boxShadow: "0 1px 4px rgba(13,27,62,.04)", cursor: "pointer" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(13,27,62,.1)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(13,27,62,.04)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
                    >
                      {/* Artist icon */}
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg,${C.navy},${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                        🎵
                      </div>

                      {/* Name + counts */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {displayName}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {artist.sell_count > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(0,104,71,.08)", color: "#006847", border: "1px solid rgba(0,104,71,.15)" }}>
                              {artist.sell_count} {isHe ? "מוכרים" : "selling"}
                            </span>
                          )}
                          {artist.buy_count > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(26,58,143,.08)", color: C.navy, border: "1px solid rgba(26,58,143,.15)" }}>
                              {artist.buy_count} {isHe ? "מחפשים" : "buying"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div style={{ fontSize: 18, color: C.hint, flexShrink: 0 }}>{isHe ? "←" : "→"}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
