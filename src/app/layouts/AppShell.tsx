import { NavLink, Outlet } from "react-router-dom";
import { getSessionAccount, clearSessionAccount } from "@/app/features/auth/useSession";

export default function AppShell() {
  const acc = getSessionAccount();
  const roles = new Set(acc?.roles ?? []);

  const candidateMenu = [
    { to: "/app/candidate", label: "Dashboard" },
    { to: "/app/candidate/profile", label: "Il mio profilo" },
    { to: "/app/candidate/attachments", label: "CV & Allegati" },
    { to: "/app/candidate/skills", label: "Competenze" },
  ];
  const companyMenu = [
    { to: "/app/company", label: "Dashboard" },
    { to: "/app/company/profile", label: "Profilo azienda" },
    { to: "/app/company/users", label: "Utenti" },
    { to: "/app/company/jobs", label: "Offerte di lavoro" },
  ];
  const commonMenu = [
    { to: "/app/search", label: "Cerca talenti" },
    { to: "/app/settings", label: "Impostazioni" },
  ];

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r bg-white p-4">
        <div className="mb-6">
          <div className="font-bold">TalentALB</div>
          <div className="text-xs text-gray-500 break-all">{acc?.email}</div>
        </div>
        <nav className="space-y-1">
          {roles.has("CANDIDATE") && candidateMenu.map((m) => <Item key={m.to} {...m} />)}
          {roles.has("EMPLOYER")  && companyMenu.map((m) => <Item key={m.to} {...m} />)}
          <div className="pt-2 border-t mt-2">{commonMenu.map((m) => <Item key={m.to} {...m} />)}</div>
          <button
            onClick={() => { clearSessionAccount(); window.location.href = "/auth/signup"; }}
            className="mt-4 text-left w-full rounded-xl px-3 py-2 text-sm hover:bg-gray-50"
          >
            Logout
          </button>
        </nav>
      </aside>
      <main className="p-6">
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
