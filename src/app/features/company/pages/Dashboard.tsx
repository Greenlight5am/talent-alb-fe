import { Link } from "react-router-dom";
import { getSessionAccount } from "@/app/features/auth/useSession";
import { useTranslations } from "@/shared/i18n/I18nProvider";

export default function CompanyDashboard() {
  const acc = getSessionAccount();
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t("companyDashboard.greeting", { email: acc?.email ?? "" })}</h1>
          <p className="text-slate-600">{t("companyDashboard.intro")}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/app/search" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
            {t("appShell.menu.common.search")}
          </Link>
          <Link to="/app/company/profile" className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            {t("companyDashboard.cards.profile.cta")}
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card
          title={t("companyDashboard.cards.profile.title")}
          body={(
            <>
              <p className="text-sm text-gray-600">{t("companyDashboard.cards.profile.description")}</p>
              <Link to="/app/company/profile" className="mt-3 inline-block rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                {t("companyDashboard.cards.profile.cta")}
              </Link>
            </>
          )}
        />
        <Card
          title={t("companyDashboard.cards.team.title")}
          body={(
            <>
              <p className="text-sm text-gray-600">{t("companyDashboard.cards.team.description")}</p>
              <Link to="/app/company/users" className="mt-3 inline-block rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                {t("companyDashboard.cards.team.cta")}
              </Link>
            </>
          )}
        />
      </div>
    </div>
  );
}

function Card({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-1.5 text-base font-semibold text-slate-900">{title}</div>
      <div>{body}</div>
    </div>
  );
}
