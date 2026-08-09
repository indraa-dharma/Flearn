"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { translations, langOptions, LangKey } from "./translations";
import { UiPhraseTranslator } from "./ui-phrase-translator";

export { langOptions };
export type { LangKey };

interface LanguageContextType {
  language: LangKey;
  setLanguage: (lang: LangKey) => void;
  t: typeof translations.en;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LangKey>("id");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("flearn-language") as LangKey;
    if (stored && translations[stored]) {
      setLanguageState(stored);
      document.cookie = `flearn-language=${stored}; path=/; max-age=31536000`;
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: LangKey) => {
    setLanguageState(lang);
    localStorage.setItem("flearn-language", lang);
    document.cookie = `flearn-language=${lang}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t: translations[language],
      isRtl: false
    }}>
      <div dir="ltr" className="h-full w-full">
        <UiPhraseTranslator language={language} />
        {mounted ? children : <div className="invisible h-full w-full">{children}</div>}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
