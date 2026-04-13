"use client";

import { useLanguage } from "../lib/LanguageContext";

export default function AddToHomeCard({
  title,
  description,
  onOpen,
  onDismiss,
}: {
  title?: string;
  description?: string;
  onOpen: () => void;
  onDismiss: () => void;
}) {
  const { lang } = useLanguage();
  const isHe = lang === "he";

  return (
    <div
      className="card-static fade-up"
      style={{
        marginTop: "14px",
        padding: "16px",
        background: "rgba(255,255,255,0.92)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div
          aria-hidden
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "6px",
            background: "var(--bg-main)",
            border: "1px solid var(--border-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            flexShrink: 0,
          }}
        >
          📱
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "4px",
            }}
          >
            {title || (isHe ? "הוסף את Stayin למסך הבית" : "Add Stayin to your home screen")}
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            {description ||
              (isHe
                ? "גישה מהירה למשחקים, מודעות ויצירת קשר — כמו אפליקציה."
                : "Quick access to matches, listings and contact — like an app.")}
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
            <button onClick={onOpen} className="primary-btn" type="button">
              {isHe ? "איך מוסיפים?" : "How to add"}
            </button>

            <button onClick={onDismiss} className="ghost-btn" type="button">
              {isHe ? "לא עכשיו" : "Not now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}