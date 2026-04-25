import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const Layout = ({ children }: { children: ReactNode }) => {
  useScrollReveal();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
};
