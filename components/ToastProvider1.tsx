"use client";

import { createContext, useContext, useMemo, useState } from "react";

type ToastContextType = {
  show: (text: string) => void;
};

type ToastItem = {
  id: number;
  text: string;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return ctx;
}

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const api = useMemo(
    () => ({
      show(text: string) {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        setToasts((prev) => [...prev, { id, text }]);

        window.setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 2600);
      },
    }),
    []
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div className="fixed bottom-5 left-5 z-[9999] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rounded-xl bg-black px-4 py-3 text-sm text-white shadow-2xl"
          >
            {toast.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}