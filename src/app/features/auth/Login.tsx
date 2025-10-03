import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslations } from "@/shared/i18n/I18nProvider";
import { LanguageSwitcher } from "@/shared/i18n/LanguageSwitcher";
import { getSessionAccount } from "@/app/features/auth/useSession";
import type { AccountDto } from "@/app/features/auth/types";
import { postJson } from "@/app/features/auth/api";
import {
  ToastProvider,
  useToast,
  Field,
  PasswordField,
  SubmitButton,
} from "@/app/features/auth/AuthComponents";

const PLATFORM_URL = "/app/me";
const REDIRECT_DELAY_MS = 1000;

type LoginFormState = {
  email: string;
  password: string;
};

function LoginForm() {
  const { push } = useToast();
  const t = useTranslations();
  const [form, setForm] = useState<LoginFormState>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = {
        email: form.email.trim(),
        password: form.password,
      };
      const account = await postJson<typeof payload, AccountDto>("/api/auth/login", payload);
      localStorage.setItem("account", JSON.stringify(account));
      push({
        kind: "success",
        title: t("auth.login.successTitle"),
        message: t("auth.login.successBody"),
      });
      setTimeout(() => {
        window.location.href = PLATFORM_URL;
      }, REDIRECT_DELAY_MS);
    } catch (err: any) {
      push({
        kind: "error",
        title: t("auth.login.errorTitle"),
        message: err?.message ?? String(err),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field
        label={t("auth.login.fields.email")}
        name="email"
        type="email"
        value={form.email}
        onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        required
      />
      <PasswordField
        label={t("auth.login.fields.password")}
        showLabel={t("auth.signup.passwordShow")}
        hideLabel={t("auth.signup.passwordHide")}
        value={form.password}
        onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
        required
      />
      <SubmitButton loading={loading} loadingLabel={t("auth.login.processing")}>
        {t("auth.login.submit")}
      </SubmitButton>
    </form>
  );
}

export default function Login() {
  const t = useTranslations();
  const account = getSessionAccount();

  if (account) {
    return <Navigate to={PLATFORM_URL} replace />;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
        <div className="mx-auto max-w-md p-6">
          <header className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-black" />
                  {t("auth.login.badge")}
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight">{t("auth.login.title")}</h1>
                <p className="text-sm text-gray-600">{t("auth.login.description")}</p>
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

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            {t("auth.login.footer.noAccount")} {" "}
            <Link to="/auth/signup" className="font-semibold text-gray-700 hover:text-gray-900">
              {t("auth.login.footer.signupLink")}
            </Link>
          </p>
        </div>
      </div>
    </ToastProvider>
  );
}
