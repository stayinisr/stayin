"use client";

import { createContext, useContext, useMemo, useState, useCallback } from "react";

type ToastType = "success" | "error" | "warning" | "info";

type ToastContextType = {
  show: (text: string, type?: ToastType) => void;
  success: (text: string) => void;
  error: (text: string) => void;
  warning: (text: string) => void;
};

type ToastItem = {
  id: number;
  text: string;
  type: ToastType;
  removing: boolean;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.25)",
    icon: "#22c55e",
  },
  error: {
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
    icon: "#ef4444",
  },
  warning: {
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    icon: "#f59e0b",
  },
  info: {
    bg: "rgba(20,200,212,0.08)",
    border: "rgba(20,200,212,0.25)",
    icon: "#14c8d4",
  },
};

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, removing: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 320);
  }, []);

  const show = useCallback(
    (text: string, type: ToastType = "info") => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((prev) => [...prev, { id, text, type, removing: false }]);
      setTimeout(() => remove(id), 3200);
    },
    [remove]
  );

  const api = useMemo(
    () => ({
      show,
      success: (text: string) => show(text, "success"),
      error: (text: string) => show(text, "error"),
      warning: (text: string) => show(text, "warning"),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes toast-out {
          from { opacity: 1; transform: translateY(0)   scale(1); }
          to   { opacity: 0; transform: translateY(8px)  scale(0.95); }
        }
        .toast-enter { animation: toast-in  260ms cubic-bezier(0.16,1,0.3,1) both; }
        .toast-exit  { animation: toast-out 300ms cubic-bezier(0.4,0,1,1)    both; }
      `}</style>

      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          pointerEvents: "none",
          minWidth: "320px",
          maxWidth: "480px",
          width: "90vw",
        }}
      >
        {toasts.map((toast) => {
          const c = COLORS[toast.type];
          return (
            <div
              key={toast.id}
              className={toast.removing ? "toast-exit" : "toast-enter"}
              style={{
                width: "100%",
                background: "var(--bg-surface, #fff)",
                border: `1px solid ${c.border}`,
                borderLeft: `4px solid ${c.icon}`,
                borderRadius: "14px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 8px 32px rgba(16,33,63,0.14)",
                pointerEvents: "auto",
                cursor: "default",
              }}
            >
              <span
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: c.icon,
                  flexShrink: 0,
                }}
              >
                {ICONS[toast.type]}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--text-primary, #10213f)",
                  lineHeight: 1.4,
                }}
              >
                {toast.text}
              </span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
