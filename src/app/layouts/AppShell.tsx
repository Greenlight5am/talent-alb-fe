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
    { to: "/app/candidate", label: t("appShell.menu.candidate.dashboard") },
    { to: "/app/candidate/profile", label: t("appShell.menu.candidate.profile") },
    { to: "/app/candidate/attachments", label: t("appShell.menu.candidate.attachments") },
    { to: "/app/candidate/skills", label: t("appShell.menu.candidate.skills") },
  ];
  const companyMenu = [
    { to: "/app/company", label: t("appShell.menu.company.dashboard") },
    { to: "/app/company/profile", label: t("appShell.menu.company.profile") },
    { to: "/app/company/users", label: t("appShell.menu.company.users") },
    { to: "/app/company/jobs", label: t("appShell.menu.company.jobs") },
  ];
  const commonMenu = [
    { to: "/app/search", label: t("appShell.menu.common.search") },
    ...(!isGuest ? [{ to: "/app/settings", label: t("appShell.menu.common.settings") }] : []),
  ];

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r bg-white p-4">
        <div className="mb-6 space-y-1">
          <div className="font-bold">{t("common.appName")}</div>
          <div className="text-xs text-gray-500 break-all">{acc?.email ?? t("appShell.session.guest")}</div>
        </div>
        <LanguageSwitcher className="mb-6" />
        <nav className="space-y-1">
          {roles.has("CANDIDATE") && candidateMenu.map((m) => <Item key={m.to} {...m} />)}
          {roles.has("EMPLOYER")  && companyMenu.map((m) => <Item key={m.to} {...m} />)}
          <div className="pt-2 mt-2 space-y-1 border-t">
            {commonMenu.map((m) => (
              <Item key={m.to} {...m} />
            ))}
          </div>
          {!isGuest && (
            <button
              onClick={() => {
                clearSessionAccount();
                window.location.href = "/app";
              }}
              className="mt-4 w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              {t("common.actions.logout")}
            </button>
          )}
        </nav>
      </aside>
      <main className="p-6">
        {isGuest && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => {
                window.location.href = "/auth/signup";
              }}
              className="rounded-2xl bg-black px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-black/90"
            >
              {t("common.actions.registerNow")}
            </button>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}

function Item({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-xl px-3 py-2 text-sm ${isActive ? "bg-black text-white" : "hover:bg-gray-50"}`
      }
    >
      {label}
    </NavLink>
  );
}
