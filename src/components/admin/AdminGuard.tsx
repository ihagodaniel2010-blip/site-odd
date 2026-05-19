import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminSession } from "@/hooks/useAdminSession";

export const AdminGuard = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { isAdmin, loading, error } = useAdminSession();

  useEffect(() => {
    if (!loading && isAdmin === false) {
      navigate("/admin/login", { replace: true, state: { error } });
    }
  }, [error, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return null;
  }

  return <>{children}</>;
};
