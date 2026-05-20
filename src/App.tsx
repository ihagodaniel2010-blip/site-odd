import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy, useEffect } from "react";
import { useLocation } from "react-router-dom";

import Index from "./pages/Index.tsx";
import { LOCAL_HOUSE_CLEANING_PAGES } from "./data/localSeo";

const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const HouseCleaning = lazy(() => import("./pages/HouseCleaning.tsx"));
const CommercialCleaning = lazy(() => import("./pages/CommercialCleaning.tsx"));
const DeepCleaning = lazy(() => import("./pages/DeepCleaning.tsx"));
const MoveInOut = lazy(() => import("./pages/MoveInOut.tsx"));
const RecurringCleaning = lazy(() => import("./pages/RecurringCleaning.tsx"));
const OfficeCleaning = lazy(() => import("./pages/OfficeCleaning.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const AreasWeServePage = lazy(() => import("./pages/AreasWeServePage.tsx"));
const Services = lazy(() => import("./pages/Services.tsx"));
const Portfolio = lazy(() => import("./pages/Portfolio.tsx"));
const LocalServicePage = lazy(async () => {
  const mod = await import("./pages/LocalServicePage.tsx");
  return { default: mod.LocalServicePage };
});

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.tsx"));
const AdminRequests = lazy(() => import("./pages/admin/AdminEstimates.tsx"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing.tsx"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers.tsx"));
const AdminAreas = lazy(() => import("./pages/admin/AdminAreas.tsx"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings.tsx"));
const AdminCalendar = lazy(() => import("./pages/admin/AdminCalendar.tsx"));
const AdminPortfolio = lazy(() => import("./pages/admin/AdminPortfolio.tsx"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices.tsx"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia.tsx"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages.tsx"));
const AdminCleaners = lazy(() => import("./pages/admin/AdminCleaners.tsx"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="container py-16" aria-busy="true" aria-live="polite">
    <div className="h-10 w-56 rounded-xl bg-secondary/60 animate-pulse" />
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/house-cleaning" element={<HouseCleaning />} />
            <Route path="/commercial-cleaning" element={<CommercialCleaning />} />
            <Route path="/deep-cleaning" element={<DeepCleaning />} />
            <Route path="/move-in-move-out" element={<MoveInOut />} />
            <Route path="/recurring-cleaning" element={<RecurringCleaning />} />
            <Route path="/office-cleaning" element={<OfficeCleaning />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/areas-we-serve" element={<AreasWeServePage />} />
            <Route path="/services" element={<Services />} />
            <Route path="/portfolio" element={<Portfolio />} />

            {LOCAL_HOUSE_CLEANING_PAGES.map((page) => (
              <Route
                key={page.path}
                path={page.path}
                element={<LocalServicePage page={page} />}
              />
            ))}

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/requests" element={<AdminRequests />} />
            <Route path="/admin/estimates" element={<Navigate to="/admin/requests" replace />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/areas" element={<AdminAreas />} />
            <Route path="/admin/areas-we-serve" element={<Navigate to="/admin/areas" replace />} />
            <Route path="/admin/service-areas" element={<Navigate to="/admin/areas" replace />} />
            <Route path="/admin/locations" element={<Navigate to="/admin/areas" replace />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/bookings" element={<AdminCalendar />} />
            <Route path="/admin/calendar" element={<Navigate to="/admin/bookings" replace />} />
            <Route path="/admin/portfolio" element={<AdminPortfolio />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/media" element={<AdminMedia />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="/admin/cleaners" element={<AdminCleaners />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
