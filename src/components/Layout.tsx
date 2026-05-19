import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileLeadBar } from "./MobileLeadBar";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const Layout = ({ children }: { children: ReactNode }) => {
  useScrollReveal();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20 pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileLeadBar />
    </div>
  );
};
