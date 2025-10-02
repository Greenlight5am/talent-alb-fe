import { NavLink, Outlet } from "react-router-dom";
import { getSessionAccount, clearSessionAccount } from "@/app/features/auth/useSession";
import { useTranslations } from "@/shared/i18n/I18nProvider";

import { LanguageSwitcher } from "@/shared/i18n/LanguageSwitcher";


export default function AppShell() {
  const acc = getSessionAccount();
  const roles = new Set(acc?.roles ?? []);
  const isGuest = !acc;
  const t = useTranslations();

  const candidateMenu = [
    { to: "/app/candidate", label: t("appShell.menu.candidate.dashboard"), end: true },
    { to: "/app/candidate/profile", label: t("appShell.menu.candidate.profile") },
    { to: "/app/candidate/attachments", label: t("appShell.menu.candidate.attachments") },
    { to: "/app/candidate/skills", label: t("appShell.menu.candidate.skills") },
  ];
  const companyMenu = [
    { to: "/app/company", label: t("appShell.menu.company.dashboard"), end: true },
    { to: "/app/company/profile", label: t("appShell.menu.company.profile") },
    { to: "/app/company/users", label: t("appShell.menu.company.users") },
    { to: "/app/company/jobs", label: t("appShell.menu.company.jobs") },
    { to: "/app/search", label: t("appShell.menu.common.search") },
  ];
  const commonMenu = [
    ...(!isGuest ? [{ to: "/app/settings", label: t("appShell.menu.common.settings") }] : []),
  ];

  const sections: Array<{ title: string; items: NavItem[] }> = [];
  if (roles.has("CANDIDATE")) {
    sections.push({ title: t("appShell.sections.candidate"), items: candidateMenu });
  }
  if (roles.has("EMPLOYER") || roles.has("ADMIN")) {
    sections.push({ title: t("appShell.sections.company"), items: companyMenu });
  }
  sections.push({ title: t("appShell.sections.common"), items: commonMenu });

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:py-12">
        <aside className="lg:w-72">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-10 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                {t("common.appName")}
              </span>
              <p className="break-all text-base font-semibold text-slate-900">
                {acc?.email ?? t("appShell.session.guest")}
              </p>
            </div>
            <LanguageSwitcher
              hideLabel
              className="mt-6 ml-auto"
              selectClassName="bg-slate-50 hover:bg-white"
            />
            <nav className="mt-6 space-y-6 text-sm">
              {sections.map((section) => (
                <NavSection key={section.title} title={section.title} items={section.items} />
              ))}
            </nav>
            {!isGuest && (
              <button
                onClick={() => {
                  clearSessionAccount();
                  window.location.href = "/app";
                }}
                className="mt-6 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-transform duration-150 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900"
              >
                {t("common.actions.logout")}
              </button>
            )}
          </div>
        </aside>
        <main className="flex-1">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {isGuest && (
              <div className="mb-6 flex flex-wrap justify-end gap-3">
                <button
                  onClick={() => {
                    window.location.href = "/auth/signup";
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  {t("common.actions.registerNow")}
                </button>
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

type NavItem = { to: string; label: string; end?: boolean };

function Item({ to, label, end }: NavItem) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block transform rounded-2xl px-3 py-2 text-sm font-medium transition-all duration-150 ${
          isActive
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-600 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">{title}</p>
      <div className="mt-3 space-y-1.5">
        {items.map((item) => (
          <Item key={item.to} {...item} />
        ))}
      </div>
    </div>
  );
}
