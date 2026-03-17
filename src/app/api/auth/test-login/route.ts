import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const clientIP =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "";

  const allowedIPs = process.env.INTERNAL_ALLOWED_IPS?.split(",").map((ip) => ip.trim()) || [];
  const isLocalhostHost = request.headers.get("host")?.startsWith("localhost");

  if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP) && !isLocalhostHost) {
    console.warn(`[test-login] Denied access from IP: ${clientIP}`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return new NextResponse("NEXTAUTH_SECRET not configured", { status: 500 });
  }

  const testUser = {
    name: "Test User",
    email: "test@yourdomain.com",
    sub: "test-user-id",
  };

  const token: JWT = {
    ...testUser,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    jti: "test-user-jti",
  };

  const sessionToken = await encode({
    token,
    secret: secret,
  });

  const host = request.headers.get("host") || "localhost:3000";
  const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const baseUrl = isLocalhost ? `http://${host}` : `https://${host}`;

  const cookieName = "next-auth.session-token";

  const response = NextResponse.redirect(`${baseUrl}/`);

  response.cookies.set(cookieName, sessionToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60,
    path: "/",
  });

  response.cookies.set("__Secure-next-auth.session-token", sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60,
    path: "/",
  });

  return response;
}
