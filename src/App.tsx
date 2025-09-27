import React, { useMemo, useState, createContext, useContext } from "react";

/**
 * Signup UI with success/error toast and automatic redirect to the platform.
 * Update the platform URL here:
 */
const PLATFORM_URL = "/app";           // <— set your real path/URL here
const REDIRECT_DELAY_MS = 1200;        // delay to show the toast

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
  label = "Password",
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
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
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
          aria-label={show ? "Nascondi password" : "Mostra password"}
        >
          {show ? "Hide" : "Show"}
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
          Processing…
        </span>
      ) : (
        children
      )}
    </button>
  );
}

function ResultCard({ data }: { data: AccountDto }) {
  const pretty = useMemo(() => JSON.stringify(data, null, 2), [data]);
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 mt-3">
      <div className="text-[11px] uppercase tracking-wide mb-1 text-gray-500">Account creato</div>
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
        title: "Registrazione completata",
        message: "Accesso in corso…",
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
        title: "Registrazione fallita",
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
          label="Email"
          name="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          type="email"
          required
          placeholder="name@example.com"
        />
        <PasswordField
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="First name"
            name="firstName"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            required
            placeholder="Mario"
          />
          <Field
            label="Last name"
            name="lastName"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            required
            placeholder="Rossi"
          />
        </div>
        <Field
          label="City (opzionale)"
          name="city"
          value={form.city || ""}
          onChange={(e) => update("city", e.target.value)}
          placeholder="Bergamo"
        />
      </div>

      <SubmitButton loading={loading}>Sign up as Candidate</SubmitButton>

      {error && <ErrorCard error={error} />}
      {result && <ResultCard data={result} />}
    </form>
  );
}

function CompanyForm() {
  const { push } = useToast();
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
        title: "Azienda registrata",
        message: "Accesso in corso…",
      });
      setTimeout(() => {
        window.location.assign(PLATFORM_URL);
      }, REDIRECT_DELAY_MS);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setError(msg);
      push({
        kind: "error",
        title: "Registrazione fallita",
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
          label="Email"
          name="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          type="email"
          required
          placeholder="owner@azienda.it"
        />
        <PasswordField
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          required
        />
        <Field
          label="Company name"
          name="companyName"
          value={form.companyName}
          onChange={(e) => update("companyName", e.target.value)}
          required
          placeholder="Talent ALB S.r.l."
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Website (opzionale)"
            name="website"
            value={form.website || ""}
            onChange={(e) => update("website", e.target.value)}
            type="url"
            placeholder="https://example.com"
          />
          <Field
            label="City (opzionale)"
            name="city"
            value={form.city || ""}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Bergamo"
          />
        </div>
      </div>

      <SubmitButton loading={loading}>Sign up as Company</SubmitButton>

      {error && <ErrorCard error={error} />}
      {result && <ResultCard data={result} />}
    </form>
  );
}

// ------------ App ------------

export default function App() {
  const [tab, setTab] = useState<"candidate" | "company">("candidate");

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
        <div className="max-w-md mx-auto p-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600">
              <span className="inline-block h-2 w-2 rounded-full bg-black" />
              Auth · Sign up
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Crea il tuo account</h1>
            <p className="text-sm text-gray-600">
              Demo UI per i tuoi endpoint Spring Boot. Nessuna dipendenza extra.
            </p>
          </header>

          <div className="mb-4 flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setTab("candidate")}
              className={cx(
                "flex-1 rounded-xl px-4 py-2 text-sm transition",
                tab === "candidate" ? "bg-black text-white shadow" : "hover:bg-gray-50"
              )}
            >
              Candidate
            </button>
            <button
              onClick={() => setTab("company")}
              className={cx(
                "flex-1 rounded-xl px-4 py-2 text-sm transition",
                tab === "company" ? "bg-black text-white shadow" : "hover:bg-gray-50"
              )}
            >
              Company
            </button>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            {tab === "candidate" ? <CandidateForm /> : <CompanyForm />}
          </div>

          <footer className="text-xs text-gray-500 mt-6 space-y-1">
            <p>
              Suggerimenti: valida i campi anche lato backend (Bean Validation),
              restituisci 400 con dettagli strutturati; esponi Swagger UI su <code>/swagger-ui</code>.
            </p>
            <p>In produzione usa HTTPS. Password: hash lato server (BCrypt/Argon2), mai in chiaro nei log.</p>
          </footer>
        </div>
      </div>
    </ToastProvider>
  );
}
