import { useEffect, useState } from "react";
import {
  clearBrokenSupabaseSession,
  getAuthErrorEventName,
  getSafeSession,
  safeSignOut,
  supabase,
} from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export const useAdminSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = loading
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkRole = async (userId: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 10000);

      const { data, error: queryError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle()
        .abortSignal(controller.signal);

      window.clearTimeout(timeoutId);

      if (queryError) {
        setError(queryError.message);
        setIsAdmin(false);
        return;
      }

      const authorized = !!data;
      setIsAdmin(authorized);
      setError(authorized ? null : "Your account is signed in, but it is not authorized for admin access yet.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to verify admin access";
      if (message.toLowerCase().includes("abort")) {
        setError("Admin verification timed out. Please try again.");
      } else {
        setError(message);
      }
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      if (!mounted) return;

      setSession(s);
      if (s?.user) {
        window.setTimeout(() => {
          if (mounted) {
            void checkRole(s.user.id);
          }
        }, 0);
      } else {
        setIsAdmin(false);
        setError(null);
        setLoading(false);
      }
    });

    const authErrorHandler = (event: Event) => {
      if (!mounted) return;
      const detail = event instanceof CustomEvent ? String(event.detail || "Authentication failed") : "Authentication failed";
      setSession(null);
      setIsAdmin(false);
      setError(detail);
      setLoading(false);
    };

    window.addEventListener(getAuthErrorEventName(), authErrorHandler as EventListener);

    void (async () => {
      const safeSession = await getSafeSession();
      if (!mounted) return;

      setSession(safeSession);
      if (safeSession?.user) {
        await checkRole(safeSession.user.id);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      window.removeEventListener(getAuthErrorEventName(), authErrorHandler as EventListener);
    };
  }, []);

  const signOut = async () => {
    await safeSignOut();
    clearBrokenSupabaseSession();
    setSession(null);
    setIsAdmin(false);
    setError(null);
  };

  return { session, isAdmin, loading, error, signOut };
};
