import { cookies } from "next/headers";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  role: "user" | "admin";
}

export interface Session {
  user: SessionUser | null;
}

const SESSION_COOKIE = "naali_session";

// Server-side auth helper
export async function auth(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);

    if (!sessionCookie?.value) {
      return null;
    }

    let val = sessionCookie.value;
    for (let i = 0; i < 2; i++) {
      if (val.includes("%")) {
        try {
          val = decodeURIComponent(val);
        } catch {
          break;
        }
      }
    }

    const parsed = JSON.parse(val) as SessionUser;
    if (parsed && parsed.email && parsed.role) {
      return { user: parsed };
    }
  } catch (err) {
    // Malformed cookie, ignore
  }

  return null;
}

// Helper to set session cookie on a NextResponse
export function setSessionCookie(res: NextResponse, user: SessionUser) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set(SESSION_COOKIE, encodeURIComponent(JSON.stringify(user)), {
    path: "/",
    httpOnly: false, // Accessible on client so useSession hydrates immediately
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: "lax",
    secure: isProd,
  });
}

// Helper to clear session cookie
export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
}

// Database helper: Sign Up custom user with chosen role
export async function signUpUser({
  name,
  email,
  password,
  role,
}: {
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
}): Promise<SessionUser> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim() || (role === "admin" ? "WSSP Official" : "Peshawar Citizen");

  try {
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, cleanEmail))
      .limit(1);

    if (existing.length > 0) {
      const user = existing[0];
      await db
        .update(schema.users)
        .set({
          name: cleanName,
          role,
          ...(password ? { password } : {}),
        })
        .where(eq(schema.users.id, user.id));

      return {
        id: user.id,
        name: cleanName,
        email: user.email || cleanEmail,
        role,
      };
    }

    const [created] = await db
      .insert(schema.users)
      .values({
        name: cleanName,
        email: cleanEmail,
        role,
        password: password || null,
      })
      .returning();

    return {
      id: created.id,
      name: created.name || cleanName,
      email: created.email || cleanEmail,
      role: (created.role as "user" | "admin") || role,
    };
  } catch (err) {
    console.error("signUpUser db error:", err);
    return {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role,
    };
  }
}

// Database helper: Sign In existing user or demo profile
export async function signInUser({
  email,
  password,
  role = "user",
}: {
  email?: string;
  password?: string;
  role?: "user" | "admin";
}): Promise<SessionUser> {
  if (email && email.trim()) {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const existing = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, cleanEmail))
        .limit(1);

      if (existing.length > 0) {
        const u = existing[0];
        // If password was updated, update it
        if (password && !u.password) {
          await db
            .update(schema.users)
            .set({ password })
            .where(eq(schema.users.id, u.id));
        }

        return {
          id: u.id,
          name: u.name,
          email: u.email || cleanEmail,
          role: (u.role as "user" | "admin") || role,
        };
      }
    } catch (e) {}

    // Auto-create if first time logging in with email
    return signUpUser({ name: cleanEmail.split("@")[0], email: cleanEmail, password, role });
  }

  // Fallback to demo profile
  return getOrCreateDemoUser(role);
}

// Database helper: Reset password for user
export async function resetPasswordUser({
  email,
  newPassword,
  role = "user",
}: {
  email: string;
  newPassword: string;
  role?: "user" | "admin";
}): Promise<SessionUser> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, cleanEmail))
      .limit(1);

    if (existing.length > 0) {
      const u = existing[0];
      await db
        .update(schema.users)
        .set({ password: newPassword, role: (u.role as "user" | "admin") || role })
        .where(eq(schema.users.id, u.id));

      return {
        id: u.id,
        name: u.name,
        email: u.email || cleanEmail,
        role: (u.role as "user" | "admin") || role,
      };
    }
  } catch (e) {
    console.error("resetPasswordUser error:", e);
  }

  // If not found, create with the new password
  return signUpUser({
    name: cleanEmail.split("@")[0],
    email: cleanEmail,
    password: newPassword,
    role,
  });
}

// Database helper: find or create Ali or Fatima demo users in Postgres
export async function getOrCreateDemoUser(role: "user" | "admin"): Promise<SessionUser> {
  const email =
    role === "admin"
      ? "admin@wssp.peshawar.gov.pk"
      : "ali.citizen@peshawar.local";
  const name =
    role === "admin" ? "Fatima (WSSP Admin)" : "Ali (Peshawar Citizen)";

  try {
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (existing.length > 0) {
      const user = existing[0];
      if (user.role !== role) {
        await db
          .update(schema.users)
          .set({ role })
          .where(eq(schema.users.id, user.id));
      }
      return {
        id: user.id,
        name: user.name || name,
        email: user.email || email,
        role: (user.role as "user" | "admin") || role,
      };
    }

    const [created] = await db
      .insert(schema.users)
      .values({
        name,
        email,
        role,
      })
      .returning();

    return {
      id: created.id,
      name: created.name || name,
      email: created.email || email,
      role: (created.role as "user" | "admin") || role,
    };
  } catch (e) {
    return {
      id: role === "admin" ? "admin-fatima-id" : "citizen-ali-id",
      name,
      email,
      role,
    };
  }
}
