import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getSessionAccount } from "@/app/features/auth/useSession";

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const acc = getSessionAccount();
  if (!acc) return <Navigate to="/auth/login" replace />;
  return <>{children ?? <Outlet />}</>;
}

export function RoleSwitch({
  candidate,
  employer,
  admin,
  fallback = <Navigate to="/app" replace />,
}: {
  candidate?: React.ReactNode;
  employer?: React.ReactNode;
  admin?: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const acc = getSessionAccount();
  const roles = new Set(acc?.roles ?? []);
  if (roles.has("CANDIDATE") && candidate) return <>{candidate}</>;
  if (roles.has("EMPLOYER") && employer) return <>{employer}</>;
  if (roles.has("ADMIN") && admin) return <>{admin}</>;
  return <>{fallback}</>;
}
