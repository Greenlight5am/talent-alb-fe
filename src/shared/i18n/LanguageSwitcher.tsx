import type { ChangeEvent } from "react";
import { useI18n } from "./I18nProvider";
import type { Locale, TranslationKey } from "./messages";

const SUPPORTED_LOCALES: Locale[] = ["it", "en", "sq"];
const OPTION_LABEL_KEYS: Record<Locale, TranslationKey> = {
  it: "common.language.options.it",
  en: "common.language.options.en",
  sq: "common.language.options.sq",
};

type LanguageSwitcherProps = {
  className?: string;
  /**
   * Additional classes applied to the underlying <select> element.
   * Useful to adapt the switcher to different layouts while keeping
   * the same behaviour and accessibility.
   */
  selectClassName?: string;
  /**
   * When true the visual label is hidden but remains available for
   * screen readers. Ideal for compact headers.
   */
  hideLabel?: boolean;
};

export function LanguageSwitcher({ className, selectClassName, hideLabel = false }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLocale(event.target.value as Locale);
  };

  const selectClasses = [
    "mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10",
    hideLabel && "mt-0",
    selectClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={className}>
      {hideLabel ? (
        <span className="sr-only">{t("common.language.label")}</span>
      ) : (
        <span className="block text-xs font-medium text-gray-500">{t("common.language.label")}</span>
      )}
      <select value={locale} onChange={handleChange} className={selectClasses}>
        {SUPPORTED_LOCALES.map((value) => (
          <option key={value} value={value}>
            {t(OPTION_LABEL_KEYS[value])}
          </option>
        ))}
      </select>
    </label>
  );
}
