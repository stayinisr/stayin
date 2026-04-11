"use client";

import { useState } from "react";
import { translations } from "./translations";

export default function useLanguage() {
  const [lang, setLang] = useState<"en" | "he">("en");

  const t = translations[lang];

  return { lang, setLang, t };
}