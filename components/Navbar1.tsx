"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../lib/LanguageContext";

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const email = session?.user?.email ?? null;
      setUserEmail(email);

      if (session?.user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .maybeSingle();

        setIsAdmin(!!data?.is_admin);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  async function loadUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      setUserEmail(null);
      setIsAdmin(false);
      return;
    }

    setUserEmail(user.email ?? null);

    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    setIsAdmin(!!data?.is_admin);
  }

  async function logout() {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    setLoggingOut(false);

    if (error) {
      console.error(error);
      return;
    }

    setUserEmail(null);
    setIsAdmin(false);
    setShowMenu(false);
    setShowLogoutConfirm(false);
    window.location.href = "/";
  }

  return (
    <>
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200/70">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center">
            <Image
              src="/stayin-logo.svg"
              alt="Stayin"
              width={120}
              height={36}
              priority
              className="h-auto w-auto max-h-10"
            />
          </Link>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">

            {/* LANGUAGE */}
            <div className="flex items-center border border-slate-200 bg-white p-1">
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 text-sm font-semibold ${
                  lang === "en"
                    ? "bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
                    : "text-slate-500"
                }`}
              >
                🇺🇸
              </button>

              <button
                onClick={() => setLang("he")}
                className={`px-3 py-1 text-sm font-semibold ${
                  lang === "he"
                    ? "bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
                    : "text-slate-500"
                }`}
              >
                🇮🇱
              </button>
            </div>

            {/* USER */}
            {userEmail ? (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-cyan-400 to-blue-600 hover:opacity-90 transition"
                >
                  {t.myAccount}
                </button>

                {showMenu && (
                  <div className="absolute end-0 mt-3 w-72 border border-slate-200 bg-white p-4 shadow-lg">

                    <div className="pb-3 border-b border-slate-200">
                      <div className="text-xs text-slate-400 mb-1">
                        {t.signedInAs}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 break-all">
                        {userEmail}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">

                      {isAdmin && (
                        <Link href="/admin" className="text-sm hover:text-cyan-600">
                          {t.adminPanel}
                        </Link>
                      )}

                      <Link href="/my-listings" className="text-sm hover:text-cyan-600">
                        {t.myListings}
                      </Link>

                      <Link href="/complete-profile" className="text-sm hover:text-cyan-600">
                        {t.editProfile}
                      </Link>

                      <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="text-sm text-red-500 hover:opacity-80"
                      >
                        {t.logout}
                      </button>

                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-cyan-400 to-blue-600 hover:opacity-90 transition"
              >
                {t.login} / {t.signup}
              </Link>
            )}

          </div>
        </div>
      </header>

      {/* LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-sm w-full text-center shadow-lg">

            <h3 className="text-lg font-bold mb-3">
              {lang === "he" ? "להתנתק?" : "Log out?"}
            </h3>

            <p className="text-sm text-slate-600 mb-6">
              {lang === "he"
                ? "תוכל להתחבר שוב בכל רגע"
                : "You can log in again anytime"}
            </p>

            <div className="flex flex-col gap-3">

              <button
                onClick={logout}
                disabled={loggingOut}
                className="bg-red-500 text-white py-2 font-bold"
              >
                {loggingOut
                  ? lang === "he"
                    ? "מתנתק..."
                    : "Logging out..."
                  : lang === "he"
                  ? "התנתק"
                  : "Log out"}
              </button>

              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="border border-slate-300 py-2"
              >
                {lang === "he"
                  ? "ביטול"
                  : "Cancel"}
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}