import React, { useState, createContext, useContext } from "react";
import { useTranslations } from "@/shared/i18n/I18nProvider";

const PLATFORM_URL = "/app/me";
const REDIRECT_DELAY_MS = 1000;

type UserRole = "CANDIDATE" | "EMPLOYER" | "ADMIN" | string;

type AccountDto = {
  id: string;
  email: string;
  roles?: UserRole[];
  [k: string]: unknown;
};

async function postJson<TReq, TRes>(url: string, body: TReq): Promise<TRes> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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

/* ---------------- Toast (no deps) ---------------- */
type ToastKind = "success" | "error" | "info";
type ToastMsg = { id: number; kind: ToastKind; title?: string; message: string; duration?: number };
const ToastCtx = createContext<{ push: (t: Omit<ToastMsg, "id">) => void } | null>(null);
export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const push = (t: Omit<ToastMsg, "id">) => {
    const id = Date.now() + Math.random();
    const toast: ToastMsg = { id, duration: 3000, ...t };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), toast.duration);
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
                <div className="whitespace-pre-wrap text-sm text-gray-700">{t.message}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------------- UI primitives ---------------- */
function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-800">
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
        "placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/80",
        props.className || ""
      )}
    />
  );
}

function Field({ label, name, ...rest }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...rest} />
    </div>
  );
}

type PasswordFieldProps = {
  label: string;
  showLabel: string;
  hideLabel: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
};

function PasswordField({ label, showLabel, hideLabel, value, onChange, required }: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label htmlFor="password">{label}</Label>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          className="pr-12"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
        >
          {show ? hideLabel : showLabel}
        </button>
      </div>
    </div>
  );
}

function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  const t = useTranslations();
  return (
    <button
      className={cx(
        "mt-2 w-full rounded-2xl bg-black p-3 text-white shadow transition",
        "disabled:cursor-not-allowed disabled:opacity-60 hover:bg-black/90"
      )}
      disabled={loading}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          {t("auth.signup.processing")}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/* ---------------- Forms ---------------- */
type CandidateSignupReq = { email: string; password: string; firstName: string; lastName: string; city?: string };
type CompanySignupReq = { email: string; password: string; companyName: string; website?: string; city?: string };

function CandidateForm() {
  const { push } = useToast();
  const t = useTranslations();
  const [form, setForm] = useState<CandidateSignupReq>({ email: "", password: "", firstName: "", lastName: "", city: "" });
  const [loading, setLoading] = useState(false);

  function update<K extends keyof CandidateSignupReq>(key: K, value: string) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        city: form.city?.trim() || undefined,
      };
      const account = await postJson<typeof payload, AccountDto>("/api/auth/signup/candidate", payload);
      localStorage.setItem("account", JSON.stringify(account));
      push({
        kind: "success",
        title: t("auth.signup.candidateSuccessTitle"),
        message: t("auth.signup.candidateSuccessBody"),
      });
      setTimeout(() => {
        window.location.href = PLATFORM_URL;
      }, REDIRECT_DELAY_MS);
    } catch (err: any) {
      push({ kind: "error", title: t("auth.signup.errorTitle"), message: err?.message ?? String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field
        label={t("auth.signup.fields.email")}
        name="email"
        value={form.email}
        onChange={(event) => update("email", event.target.value)}
        type="email"
        required
      />
      <PasswordField
        label={t("auth.signup.fields.password")}
        showLabel={t("auth.signup.passwordShow")}
        hideLabel={t("auth.signup.passwordHide")}
        value={form.password}
        onChange={(event) => update("password", event.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label={t("auth.signup.fields.firstName")}
          name="firstName"
          value={form.firstName}
          onChange={(event) => update("firstName", event.target.value)}
          required
        />
        <Field
          label={t("auth.signup.fields.lastName")}
          name="lastName"
          value={form.lastName}
          onChange={(event) => update("lastName", event.target.value)}
          required
        />
      </div>
      <Field
        label={t("auth.signup.cityOptional")}
        name="city"
        value={form.city || ""}
        onChange={(event) => update("city", event.target.value)}
      />
      <SubmitButton loading={loading}>{t("auth.signup.submitCandidate")}</SubmitButton>
    </form>
  );
}

function CompanyForm() {
  const { push } = useToast();
  const t = useTranslations();
  const [form, setForm] = useState<CompanySignupReq>({ email: "", password: "", companyName: "", website: "", city: "" });
  const [loading, setLoading] = useState(false);

  function update<K extends keyof CompanySignupReq>(key: K, value: string) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        email: form.email.trim(),
        companyName: form.companyName.trim(),
        website: form.website?.trim() || undefined,
        city: form.city?.trim() || undefined,
      };
      const account = await postJson<typeof payload, AccountDto>("/api/auth/signup/company", payload);
      localStorage.setItem("account", JSON.stringify(account));
      push({
        kind: "success",
        title: t("auth.signup.companySuccessTitle"),
        message: t("auth.signup.companySuccessBody"),
      });
      setTimeout(() => {
        window.location.href = PLATFORM_URL;
      }, REDIRECT_DELAY_MS);
    } catch (err: any) {
      push({ kind: "error", title: t("auth.signup.errorTitle"), message: err?.message ?? String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field
        label={t("auth.signup.fields.email")}
        name="email"
        value={form.email}
        onChange={(event) => update("email", event.target.value)}
        type="email"
        required
      />
      <PasswordField
        label={t("auth.signup.fields.password")}
        showLabel={t("auth.signup.passwordShow")}
        hideLabel={t("auth.signup.passwordHide")}
        value={form.password}
        onChange={(event) => update("password", event.target.value)}
        required
      />
      <Field
        label={t("auth.signup.fields.companyName")}
        name="companyName"
        value={form.companyName}
        onChange={(event) => update("companyName", event.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label={t("auth.signup.fields.website")}
          name="website"
          value={form.website || ""}
          onChange={(event) => update("website", event.target.value)}
          placeholder="https://…"
        />
        <Field
          label={t("auth.signup.cityOptional")}
          name="city"
          value={form.city || ""}
          onChange={(event) => update("city", event.target.value)}
        />
      </div>
      <SubmitButton loading={loading}>{t("auth.signup.submitCompany")}</SubmitButton>
    </form>
  );
}

export default function Signup() {
  const t = useTranslations();
  const [tab, setTab] = useState<"candidate" | "company">("candidate");

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
        <div className="mx-auto max-w-md p-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600">
              <span className="inline-block h-2 w-2 rounded-full bg-black" />
              {t("auth.signup.badge")}
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">{t("auth.signup.title")}</h1>
            <p className="text-sm text-gray-600">{t("auth.signup.description")}</p>
          </header>

          <div className="mb-4 flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setTab("candidate")}
              className={cx(
                "flex-1 rounded-xl px-4 py-2 text-sm transition",
                tab === "candidate" ? "bg-black text-white shadow" : "hover:bg-gray-50"
              )}
            >
              {t("auth.signup.tabs.candidate")}
            </button>
            <button
              onClick={() => setTab("company")}
              className={cx(
                "flex-1 rounded-xl px-4 py-2 text-sm transition",
                tab === "company" ? "bg-black text-white shadow" : "hover:bg-gray-50"
              )}
            >
              {t("auth.signup.tabs.company")}
            </button>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            {tab === "candidate" ? <CandidateForm /> : <CompanyForm />}
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
