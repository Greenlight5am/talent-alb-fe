import { createBrowserRouter, Navigate } from "react-router-dom";
// router.tsx (e ovunque serva)
import Signup from "@/app/features/auth/Signup";
import AppShell from "@/app/layouts/AppShell";
import CandidateDashboard from "@/app/features/candidate/pages/Dashboard";
import CandidateProfileEdit from "@/app/features/candidate/pages/ProfileEdit";
import CompanyDashboard from "@/app/features/company/pages/Dashboard";
import CompanyProfileEdit from "@/app/features/company/pages/CompanyProfileEdit";
import TalentSearch from "@/app/features/search/pages/TalentSearch";
import { ProtectedRoute, RoleSwitch } from "@/shared/components/Guard";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/auth/signup" replace /> },
  { path: "/auth/signup", element: <Signup /> },

  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { path: "", element: <Navigate to="me" replace /> },
      {
        path: "me",
        element: (
          <RoleSwitch
            candidate={<Navigate to="/app/candidate" replace />}
            employer={<Navigate to="/app/company" replace />}
            admin={<Navigate to="/app/company" replace />}
          />
        ),
      },

      // Candidate
      { path: "candidate", element: <CandidateDashboard /> },
      { path: "candidate/profile", element: <CandidateProfileEdit /> },
      { path: "candidate/attachments", element: <div>CV & Allegati (coming soon)</div> },
      { path: "candidate/skills", element: <div>Competenze (coming soon)</div> },

      // Company
      { path: "company", element: <CompanyDashboard /> },
      { path: "company/profile", element: <CompanyProfileEdit /> },
      { path: "company/users", element: <div>Utenti azienda (coming soon)</div> },
      { path: "company/jobs", element: <div>Offerte di lavoro (coming soon)</div> },

      // Common
      { path: "search", element: <TalentSearch /> },
      { path: "settings", element: <div>Impostazioni account (coming soon)</div> },
    ],
  },

  { path: "*", element: <div className="p-6">Not Found</div> },
]);
