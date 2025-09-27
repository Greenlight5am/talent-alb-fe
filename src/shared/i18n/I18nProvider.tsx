import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale, TranslationKey } from "./messages";
import { messages } from "./messages";

const STORAGE_KEY = "talentalb:locale";

type TranslateArgs = Record<string, string | number> | undefined;

export type TranslateFn = (key: TranslationKey, replacements?: TranslateArgs) => string;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function resolveMessage(locale: Locale, key: TranslationKey): string | undefined {
  return key.split(".").reduce<any>((acc, part) => (acc && part in acc ? acc[part as keyof typeof acc] : undefined), messages[locale]);
}

function applyReplacements(template: string, replacements?: TranslateArgs) {
  if (!replacements) return template;
  return template.replace(/\{(\w+)\}/g, (match, token) => {
    const value = replacements[token];
    return value === undefined ? match : String(value);
  });
}

function detectInitialLocale(): Locale {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && stored in messages) return stored;
    const navLang = window.navigator.language.toLowerCase();
    if (navLang.startsWith("sq")) return "sq";
    if (navLang.startsWith("en")) return "en";
  }
  return "it";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectInitialLocale());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {}
  }, [locale]);

  const translate = useCallback<TranslateFn>(
    (key, replacements) => {
      const message = resolveMessage(locale, key);
      if (typeof message !== "string") {
        return key;
      }
      return applyReplacements(message, replacements);
    },
    [locale]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: translate,
    }),
    [locale, translate]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

export function useTranslations() {
  return useI18n().t;
}
