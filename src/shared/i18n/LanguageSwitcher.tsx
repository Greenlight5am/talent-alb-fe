import type { ChangeEvent } from "react";
import { useI18n } from "./I18nProvider";
import type { Locale, TranslationKey } from "./messages";

const SUPPORTED_LOCALES: Locale[] = ["it", "en", "sq"];
const OPTION_LABEL_KEYS: Record<Locale, TranslationKey> = {
  it: "common.language.options.it",
  en: "common.language.options.en",
  sq: "common.language.options.sq",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLocale(event.target.value as Locale);
  };

  return (
    <label className={className}>
      <span className="block text-xs font-medium text-gray-500">{t("common.language.label")}</span>
      <select
        value={locale}
        onChange={handleChange}
        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
      >
        {SUPPORTED_LOCALES.map((value) => (
          <option key={value} value={value}>
            {t(OPTION_LABEL_KEYS[value])}
          </option>
        ))}
      </select>
    </label>
  );
}
