import { Link, Navigate } from "react-router-dom";
import { useSession } from "@/app/features/auth/useSession";
import { useTranslations } from "@/shared/i18n/I18nProvider";

const DASHBOARD_ROUTE = "/app/me";
const DEFAULT_ROLE_REDIRECTS = new Set(["CANDIDATE", "EMPLOYER", "ADMIN"]);

export default function AppLanding() {
  const { account } = useSession();
  const t = useTranslations();
  const roles = new Set(account?.roles ?? []);
  const hasKnownRole = Array.from(DEFAULT_ROLE_REDIRECTS).some((role) => roles.has(role));

  if (account && hasKnownRole) {
    return <Navigate to={DASHBOARD_ROUTE} replace />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">{t("landing.welcomeTitle")}</h1>
        <p className="mt-3 max-w-2xl text-gray-600">{t("landing.welcomeDescription")}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            to="/auth/signup"
            className="rounded-2xl bg-black px-5 py-2 text-sm font-medium text-white shadow transition hover:bg-black/90"
          >
            {t("common.actions.createAccount")}
          </Link>
          <Link
            to="/app/search"
            className="rounded-2xl border border-gray-200 px-5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            {t("common.actions.explore")}
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <FeatureCard
          title={t("landing.candidates.title")}
          description={t("landing.candidates.description")}
          actionLabel={t("landing.candidates.demoCta")}
          disabledLabel={t("common.actions.registerToContinue")}
          to="/app/candidate"
          disabled={!account}
        />
        <FeatureCard
          title={t("landing.companies.title")}
          description={t("landing.companies.description")}
          actionLabel={t("landing.companies.demoCta")}
          disabledLabel={t("common.actions.registerToContinue")}
          to="/app/company"
          disabled={!account}
        />
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">{t("landing.guest.title")}</h2>
        <p className="mt-2 text-gray-600">{t("landing.guest.description")}</p>
        <Link
          to="/auth/signup"
          className="mt-4 inline-flex rounded-2xl bg-black px-5 py-2 text-sm font-medium text-white shadow transition hover:bg-black/90"
        >
          {t("common.actions.registerNow")}
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  actionLabel,
  disabledLabel,
  to,
  disabled,
}: {
  title: string;
  description: string;
  actionLabel: string;
  disabledLabel: string;
  to: string;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      <Link
        to={disabled ? "/auth/signup" : to}
        className="mt-4 inline-flex rounded-2xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
      >
        {disabled ? disabledLabel : actionLabel}
      </Link>
    </div>
  );
}
