"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "gu";

const STORAGE_KEY = "solarium_lang";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  isGu: boolean;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  toggleLang: () => {},
  isGu: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "gu" || saved === "en") {
        setLangState(saved);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // The page language follows the switch, so Gujarati text gets the Gujarati rules of the stylesheet.
  useEffect(() => {
    document.documentElement.lang = lang === "gu" ? "gu" : "en-IN";
  }, [lang]);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
  };

  const toggleLang = () => {
    setLang(lang === "en" ? "gu" : "en");
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        isGu: lang === "gu",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
