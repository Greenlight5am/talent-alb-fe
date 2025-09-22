import React, { useState, createContext, useContext } from "react";

const PLATFORM_URL = "/app/me";
const REDIRECT_DELAY_MS = 1000;

type UserRole = "CANDIDATE" | "EMPLOYER" | "ADMIN" | string;

type AccountDto = {
  id: string;
  email: string;
  roles?: UserRole[]; // Set<UserRole> mappato a array
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
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{t.message}</div>
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
  return <label htmlFor={htmlFor} className="block text-sm font-medium mb-1 text-gray-800">{children}</label>;
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
function Field({ label, name, ...rest }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...rest} />
    </div>
  );
}
function PasswordField({ value, onChange, required }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label htmlFor="password">Password</Label>
      <div className="relative">
        <Input id="password" name="password" type={show ? "text" : "password"} value={value} onChange={onChange} required={required} className="pr-12" />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button className={cx("w-full rounded-2xl p-3 mt-2 bg-black text-white shadow transition","disabled:opacity-60 disabled:cursor-not-allowed hover:bg-black/90")} disabled={loading}>
      {loading ? <span className="inline-flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Processing…</span> : children}
    </button>
  );
}

/* ---------------- Forms ---------------- */
type CandidateSignupReq = { email: string; password: string; firstName: string; lastName: string; city?: string; };
type CompanySignupReq   = { email: string; password: string; companyName: string; website?: string; city?: string; };

function CandidateForm() {
  const { push } = useToast();
  const [form, setForm] = useState<CandidateSignupReq>({ email: "", password: "", firstName: "", lastName: "", city: "" });
  const [loading, setLoading] = useState(false);
  function update<K extends keyof CandidateSignupReq>(key: K, v: string) { setForm((f) => ({ ...f, [key]: v })); }
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, email: form.email.trim(), firstName: form.firstName.trim(), lastName: form.lastName.trim(), city: form.city?.trim() || undefined };
      const acc = await postJson<typeof payload, AccountDto>("/api/auth/signup/candidate", payload);
      // mock-session
      localStorage.setItem("account", JSON.stringify(acc));
      push({ kind: "success", title: "Registrazione completata", message: "Benvenuto! Ti reindirizzo…" });
      setTimeout(() => (window.location.href = PLATFORM_URL), REDIRECT_DELAY_MS);
    } catch (err: any) {
      push({ kind: "error", title: "Errore", message: err?.message ?? String(err) });
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field label="Email" name="email" value={form.email} onChange={(e) => update("email", e.target.value)} type="email" required />
      <PasswordField value={form.password} onChange={(e) => update("password", e.target.value)} required />
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" name="firstName" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required />
        <Field label="Last name"  name="lastName"  value={form.lastName}  onChange={(e) => update("lastName", e.target.value)}  required />
      </div>
      <Field label="City (opz.)" name="city" value={form.city || ""} onChange={(e) => update("city", e.target.value)} />
      <SubmitButton loading={loading}>Sign up as Candidate</SubmitButton>
    </form>
  );
}

function CompanyForm() {
  const { push } = useToast();
  const [form, setForm] = useState<CompanySignupReq>({ email: "", password: "", companyName: "", website: "", city: "" });
  const [loading, setLoading] = useState(false);
  function update<K extends keyof CompanySignupReq>(key: K, v: string) { setForm((f) => ({ ...f, [key]: v })); }
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, email: form.email.trim(), companyName: form.companyName.trim(), website: form.website?.trim() || undefined, city: form.city?.trim() || undefined };
      const acc = await postJson<typeof payload, AccountDto>("/api/auth/signup/company", payload);
      localStorage.setItem("account", JSON.stringify(acc));
      push({ kind: "success", title: "Azienda registrata", message: "Ti porto alla piattaforma…" });
      setTimeout(() => (window.location.href = PLATFORM_URL), REDIRECT_DELAY_MS);
    } catch (err: any) {
      push({ kind: "error", title: "Errore", message: err?.message ?? String(err) });
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field label="Email" name="email" value={form.email} onChange={(e) => update("email", e.target.value)} type="email" required />
      <PasswordField value={form.password} onChange={(e) => update("password", e.target.value)} required />
      <Field label="Company name" name="companyName" value={form.companyName} onChange={(e) => update("companyName", e.target.value)} required />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Website (opz.)" name="website" value={form.website || ""} onChange={(e) => update("website", e.target.value)} placeholder="https://…" />
        <Field label="City (opz.)"    name="city"    value={form.city || ""}    onChange={(e) => update("city", e.target.value)} />
      </div>
      <SubmitButton loading={loading}>Sign up as Company</SubmitButton>
    </form>
  );
}

export default function Signup() {
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
            <p className="text-sm text-gray-600">Bozza piattaforma: nessuna sicurezza, sessione mock su localStorage.</p>
          </header>

          <div className="mb-4 flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
            <button onClick={() => setTab("candidate")} className={cx("flex-1 rounded-xl px-4 py-2 text-sm transition", tab === "candidate" ? "bg-black text-white shadow" : "hover:bg-gray-50")}>Candidate</button>
            <button onClick={() => setTab("company")}   className={cx("flex-1 rounded-xl px-4 py-2 text-sm transition", tab === "company"   ? "bg-black text-white shadow" : "hover:bg-gray-50")}>Company</button>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            {tab === "candidate" ? <CandidateForm /> : <CompanyForm />}
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
