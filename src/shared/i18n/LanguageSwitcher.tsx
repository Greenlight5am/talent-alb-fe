import { useI18n } from "./I18nProvider";
import type { Locale, TranslationKey } from "./messages";
import { useState, useEffect, useRef } from "react";

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const SUPPORTED_LOCALES: Locale[] = ["it", "en", "sq"];
const OPTION_LABEL_KEYS: Record<Locale, TranslationKey> = {
  it: "common.language.options.it",
  en: "common.language.options.en",
  sq: "common.language.options.sq",
};

type LanguageSwitcherProps = {
  className?: string;
  /**
   * Additional classes applied to the trigger button. Useful to adapt
   * the switcher to different layouts while keeping the same behaviour
   * and accessibility.
   */
  selectClassName?: string;
  /**
   * When true the visual label is hidden but remains available for
   * screen readers. Ideal for compact headers.
   */
  hideLabel?: boolean;
};

type LanguageDropdownProps = {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
};

function LanguageDropdown({
  options,
  value,
  onChange,
  className = "",
  buttonClassName = "",
}: LanguageDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    // Chiudi quando cambia la lingua selezionata
    useEffect(() => {
        setIsOpen(false);
    }, [value]);

    // Chiudi con ESC
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen]);

    // Chiudi cliccando/tappando fuori (senza overlay)
    useEffect(() => {
        if (!isOpen) return;

        const onPointerDown = (e: Event) => {
            const root = rootRef.current;
            if (!root) return;
            const target = e.target as Node | null;
            if (target && !root.contains(target)) {
                setIsOpen(false);
            }
        };

        // capture=true per prendere l'evento anche se altri layer lo fermano in bubbling
        document.addEventListener("pointerdown", onPointerDown, true);
        document.addEventListener("touchstart", onPointerDown, true);

        return () => {
            document.removeEventListener("pointerdown", onPointerDown, true);
            document.removeEventListener("touchstart", onPointerDown, true);
        };
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        // chiusura già gestita dall'effetto su [value], ma forziamo comunque
        setIsOpen(false);
        // togli focus dal bottone per evitare popover “appesi” su mobile/Safari
        requestAnimationFrame(() => buttonRef.current?.blur());
    };

    return (
    <div ref={rootRef} className={joinClasses("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setIsOpen((o) => !o)}
        className={joinClasses(
          "inline-flex min-h-[2rem] min-w-[3.5rem] items-center justify-between gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200",
          buttonClassName,
        )}
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.label : "IT"}
        </span>
        <svg
          className={joinClasses("h-4 w-4 text-slate-400 transition-transform", isOpen && "rotate-180")}
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.17l3.71-2.94a.75.75 0 1 1 .94 1.16l-4.2 3.33a.75.75 0 0 1-.94 0l-4.2-3.33a.75.75 0 0 1 .02-1.16z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-[110] mt-1 w-full min-w-[8rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <ul role="listbox" className="max-h-48 overflow-auto py-1">
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
              >
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleSelect(option.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className={joinClasses(
                    "w-full px-4 py-2 text-left text-xs",
                    option.value === value
                      ? "bg-slate-100 font-semibold text-slate-900"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function LanguageSwitcher({ className, selectClassName, hideLabel = false }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();

  const options = SUPPORTED_LOCALES.map((value) => ({
    value,
    label: t(OPTION_LABEL_KEYS[value])
  }));

  const handleChange = (value: string) => {
    setLocale(value as Locale);
  };

  return (
    <label className={joinClasses("inline-flex flex-col", hideLabel && "items-end", className)}>
      {hideLabel ? (
        <span className="sr-only">{t("common.language.label")}</span>
      ) : (
        <span className="block text-xs font-medium text-slate-500">{t("common.language.label")}</span>
      )}
      <LanguageDropdown
        options={options}
        value={locale}
        onChange={handleChange}
        className={hideLabel ? undefined : "mt-1"}
        buttonClassName={selectClassName}
      />
    </label>
  );
}
