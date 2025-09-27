import React, { useMemo, useState, createContext, useContext, useEffect } from "react";

/**
 * Signup UI with success/error toast and automatic redirect to the platform.
 * Update the platform URL here:
 */
const PLATFORM_URL = "/app";           // <— set your real path/URL here
const REDIRECT_DELAY_MS = 1200;        // delay to show the toast

type Language = "it" | "en";

const LANGUAGE_STORAGE_KEY = "talent-alb:lang";

function resolveInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "it";
  }
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === "it" || stored === "en") {
    return stored;
  }
  const browserLanguage = window.navigator?.language?.toLowerCase();
  if (browserLanguage?.startsWith("en")) {
    return "en";
  }
  return "it";
}

const translations = {
  it: {
    authBadge: "Auth · Registrazione",
    createAccountTitle: "Crea il tuo account",
    demoSubtitle: "Demo UI per i tuoi endpoint Spring Boot. Nessuna dipendenza extra.",
    tabCandidate: "Candidato",
    tabCompany: "Azienda",
    candidateSubmit: "Registrati come candidato",
    companySubmit: "Registrati come azienda",
    emailLabel: "Email",
    emailPlaceholder: "name@example.com",
    passwordLabel: "Password",
    passwordHideButton: "Nascondi",
    passwordShowButton: "Mostra",
    passwordHideAria: "Nascondi password",
    passwordShowAria: "Mostra password",
    processing: "Elaborazione…",
    candidateFirstNameLabel: "Nome",
    candidateFirstNamePlaceholder: "Mario",
    candidateLastNameLabel: "Cognome",
    candidateLastNamePlaceholder: "Rossi",
    candidateCityLabel: "Città (opzionale)",
    candidateCityPlaceholder: "Bergamo",
    companyEmailPlaceholder: "owner@azienda.it",
    companyNameLabel: "Nome azienda",
    companyNamePlaceholder: "Talent ALB S.r.l.",
    companyWebsiteLabel: "Sito web (opzionale)",
    companyWebsitePlaceholder: "https://example.com",
    companyCityLabel: "Città (opzionale)",
    companyCityPlaceholder: "Bergamo",
    resultAccountCreated: "Account creato",
    toastCandidateSuccessTitle: "Registrazione completata",
    toastCompanySuccessTitle: "Azienda registrata",
    toastRedirectMessage: "Accesso in corso…",
    toastFailureTitle: "Registrazione fallita",
    footerTipOnePrefix:
      "Suggerimenti: valida i campi anche lato backend (Bean Validation), restituisci 400 con dettagli strutturati; esponi Swagger UI su",
    footerTipOneSuffix: ".",
    footerSwaggerPath: "/swagger-ui",
    footerTipTwo:
      "In produzione usa HTTPS. Password: hash lato server (BCrypt/Argon2), mai in chiaro nei log.",
    languageLabel: "Lingua",
    languageName_it: "Italiano",
    languageName_en: "Inglese",
  },
  en: {
    authBadge: "Auth · Sign up",
    createAccountTitle: "Create your account",
    demoSubtitle: "Demo UI for your Spring Boot endpoints. No extra dependencies.",
    tabCandidate: "Candidate",
    tabCompany: "Company",
    candidateSubmit: "Sign up as candidate",
    companySubmit: "Sign up as company",
    emailLabel: "Email",
    emailPlaceholder: "name@example.com",
    passwordLabel: "Password",
    passwordHideButton: "Hide",
    passwordShowButton: "Show",
    passwordHideAria: "Hide password",
    passwordShowAria: "Show password",
    processing: "Processing…",
    candidateFirstNameLabel: "First name",
    candidateFirstNamePlaceholder: "Mario",
    candidateLastNameLabel: "Last name",
    candidateLastNamePlaceholder: "Rossi",
    candidateCityLabel: "City (optional)",
    candidateCityPlaceholder: "Bergamo",
    companyEmailPlaceholder: "owner@company.com",
    companyNameLabel: "Company name",
    companyNamePlaceholder: "Talent ALB Ltd.",
    companyWebsiteLabel: "Website (optional)",
    companyWebsitePlaceholder: "https://example.com",
    companyCityLabel: "City (optional)",
    companyCityPlaceholder: "Bergamo",
    resultAccountCreated: "Account created",
    toastCandidateSuccessTitle: "Sign-up completed",
    toastCompanySuccessTitle: "Company registered",
    toastRedirectMessage: "Signing you in…",
    toastFailureTitle: "Sign-up failed",
    footerTipOnePrefix:
      "Tips: validate fields on the backend too (Bean Validation), return 400 with structured details; expose Swagger UI at",
    footerTipOneSuffix: ".",
    footerSwaggerPath: "/swagger-ui",
    footerTipTwo:
      "Use HTTPS in production. Passwords: hash them server-side (BCrypt/Argon2), never log them in plain text.",
    languageLabel: "Language",
    languageName_it: "Italian",
    languageName_en: "English",
  },
} as const;

