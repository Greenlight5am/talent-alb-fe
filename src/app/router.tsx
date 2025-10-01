import { createBrowserRouter, Navigate } from "react-router-dom";
import Signup from "@/app/features/auth/Signup";
import AppShell from "@/app/layouts/AppShell";
import CandidateDashboard from "@/app/features/candidate/pages/Dashboard";
import CandidateProfileEdit from "@/app/features/candidate/pages/ProfileEdit";
import CompanyDashboard from "@/app/features/company/pages/Dashboard";
import CompanyProfileEdit from "@/app/features/company/pages/CompanyProfileEdit";
import TalentSearch from "@/app/features/search/pages/TalentSearch";
import AppLanding from "@/app/features/home/AppLanding";
import JobBoardPage from "@/features/job-board/JobBoardPage";
import { ProtectedRoute, RoleSwitch } from "@/shared/components/Guard";
import { useTranslations } from "@/shared/i18n/I18nProvider";
import type { TranslationKey } from "@/shared/i18n/messages";

export const router = createBrowserRouter([
  { path: "/", element: <JobBoardPage /> },
  { path: "/auth/signup", element: <Signup /> },
  {
    path: "/app",
    element: <AppShell />,
    children: [
      { index: true, element: <AppLanding /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "search",
            element: (
              <RoleSwitch
                candidate={<Navigate to="/app/candidate" replace />}
                employer={<TalentSearch />}
                admin={<TalentSearch />}
              />
            ),
          },
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
          {
            path: "candidate/attachments",
            element: <ComingSoon translationKey="router.comingSoon.candidateAttachments" />,
          },
          {
            path: "candidate/skills",
            element: <ComingSoon translationKey="router.comingSoon.candidateSkills" />,
          },

          // Company
          { path: "company", element: <CompanyDashboard /> },
          { path: "company/profile", element: <CompanyProfileEdit /> },
          {
            path: "company/users",
            element: <ComingSoon translationKey="router.comingSoon.companyUsers" />,
          },
          {
            path: "company/jobs",
            element: <ComingSoon translationKey="router.comingSoon.companyJobs" />,
          },

          // Common (authed only)
          {
            path: "settings",
            element: <ComingSoon translationKey="router.comingSoon.accountSettings" />,
          },
        ],
      },
    ],
  },
  { path: "*", element: <div className="p-6">Not Found</div> },
]);

function ComingSoon({ translationKey }: { translationKey: TranslationKey }) {
  const t = useTranslations();
  return <div className="p-6">{t(translationKey)}</div>;
}
