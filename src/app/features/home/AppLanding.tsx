import { Link, Navigate } from "react-router-dom";
import { useSession } from "@/app/features/auth/useSession";
import { useTranslations } from "@/shared/i18n/I18nProvider";

const DASHBOARD_ROUTE = "/app/me";
const DEFAULT_ROLE_REDIRECTS = new Set(["CANDIDATE", "EMPLOYER", "ADMIN"]);

const primaryButtonClasses =
  "inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:bg-slate-800";
const secondaryButtonClasses =
  "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:bg-slate-50";

export default function AppLanding() {
  const { account } = useSession();
  const t = useTranslations();
  const roles = new Set(account?.roles ?? []);
  const hasKnownRole = Array.from(DEFAULT_ROLE_REDIRECTS).some((role) => roles.has(role));

  if (account && hasKnownRole) {
    return <Navigate to={DASHBOARD_ROUTE} replace />;
  }

  return (
    <div className="space-y-8 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          {t("landing.eyebrow")}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{t("landing.welcomeTitle")}</h1>
        <p className="mt-4 mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          {t("landing.welcomeDescription")}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link to="/auth/signup" className={primaryButtonClasses}>
            {t("common.actions.createAccount")}
          </Link>
          <Link to="/app/search" className={secondaryButtonClasses}>
            {t("common.actions.explore")}
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
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

      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8">
        <h2 className="text-xl font-semibold tracking-tight">{t("landing.guest.title")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          {t("landing.guest.description")}
        </p>
        <Link to="/auth/signup" className={`${primaryButtonClasses} mt-4 w-fit`}>
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
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm shadow-slate-900/5 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      <Link
        to={disabled ? "/auth/signup" : to}
        className={`${secondaryButtonClasses} mt-4 w-fit ${
          disabled ? "border-dashed text-slate-400 hover:-translate-y-0" : ""
        }`}
      >
        {disabled ? disabledLabel : actionLabel}
      </Link>
    </div>
  );
}
