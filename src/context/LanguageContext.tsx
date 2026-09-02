"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "EN" | "HI";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (en: string, hi: string) => string;
  speakHindi: (text: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "EN",
  setLang: () => {},
  toggleLang: () => {},
  t: (en) => en,
  speakHindi: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("EN");

  useEffect(() => {
    const saved = localStorage.getItem("farmdirect_lang") as Language | null;
    if (saved === "EN" || saved === "HI") {
      setLangState(saved);
    }
  }, []);

  const setLang = (next: Language) => {
    setLangState(next);
    localStorage.setItem("farmdirect_lang", next);
  };

  const toggleLang = () => {
    setLang(lang === "EN" ? "HI" : "EN");
  };

  const t = (en: string, hi: string) => {
    return lang === "HI" ? hi : en;
  };

  const speakHindi = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "HI" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, speakHindi }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
