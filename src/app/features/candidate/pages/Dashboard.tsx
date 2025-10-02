import { Link } from "react-router-dom";
import { getSessionAccount } from "@/app/features/auth/useSession";
import { formatJobApplicationDate, useJobApplicationsStorage } from "@/features/job-board/useJobApplicationsStorage";
import { useI18n, useTranslations } from "@/shared/i18n/I18nProvider";
import { localeConfig } from "@/shared/i18n/localeConfig";

export default function CandidateDashboard() {
  const acc = getSessionAccount();
  const t = useTranslations();
  const { locale } = useI18n();
  const formats = localeConfig[locale];
  const [applications] = useJobApplicationsStorage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t("candidateDashboard.greeting", { email: acc?.email ?? "" })}
          </h1>
          <p className="text-slate-600">{t("candidateDashboard.intro")}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/app/candidate/profile"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            {t("candidateDashboard.cards.profile.cta")}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card
          title={t("candidateDashboard.cards.profile.title")}
          body={(
            <>
              <p className="text-sm text-gray-600">{t("candidateDashboard.cards.profile.description")}</p>
              <Link
                to="/app/candidate/profile"
                className="mt-3 inline-block rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
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
              <Link
                to="/app/candidate/attachments"
                className="mt-3 inline-block rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {t("candidateDashboard.cards.attachments.cta")}
              </Link>
            </>
          )}
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{t("jobBoard.applications.title")}</h2>
            <p className="text-sm text-slate-600">{t("jobBoard.applications.description")}</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {t("jobBoard.nav.offers")}
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            {t("jobBoard.applications.empty", { cta: t("common.actions.applyNow") })}
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {applications.map((app) => (
              <li key={app.id} className="rounded-xl border border-slate-200 p-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{app.jobTitle}</h3>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("jobBoard.applications.submittedAt", {
                      date: formatJobApplicationDate(app.createdAt, formats.date),
                    })}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-900">{app.candidateName}</span>
                    {app.email && <span className="text-slate-500"> - {app.email}</span>}
                  </p>
                  {app.phone && (
                    <p>
                      {t("jobBoard.applications.phoneLabel")}: {app.phone}
                    </p>
                  )}
                  {app.resumeUrl && (
                    <p>
                      {t("jobBoard.applications.resumeLabel")}: {" "}
                      <a
                        href={app.resumeUrl}
                        className="text-slate-900 underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {app.resumeUrl}
                      </a>
                    </p>
                  )}
                  {app.message && <p className="italic text-slate-500">"{app.message}"</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
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
