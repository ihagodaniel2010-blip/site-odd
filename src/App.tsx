import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import HouseCleaning from "./pages/HouseCleaning.tsx";
import CommercialCleaning from "./pages/CommercialCleaning.tsx";
import DeepCleaning from "./pages/DeepCleaning.tsx";
import MoveInOut from "./pages/MoveInOut.tsx";
import RecurringCleaning from "./pages/RecurringCleaning.tsx";
import OfficeCleaning from "./pages/OfficeCleaning.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import AreasWeServePage from "./pages/AreasWeServePage.tsx";
import Services from "./pages/Services.tsx";
import Portfolio from "./pages/Portfolio.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminEstimates from "./pages/admin/AdminEstimates.tsx";
import AdminPricing from "./pages/admin/AdminPricing.tsx";
import AdminCustomers from "./pages/admin/AdminCustomers.tsx";
import AdminAreas from "./pages/admin/AdminAreas.tsx";
import AdminSettings from "./pages/admin/AdminSettings.tsx";
import { AdminCalendar } from "./pages/admin/AdminPlaceholder.tsx";
import AdminPortfolio from "./pages/admin/AdminPortfolio.tsx";
import AdminServices from "./pages/admin/AdminServices.tsx";
import AdminMedia from "./pages/admin/AdminMedia.tsx";
import AdminMessages from "./pages/admin/AdminMessages.tsx";

const queryClient = new QueryClient();

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
      <BrowserRouter>
        <ScrollToTop />
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

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/estimates" element={<AdminEstimates />} />
          <Route path="/admin/pricing" element={<AdminPricing />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/areas" element={<AdminAreas />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/calendar" element={<AdminCalendar />} />
          <Route path="/admin/portfolio" element={<AdminPortfolio />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/media" element={<AdminMedia />} />
          <Route path="/admin/messages" element={<AdminMessages />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
