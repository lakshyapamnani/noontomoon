import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import type { Role } from "@/types";

export function RequireRole({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const session = useAuthStore((s) => s.session);
  const location = useLocation();

  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!allow.includes(session.role)) return <Navigate to="/launcher" replace />;
  return children;
}

