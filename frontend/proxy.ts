import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname.startsWith("/auth");
  const isProtectedRoute = pathname.startsWith("/dashboard");
  const isResetPasswordRoute = pathname.startsWith("/auth/reset-password");

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token && pathname !== "/auth/otp" && !isResetPasswordRoute) {
    // already logged in - no need to see login/register again
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
