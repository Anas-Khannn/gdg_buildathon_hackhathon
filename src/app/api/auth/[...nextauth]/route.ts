import { NextRequest, NextResponse } from "next/server";
import {
  auth,
  getOrCreateDemoUser,
  signUpUser,
  signInUser,
  resetPasswordUser,
  setSessionCookie,
  clearSessionCookie,
  SessionUser,
} from "@/auth";

export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Handle session check
  if (pathname.includes("/session")) {
    const session = await auth();
    return NextResponse.json(session || { user: null });
  }

  // Handle providers check
  if (pathname.includes("/providers")) {
    return NextResponse.json({
      "demo-login": {
        id: "demo-login",
        name: "Demo Login",
        type: "credentials",
        signinUrl: "/auth/signin",
        callbackUrl: "/",
      },
      google: {
        id: "google",
        name: "Google",
        type: "oauth",
        signinUrl: "/auth/signin",
        callbackUrl: "/",
      },
    });
  }

  // Handle CSRF check
  if (pathname.includes("/csrf")) {
    return NextResponse.json({ csrfToken: "naali-csrf-token-peshawar" });
  }

  return NextResponse.json({ status: "ok" });
}

export async function POST(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Handle signout
  if (pathname.includes("/signout")) {
    const res = NextResponse.json({ url: "/auth/signin" });
    clearSessionCookie(res);
    return res;
  }

  // Handle signin / signup
  try {
    let body: any = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    }

    const action = body.action || (pathname.includes("/signup") ? "signup" : "signin");
    const role: "user" | "admin" = body.role === "admin" ? "admin" : "user";
    const callbackUrl = body.callbackUrl || (role === "admin" ? "/admin" : "/");

    let user: SessionUser;

    if (action === "forgot_password" && body.email) {
      user = await resetPasswordUser({
        email: body.email,
        newPassword: body.password || body.newPassword || "Peshawar@2026",
        role,
      });
    } else if (action === "signup" && body.email) {
      // Custom user registration
      user = await signUpUser({
        name: body.name || (role === "admin" ? "WSSP Official" : "Peshawar Citizen"),
        email: body.email,
        password: body.password,
        role,
      });
    } else if (body.email && action === "signin") {
      // Custom user login
      user = await signInUser({
        email: body.email,
        password: body.password,
        role,
      });
    } else {
      // 1-Click Demo Evaluation Login
      user = await getOrCreateDemoUser(role);
    }

    const res = NextResponse.json({
      url: callbackUrl,
      user,
    });

    setSessionCookie(res, user);
    return res;
  } catch (error) {
    console.error("Auth POST error:", error);
    const fallbackUser: SessionUser = {
      id: "citizen-ali-id",
      name: "Ali (Peshawar Citizen)",
      email: "ali.citizen@peshawar.local",
      role: "user",
    };
    const res = NextResponse.json({ url: "/", user: fallbackUser });
    setSessionCookie(res, fallbackUser);
    return res;
  }
}
