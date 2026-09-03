import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth_token")?.value;

  // Safe JWT Payload Extraction
  let userRole: string | null = null;
  if (authToken) {
    try {
      const parts = authToken.split(".");
      if (parts.length === 3) {
        let jsonStr = "";
        try {
          if (typeof Buffer !== "undefined") {
            jsonStr = Buffer.from(parts[1], "base64").toString("utf-8");
          } else {
            const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
            jsonStr = atob(base64);
          }
        } catch {
          const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          jsonStr = atob(base64);
        }

        const payload = JSON.parse(jsonStr);
        // Validate expiration timestamp if present
        if (!payload.exp || payload.exp * 1000 > Date.now()) {
          userRole = payload.role ? String(payload.role).toLowerCase() : null;
        }
      }
    } catch {
      userRole = null;
    }
  }

  // 1. Protected Student Routes
  if (pathname.startsWith("/student")) {
    if (!authToken || userRole !== "student") {
      const loginUrl = new URL("/auth/student", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protected Admin Routes
  if (pathname.startsWith("/admin")) {
    if (!authToken || userRole !== "admin") {
      const loginUrl = new URL("/auth/admin", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Auth routes: redirect already-logged-in users to respective dashboard
  if (pathname === "/auth/student" && userRole === "student") {
    return NextResponse.redirect(new URL("/student", request.url));
  }

  if (pathname === "/auth/admin" && userRole === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/admin/:path*", "/auth/student", "/auth/admin"],
};
