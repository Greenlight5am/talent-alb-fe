import { Link } from "react-router-dom";
import { getSessionAccount } from "@/app/features/auth/useSession";
import { useTranslations } from "@/shared/i18n/I18nProvider";

export default function CandidateDashboard() {
  const acc = getSessionAccount();
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("candidateDashboard.greeting", { email: acc?.email ?? "" })}</h1>
      <p className="text-gray-600">{t("candidateDashboard.intro")}</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card
          title={t("candidateDashboard.cards.profile.title")}
          body={(
            <>
              <p className="text-sm text-gray-600">{t("candidateDashboard.cards.profile.description")}</p>
              <Link to="/app/candidate/profile" className="mt-3 inline-block rounded-xl bg-black px-3 py-2 text-sm text-white">
                {t("candidateDashboard.cards.profile.cta")}
              </Link>
            </>
          )}
        />
        <Card
          title={t("candidateDashboard.cards.attachments.title")}
          body={(
            <>
              <p className="text-sm text-gray-600">{t("candidateDashboard.cards.attachments.description")}</p>
              <Link to="/app/candidate/attachments" className="mt-3 inline-block rounded-xl border px-3 py-2 text-sm">
                {t("candidateDashboard.cards.attachments.cta")}
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
      <div>{body}</div>
    </div>
  );
}
