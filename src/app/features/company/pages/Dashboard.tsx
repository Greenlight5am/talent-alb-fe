import { Link } from "react-router-dom";
import { getSessionAccount } from "@/app/features/auth/useSession";
import { useTranslations } from "@/shared/i18n/I18nProvider";

export default function CompanyDashboard() {
  const acc = getSessionAccount();
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("companyDashboard.greeting", { email: acc?.email ?? "" })}</h1>
      <p className="text-gray-600">{t("companyDashboard.intro")}</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card
          title={t("companyDashboard.cards.profile.title")}
          body={(
            <>
              <p className="text-sm text-gray-600">{t("companyDashboard.cards.profile.description")}</p>
              <Link to="/app/company/profile" className="mt-3 inline-block rounded-xl bg-black px-3 py-2 text-sm text-white">
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
              <Link to="/app/company/users" className="mt-3 inline-block rounded-xl border px-3 py-2 text-sm">
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
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-2 font-medium">{title}</div>
      {body}
    </div>
  );
}
