import type { Locale } from "./messages";

export const localeConfig: Record<Locale, { number: string; date: string; relative: string }> = {
  it: { number: "it-IT", date: "it-IT", relative: "it" },
  en: { number: "en-US", date: "en-US", relative: "en" },
  sq: { number: "sq-AL", date: "sq-AL", relative: "sq" },
};
