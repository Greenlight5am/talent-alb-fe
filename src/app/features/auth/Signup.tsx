import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslations } from "@/shared/i18n/I18nProvider";
import { LanguageSwitcher } from "@/shared/i18n/LanguageSwitcher";
import type { AccountDto } from "@/app/features/auth/types";
import { postJson } from "@/app/features/auth/api";
import {
  ToastProvider,
  useToast,
  Field,
  PasswordField,
  SubmitButton,
  cx,
} from "@/app/features/auth/AuthComponents";

const PLATFORM_URL = "/app/me";
const REDIRECT_DELAY_MS = 1000;

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

function CandidateForm() {
  const { push } = useToast();
  const t = useTranslations();
  const [form, setForm] = useState<CandidateSignupReq>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    city: "",
  });
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
  const [form, setForm] = useState<CompanySignupReq>({
    email: "",
    password: "",
    companyName: "",
    website: "",
    city: "",
  });
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-black" />
                  {t("auth.signup.badge")}
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight">{t("auth.signup.title")}</h1>
                <p className="text-sm text-gray-600">{t("auth.signup.description")}</p>
              </div>
              <div className="flex flex-col items-end gap-2 sm:gap-3">
                <LanguageSwitcher
                  hideLabel
                  className="ml-auto"
                  selectClassName="bg-white px-4 py-1.5 text-xs font-semibold text-gray-600 shadow-sm border border-gray-200 hover:border-gray-300"
                />
                <Link
                  to="/"
                  className="text-xs font-semibold text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline"
                >
                  {t("common.actions.goBack")}
                </Link>
              </div>
            </div>
          </header>

          <div className="mb-4 flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setTab("candidate")}
              className={cx(
                "flex-1 rounded-xl px-4 py-2 text-sm transition",
                tab === "candidate" ? "bg-black text-white shadow" : "hover:bg-gray-50"
              )}
              type="button"
            >
              {t("auth.signup.tabs.candidate")}
            </button>
            <button
              onClick={() => setTab("company")}
              className={cx(
                "flex-1 rounded-xl px-4 py-2 text-sm transition",
                tab === "company" ? "bg-black text-white shadow" : "hover:bg-gray-50"
              )}
              type="button"
            >
              {t("auth.signup.tabs.company")}
            </button>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            {tab === "candidate" ? <CandidateForm /> : <CompanyForm />}
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            {t("auth.signup.footer.haveAccount")} {" "}
            <Link to="/auth/login" className="font-semibold text-gray-700 hover:text-gray-900">
              {t("auth.signup.footer.loginLink")}
            </Link>
          </p>
        </div>
      </div>
    </ToastProvider>
  );
}