type Translations = typeof translations;
type TranslationKey = keyof Translations[Language];

const I18nCtx = createContext<{
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
} | null>(null);

function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}

function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(() => resolveInitialLanguage());

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key: TranslationKey) => translations[lang][key],
    }),
    [lang, setLang]
  );
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

// ------------ Tipi ------------

type UserRole = "CANDIDATE" | "EMPLOYER" | "ADMIN" | string;
type AccountStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | string;

type AccountDto = {
  id: string;
  email: string;
  roles?: UserRole[];
  status?: AccountStatus;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  [k: string]: unknown;
};

type CandidateSignupReq = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  city?: string;
};

type CompanySignupReq = {
  email: string;
  password: string;
  companyName: string;
  website?: string;
  city?: string;
};

// ------------ Helpers ------------

async function postJson<TReq, TRes>(url: string, body: TReq): Promise<TRes> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    // Se il backend usa cookie di sessione, abilita credenziali:
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? `\n${text}` : ""}`);
  }
  return (await res.json()) as TRes;
}

function cx(...p: Array<string | false | null | undefined>) {
  return p.filter(Boolean).join(" ");
}

// ------------ Toast system (no deps) ------------

type ToastKind = "success" | "error" | "info";
type ToastMsg = { id: number; kind: ToastKind; title?: string; message: string; duration?: number };

const ToastCtx = createContext<{ push: (t: Omit<ToastMsg, "id">) => void } | null>(null);

function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const push = (t: Omit<ToastMsg, "id">) => {
    const id = Date.now() + Math.random();
    const toast: ToastMsg = { id, duration: 3500, ...t };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, toast.duration);
  };
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              "w-80 rounded-2xl border p-3 shadow-lg backdrop-blur bg-white/95",
              t.kind === "success" && "border-green-200",
              t.kind === "error" && "border-red-200",
              t.kind === "info" && "border-gray-200"
            )}
          >
            <div className="flex items-start gap-2">
              <span
                className={cx(
                  "mt-1 inline-block h-2.5 w-2.5 rounded-full",
                  t.kind === "success" && "bg-green-500",
                  t.kind === "error" && "bg-red-500",
                  t.kind === "info" && "bg-gray-500"
                )}
              />
              <div className="grow">
                {t.title && <div className="text-sm font-medium">{t.title}</div>}
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{t.message}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ------------ UI primitives ------------

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium mb-1 text-gray-800">
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-sm",
        "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-black",
        props.className || ""
      )}
    />
  );
}

function Field({
  label,
  name,
  ...rest
}: {
  label: string;
  name: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...rest} />
    </div>
  );
}

function PasswordField({
  label,
  name = "password",
  value,
  onChange,
  required,
}: {
  label?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  const { t } = useI18n();
  const resolvedLabel = label ?? t("passwordLabel");
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label htmlFor={name}>{resolvedLabel}</Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete="new-password"
          className="pr-12"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          aria-label={show ? t("passwordHideAria") : t("passwordShowAria")}
        >
          {show ? t("passwordHideButton") : t("passwordShowButton")}
        </button>
      </div>
    </div>
  );
}

function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <button
      className={cx(
        "w-full rounded-2xl p-3 mt-2 bg-black text-white shadow transition",
        "disabled:opacity-60 disabled:cursor-not-allowed hover:bg-black/90"
      )}
      disabled={loading}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          {t("processing")}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

function ResultCard({ data }: { data: AccountDto }) {
  const { t } = useI18n();
  const pretty = useMemo(() => JSON.stringify(data, null, 2), [data]);
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 mt-3">
      <div className="text-[11px] uppercase tracking-wide mb-1 text-gray-500">
        {t("resultAccountCreated")}
      </div>
      <pre className="overflow-auto">{pretty}</pre>
    </div>
  );
}

function ErrorCard({ error }: { error: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 whitespace-pre-wrap">
      {error}
    </div>
  );
}

// ------------ Forms ------------

function CandidateForm() {
  const { push } = useToast();
  const { t } = useI18n();
  const [form, setForm] = useState<CandidateSignupReq>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AccountDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof CandidateSignupReq>(key: K, v: string) {
    setForm((f) => ({ ...f, [key]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload: CandidateSignupReq = {
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        city: form.city?.trim() || undefined,
      };
      const data = await postJson<CandidateSignupReq, AccountDto>(
        "/api/auth/signup/candidate",
        payload
      );
      setResult(data);
      push({
        kind: "success",
        title: t("toastCandidateSuccessTitle"),
        message: t("toastRedirectMessage"),
      });
      // Redirect verso la piattaforma reale (cookie-based o SSO):
      setTimeout(() => {
        window.location.assign(PLATFORM_URL);
      }, REDIRECT_DELAY_MS);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setError(msg);
      push({
        kind: "error",
        title: t("toastFailureTitle"),
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <Field
          label={t("emailLabel")}
          name="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          type="email"
          required
          placeholder={t("emailPlaceholder")}
        />
        <PasswordField
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label={t("candidateFirstNameLabel")}
            name="firstName"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            required
            placeholder={t("candidateFirstNamePlaceholder")}
          />
          <Field
            label={t("candidateLastNameLabel")}
            name="lastName"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            required
            placeholder={t("candidateLastNamePlaceholder")}
          />
        </div>
        <Field
          label={t("candidateCityLabel")}
          name="city"
          value={form.city || ""}
          onChange={(e) => update("city", e.target.value)}
          placeholder={t("candidateCityPlaceholder")}
        />
      </div>

      <SubmitButton loading={loading}>{t("candidateSubmit")}</SubmitButton>

      {error && <ErrorCard error={error} />}
      {result && <ResultCard data={result} />}
    </form>
  );
}

function CompanyForm() {
  const { push } = useToast();
  const { t } = useI18n();
  const [form, setForm] = useState<CompanySignupReq>({
    email: "",
    password: "",
    companyName: "",
    website: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AccountDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof CompanySignupReq>(key: K, v: string) {
    setForm((f) => ({ ...f, [key]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload: CompanySignupReq = {
        email: form.email.trim(),
        password: form.password,
        companyName: form.companyName.trim(),
        website: form.website?.trim() || undefined,
        city: form.city?.trim() || undefined,
      };
      const data = await postJson<CompanySignupReq, AccountDto>(
        "/api/auth/signup/company",
        payload
      );
      setResult(data);
      push({
        kind: "success",
        title: t("toastCompanySuccessTitle"),
        message: t("toastRedirectMessage"),
      });
      setTimeout(() => {
        window.location.assign(PLATFORM_URL);
      }, REDIRECT_DELAY_MS);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setError(msg);
      push({
        kind: "error",
        title: t("toastFailureTitle"),
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <Field
          label={t("emailLabel")}
          name="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          type="email"
          required
          placeholder={t("companyEmailPlaceholder")}
        />
        <PasswordField
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          required
        />
        <Field
          label={t("companyNameLabel")}
          name="companyName"
          value={form.companyName}
          onChange={(e) => update("companyName", e.target.value)}
          required
          placeholder={t("companyNamePlaceholder")}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label={t("companyWebsiteLabel")}
            name="website"
            value={form.website || ""}
            onChange={(e) => update("website", e.target.value)}
            type="url"
            placeholder={t("companyWebsitePlaceholder")}
          />
          <Field
            label={t("companyCityLabel")}
            name="city"
            value={form.city || ""}
            onChange={(e) => update("city", e.target.value)}
            placeholder={t("companyCityPlaceholder")}
          />
        </div>
      </div>

      <SubmitButton loading={loading}>{t("companySubmit")}</SubmitButton>

      {error && <ErrorCard error={error} />}
      {result && <ResultCard data={result} />}
    </form>
  );
}

// ------------ App ------------

function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  const options: Array<{ value: Language; label: string }> = [
    { value: "it", label: t("languageName_it") },
    { value: "en", label: t("languageName_en") },
  ];
  return (
    <fieldset className="flex flex-col items-end gap-2 text-xs text-gray-600" aria-label={t("languageLabel")}>
      <legend className="font-medium uppercase tracking-wide text-[11px]">
        {t("languageLabel")}
      </legend>
      <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setLang(option.value)}
            className={cx(
              "rounded-full px-3 py-1 text-xs transition",
              lang === option.value
                ? "bg-black text-white shadow"
                : "text-gray-600 hover:bg-gray-50"
            )}
            aria-pressed={lang === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function AppContent() {
  const { t } = useI18n();
  const [tab, setTab] = useState<"candidate" | "company">("candidate");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <div className="max-w-md mx-auto p-6">
        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600">
                <span className="inline-block h-2 w-2 rounded-full bg-black" />
                {t("authBadge")}
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight">{t("createAccountTitle")}</h1>
              <p className="text-sm text-gray-600">{t("demoSubtitle")}</p>
            </div>
            <LanguageSwitcher />
          </div>
        </header>

        <div className="mb-4 flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setTab("candidate")}
            className={cx(
              "flex-1 rounded-xl px-4 py-2 text-sm transition",
              tab === "candidate" ? "bg-black text-white shadow" : "hover:bg-gray-50"
            )}
          >
            {t("tabCandidate")}
          </button>
          <button
            onClick={() => setTab("company")}
            className={cx(
              "flex-1 rounded-xl px-4 py-2 text-sm transition",
              tab === "company" ? "bg-black text-white shadow" : "hover:bg-gray-50"
            )}
          >
            {t("tabCompany")}
          </button>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          {tab === "candidate" ? <CandidateForm /> : <CompanyForm />}
        </div>

        <footer className="text-xs text-gray-500 mt-6 space-y-1">
          <p>
            {t("footerTipOnePrefix")} <code>{t("footerSwaggerPath")}</code>
            {t("footerTipOneSuffix")}
          </p>
          <p>{t("footerTipTwo")}</p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </I18nProvider>
  );
}
