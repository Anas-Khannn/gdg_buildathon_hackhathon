"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { SessionUser, Session } from "@/auth";

interface SessionContextType {
  data: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: (provider?: string, options?: { role?: "user" | "admin"; email?: string; password?: string; callbackUrl?: string }) => Promise<void>;
  signUp: (options: { name: string; email: string; password?: string; role: "user" | "admin"; callbackUrl?: string }) => Promise<void>;
  resetPassword: (options: { email: string; newPassword: string; role?: "user" | "admin"; callbackUrl?: string }) => Promise<void>;
  signOut: (options?: { callbackUrl?: string }) => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  data: null,
  status: "loading",
  signIn: async () => {},
  signUp: async () => {},
  resetPassword: async () => {},
  signOut: async () => {},
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  // Read session from cookie on mount and via API
  const refreshSession = useCallback(async () => {
    try {
      // 1. Instant optimistic check via document.cookie
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|;\s*)naali_session=([^;]+)/);
        if (match && match[1]) {
          try {
            const user = JSON.parse(decodeURIComponent(match[1])) as SessionUser;
            if (user?.email) {
              setSession({ user });
              setStatus("authenticated");
            }
          } catch (e) {}
        }
      }

      // 2. Fetch from API endpoint
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setSession(data);
          setStatus("authenticated");
        } else {
          setSession(null);
          setStatus("unauthenticated");
        }
      } else {
        setStatus("unauthenticated");
      }
    } catch (err) {
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const signIn = useCallback(
    async (provider = "demo-login", options?: { role?: "user" | "admin"; email?: string; password?: string; callbackUrl?: string }) => {
      setStatus("loading");
      const role = options?.role || "user";
      const callbackUrl = options?.callbackUrl || (role === "admin" ? "/admin" : "/");

      try {
        const res = await fetch("/api/auth/signin/demo-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "signin",
            role,
            email: options?.email,
            password: options?.password,
            callbackUrl,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setSession({ user: data.user });
            setStatus("authenticated");
          }
          if (typeof window !== "undefined") {
            window.location.href = data.url || callbackUrl;
          }
        }
      } catch (err) {
        console.error("Sign-in error:", err);
        setStatus("unauthenticated");
      }
    },
    []
  );

  const signUp = useCallback(
    async (options: { name: string; email: string; password?: string; role: "user" | "admin"; callbackUrl?: string }) => {
      setStatus("loading");
      const role = options.role || "user";

      try {
        const res = await fetch("/api/auth/signin/demo-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "signup",
            name: options.name,
            email: options.email,
            password: options.password,
            role,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Failed to create account");
        }

        // On sign up, do NOT set authenticated session; user must sign in on the sign in page
        setStatus("unauthenticated");
        return data;
      } catch (err) {
        console.error("Sign-up error:", err);
        setStatus("unauthenticated");
        throw err;
      }
    },
    []
  );

  const resetPassword = useCallback(
    async (options: { email: string; newPassword: string; role?: "user" | "admin"; callbackUrl?: string }) => {
      setStatus("loading");
      const role = options.role || "user";
      const callbackUrl = options.callbackUrl || (role === "admin" ? "/admin" : "/");

      try {
        const res = await fetch("/api/auth/signin/demo-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "forgot_password",
            email: options.email,
            newPassword: options.newPassword,
            role,
            callbackUrl,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setSession({ user: data.user });
            setStatus("authenticated");
          }
          if (typeof window !== "undefined") {
            window.location.href = data.url || callbackUrl;
          }
        }
      } catch (err) {
        console.error("Reset password error:", err);
        setStatus("unauthenticated");
      }
    },
    []
  );

  const signOut = useCallback(async (options?: { callbackUrl?: string }) => {
    setStatus("loading");
    const callbackUrl = options?.callbackUrl || "/about";

    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch (e) {}

    // Clear cookie locally too
    if (typeof document !== "undefined") {
      document.cookie = "naali_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }

    setSession(null);
    setStatus("unauthenticated");

    if (typeof window !== "undefined") {
      window.location.href = callbackUrl;
    }
  }, []);

  return (
    <SessionContext.Provider value={{ data: session, status, signIn, signUp, resetPassword, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

// React hook matching next-auth's useSession
export function useSession() {
  return useContext(SessionContext);
}

// Helper to sync client-side auth cookies directly
function syncClientSession(user: any) {
  if (typeof document !== "undefined" && user) {
    const val = encodeURIComponent(JSON.stringify(user));
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    document.cookie = `naali_session=${val}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax${isHttps ? "; Secure" : ""}`;
    try {
      localStorage.setItem("naali_session", JSON.stringify(user));
    } catch {}
  }
}

// Client signIn
export async function signIn(provider?: string, options?: { role?: "user" | "admin"; email?: string; password?: string; callbackUrl?: string }) {
  const role = options?.role || "user";
  const callbackUrl = options?.callbackUrl || (role === "admin" ? "/admin" : "/");

  const res = await fetch("/api/auth/signin/demo-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "signin",
      role,
      email: options?.email,
      password: options?.password,
      callbackUrl,
    }),
  });

  if (res.ok) {
    const data = await res.json();
    if (data.user) {
      syncClientSession(data.user);
    }
    const destination = data.url || callbackUrl;
    if (typeof window !== "undefined") {
      window.location.replace(destination);
    }
    return data;
  } else {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to sign in");
  }
}

// Client signUp
export async function signUp(options: { name: string; email: string; password?: string; role: "user" | "admin"; callbackUrl?: string }) {
  const role = options.role || "user";

  const res = await fetch("/api/auth/signin/demo-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "signup",
      name: options.name,
      email: options.email,
      password: options.password,
      role,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to create account");
  }

  // Do NOT syncClientSession or redirect to dashboard on sign up
  return data;
}

// Client resetPassword
export async function resetPassword(options: { email: string; newPassword: string; role?: "user" | "admin"; callbackUrl?: string }) {
  const role = options.role || "user";
  const callbackUrl = options.callbackUrl || (role === "admin" ? "/admin" : "/");

  const res = await fetch("/api/auth/signin/demo-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "forgot_password",
      email: options.email,
      newPassword: options.newPassword,
      role,
      callbackUrl,
    }),
  });

  if (res.ok) {
    const data = await res.json();
    if (data.user) {
      syncClientSession(data.user);
    }
    const destination = data.url || callbackUrl;
    if (typeof window !== "undefined") {
      window.location.replace(destination);
    }
    return data;
  } else {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to reset password");
  }
}

// Client signOut
export async function signOut(options?: { callbackUrl?: string }) {
  const callbackUrl = options?.callbackUrl || "/about";
  await fetch("/api/auth/signout", { method: "POST" });
  if (typeof document !== "undefined") {
    document.cookie = "naali_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }
  if (typeof window !== "undefined") {
    window.location.href = callbackUrl;
  }
}
