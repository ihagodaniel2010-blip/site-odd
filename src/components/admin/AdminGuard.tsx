import { ReactNode } from "react";

// TEMPORARY: Auth disabled. Anyone can access /admin.
// TODO: Re-enable proper auth check before going to production.
export const AdminGuard = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};
