import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center max-w-md space-y-5">
        <p className="font-display text-7xl font-bold text-primary">404</p>
        <h1 className="font-display text-3xl font-semibold text-foreground">Page Not Found</h1>
        <p className="text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <Button asChild variant="hero" size="lg">
          <Link to="/">Back Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
