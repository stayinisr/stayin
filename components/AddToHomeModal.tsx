"use client";

import { useLanguage } from "../lib/LanguageContext";
import { isAndroid, isIos } from "../lib/addToHome";

export default function AddToHomeModal({
  open,
  onClose,
  title,
  description,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}) {
  const { lang } = useLanguage();
  const isHe = lang === "he";

  if (!open) return null;

  const ios = isIos();
  const android = isAndroid();

  return (
    <div className="modal-overlay">
      <div className="modal-card fade-up" style={{ maxWidth: "440px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "6px",
              background: "var(--bg-main)",
              border: "1px solid var(--border-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0,
            }}
          >
            📱
          </div>

          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              {title || (isHe ? "הוסף את Stayin למסך הבית" : "Add Stayin to your home screen")}
            </h3>

            <p
              style={{
                margin: "6px 0 0",
                fontSize: "13px",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
              }}
            >
              {description ||
                (isHe
                  ? "פתח את Stayin בלחיצה אחת, ממש כמו אפליקציה."
                  : "Open Stayin in one tap, just like an app.")}
            </p>
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-main)",
            border: "1px solid var(--border-soft)",
            borderRadius: "6px",
            padding: "14px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "8px",
            }}
          >
            {ios
              ? isHe ? "באייפון" : "On iPhone"
              : android
              ? isHe ? "באנדרואיד" : "On Android"
              : isHe ? "איך מוסיפים" : "How to add"}
          </div>

          {ios ? (
            <div style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.9 }}>
              <div>{isHe ? "1. פתח את האתר ב־Safari" : "1. Open the site in Safari"}</div>
              <div>{isHe ? "2. לחץ על כפתור השיתוף" : "2. Tap the Share button"}</div>
              <div>{isHe ? '3. בחר "הוסף למסך הבית"' : '3. Choose "Add to Home Screen"'}</div>
            </div>
          ) : android ? (
            <div style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.9 }}>
              <div>{isHe ? "1. פתח את האתר בכרום" : "1. Open the site in Chrome"}</div>
              <div>{isHe ? "2. לחץ על תפריט הדפדפן" : "2. Open the browser menu"}</div>
              <div>{isHe ? '3. בחר "Add to Home screen" או "Install app"' : '3. Choose "Add to Home screen" or "Install app"'}</div>
            </div>
          ) : (
            <div style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.9 }}>
              <div>{isHe ? "באייפון: Safari ← שיתוף ← הוסף למסך הבית" : "iPhone: Safari ← Share ← Add to Home Screen"}</div>
              <div>{isHe ? 'באנדרואיד: Chrome ← תפריט ← "Add to Home screen"' : 'Android: Chrome ← Menu ← "Add to Home screen"'}</div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={onClose} className="primary-btn" type="button">
            {isHe ? "הבנתי" : "Got it"}
          </button>

          <button onClick={onClose} className="secondary-btn" type="button">
            {isHe ? "סגור" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}