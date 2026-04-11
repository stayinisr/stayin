"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../lib/LanguageContext";

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const { lang, setLang, t } = useLanguage();
  const isHe = lang === "he";

  useEffect(() => {
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const email = session?.user?.email ?? null;
        setUserEmail(email);
        if (session?.user?.id) {
          fetchProfile(session.user.id);
        } else {
          setIsAdmin(false);
          setFullName(null);
        }
      }
    );

    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setShowMenu(false);
    }
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  async function loadUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return;
    setUserEmail(user.email ?? null);
    fetchProfile(user.id);
  }

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin, full_name")
      .eq("id", userId)
      .maybeSingle();
    setIsAdmin(!!data?.is_admin);
    setFullName(data?.full_name ?? null);
  }

  async function logout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setLoggingOut(false);
    setUserEmail(null);
    setFullName(null);
    setIsAdmin(false);
    setShowMenu(false);
    setShowLogoutConfirm(false);
    window.location.href = "/";
  }

  const initials = fullName
    ? fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : userEmail?.[0]?.toUpperCase() ?? "?";

  return (
    <>
      <style>{`
        @keyframes menu-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .nav-menu-enter { animation: menu-in 200ms cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        .modal-enter { animation: modal-in 220ms cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          transition: "background 240ms ease, box-shadow 240ms ease, border-color 240ms ease",
          background: scrolled
            ? "rgba(255,255,255,0.88)"
            : "rgba(255,255,255,0.72)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: `1px solid ${scrolled ? "rgba(16,33,63,0.1)" : "rgba(16,33,63,0.06)"}`,
          boxShadow: scrolled ? "0 2px 24px rgba(16,33,63,0.07)" : "none",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 1.5rem",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* LOGO */}
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <Image
              src="/stayin-logo.svg"
              alt="Stayin"
              width={110}
              height={34}
              priority
              style={{ height: "auto", width: "auto", maxHeight: "36px" }}
            />
          </Link>

          {/* RIGHT */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

            {/* LANGUAGE PILL */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(16,33,63,0.05)",
                borderRadius: "999px",
                padding: "3px",
                gap: "2px",
              }}
            >
              {(["en", "he"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 180ms ease",
                    background: lang === l
                      ? "linear-gradient(135deg, #14c8d4, #0d6efd)"
                      : "transparent",
                    color: lang === l ? "#fff" : "var(--text-secondary)",
                  }}
                >
                  {l === "en" ? "🇺🇸 EN" : "🇮🇱 HE"}
                </button>
              ))}
            </div>

            {/* POST LISTING shortcut */}
            {userEmail && (
              <Link
                href="/post-listing"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #14c8d4 0%, #0d6efd 100%)",
                  color: "#fff",
                  textDecoration: "none",
                  transition: "opacity 180ms, transform 180ms",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = "0.88";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = "1";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <span style={{ fontSize: "15px" }}>+</span>
                {isHe ? "פרסם מודעה" : "Post listing"}
              </Link>
            )}

            {/* AVATAR / LOGIN */}
            {userEmail ? (
              <div ref={menuRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setShowMenu((p) => !p)}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #14c8d4, #0d6efd)",
                    border: "2px solid rgba(255,255,255,0.8)",
                    boxShadow: "0 0 0 1px rgba(20,200,212,0.3)",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 180ms, box-shadow 180ms",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1.06)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(20,200,212,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 1px rgba(20,200,212,0.3)";
                  }}
                >
                  {initials}
                </button>

                {showMenu && (
                  <div
                    className="nav-menu-enter"
                    style={{
                      position: "absolute",
                      [isHe ? "left" : "right"]: 0,
                      top: "calc(100% + 10px)",
                      width: "260px",
                      background: "rgba(255,255,255,0.95)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid rgba(16,33,63,0.1)",
                      borderRadius: "16px",
                      boxShadow: "0 16px 48px rgba(16,33,63,0.14)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        padding: "14px 16px",
                        borderBottom: "1px solid rgba(16,33,63,0.07)",
                        background: "linear-gradient(135deg, rgba(20,200,212,0.06), rgba(13,110,253,0.06))",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #14c8d4, #0d6efd)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: "13px",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          {fullName && (
                            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {fullName}
                            </div>
                          )}
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {userEmail}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Links */}
                    <div style={{ padding: "8px" }}>
                      {isAdmin && (
                        <MenuLink href="/admin" icon="⚙" label={t.adminPanel} />
                      )}
                      <MenuLink href="/my-listings" icon="📋" label={t.myListings} />
                      <MenuLink href="/my-account" icon="👤" label={isHe ? "החשבון שלי" : "My account"} />
                      <MenuLink href="/complete-profile" icon="✏️" label={t.editProfile} />

                      <div style={{ height: "1px", background: "rgba(16,33,63,0.07)", margin: "6px 4px" }} />

                      <button
                        onClick={() => { setShowMenu(false); setShowLogoutConfirm(true); }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "9px 12px",
                          borderRadius: "10px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#ef4444",
                          transition: "background 150ms",
                          textAlign: isHe ? "right" : "left",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.07)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span style={{ fontSize: "15px" }}>↩</span>
                        {t.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                style={{
                  padding: "7px 16px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #14c8d4 0%, #0d6efd 100%)",
                  color: "#fff",
                  textDecoration: "none",
                  transition: "opacity 180ms",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              >
                {t.login} / {t.signup}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(16,33,63,0.4)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "1.5rem",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowLogoutConfirm(false); }}
        >
          <div
            className="modal-enter"
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "2rem",
              width: "100%",
              maxWidth: "360px",
              textAlign: "center",
              boxShadow: "0 24px 64px rgba(16,33,63,0.18)",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>👋</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text-primary)" }}>
              {isHe ? "להתנתק?" : "Log out?"}
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
              {isHe ? "תוכל להתחבר שוב בכל רגע" : "You can log in again anytime"}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={logout}
                disabled={loggingOut}
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "14px",
                  border: "none",
                  cursor: loggingOut ? "not-allowed" : "pointer",
                  opacity: loggingOut ? 0.7 : 1,
                  transition: "opacity 180ms",
                }}
              >
                {loggingOut ? (isHe ? "מתנתק..." : "Logging out...") : (isHe ? "התנתק" : "Log out")}
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)",
                  background: "#fff",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "background 180ms",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f7fbff")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#fff")}
              >
                {isHe ? "ביטול" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MenuLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 12px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: 500,
        color: "var(--text-primary)",
        textDecoration: "none",
        transition: "background 150ms",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(20,200,212,0.07)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
    >
      <span style={{ fontSize: "15px" }}>{icon}</span>
      {label}
    </Link>
  );
}
