"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../lib/LanguageContext";

type Option = {
  label: string;
  value: string;
};

export default function MultiSelectDropdown({
  label,
  options,
  selected,
  setSelected,
}: {
  label: string;
  options: Option[];
  selected: string[];
  setSelected: (val: string[]) => void;
}) {
  const { lang } = useLanguage();
  const isHe = lang === "he";

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, search]);

  function toggle(value: string) {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  }

  function selectAllFiltered() {
    const filteredValues = filteredOptions.map((o) => o.value);
    const merged = Array.from(new Set([...selected, ...filteredValues]));
    setSelected(merged);
  }

  function clearAll() {
    setSelected([]);
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="input-field text-left"
      >
        {selected.length
          ? isHe
            ? `${selected.length} נבחרו`
            : `${selected.length} selected`
          : label}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-white shadow-lg p-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isHe ? "חפש..." : "Search..."}
            className="input-field mb-3"
          />

          <div className="flex gap-2 mb-3">
            <button type="button" onClick={selectAllFiltered} className="secondary-btn text-sm px-3 py-2">
              {isHe ? "בחר הכל" : "Select all"}
            </button>
            <button type="button" onClick={clearAll} className="secondary-btn text-sm px-3 py-2">
              {isHe ? "נקה" : "Clear"}
            </button>
          </div>

          <div className="max-h-60 overflow-auto space-y-1">
            {filteredOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-[var(--bg-main)] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                />
                <span className="text-[var(--text-primary)]">{opt.label}</span>
              </label>
            ))}

            {filteredOptions.length === 0 && (
              <div className="text-sm text-[var(--text-muted)] px-2 py-2">
                {isHe ? "לא נמצאו תוצאות" : "No results found"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}