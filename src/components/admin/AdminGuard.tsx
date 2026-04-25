import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminSession } from "@/hooks/useAdminSession";

export const AdminGuard = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { session, isAdmin, loading } = useAdminSession();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <p className="text-sm text-muted-foreground">Checking admin session...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="font-display text-2xl font-semibold text-foreground">Admin access required</h1>
          <p className="text-sm text-muted-foreground">
            Your account is signed in but does not have admin permission.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
