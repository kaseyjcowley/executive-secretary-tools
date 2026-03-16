import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { ipAddress } from "@vercel/functions";
import { NextRequest } from "next/server";

function getClientIP(request: NextRequest): string {
  const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0].trim();
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP.trim();
  }

  if (ipAddress(request)) {
    return ipAddress(request) as string;
  }

  return "";
}

async function checkIPAccess(request: NextRequest): Promise<boolean> {
  const allowedIPs =
    process.env.INTERNAL_ALLOWED_IPS?.split(",").map((ip) => ip.trim()) || [];

  if (allowedIPs.length === 0) {
    return true;
  }

  const clientIP = getClientIP(request);

  console.log("[Middleware] IP Detection:", {
    "x-vercel-forwarded-for": request.headers.get("x-vercel-forwarded-for"),
    "x-forwarded-for": request.headers.get("x-forwarded-for"),
    "x-real-ip": request.headers.get("x-real-ip"),
    "request.ip": ipAddress(request),
    detected: clientIP,
    allowed: allowedIPs,
  });

  if (!clientIP) {
    if (process.env.NODE_ENV === "production") {
      console.log("[Security] No IP detected in production, denying access");
      return false;
    } else {
      console.log("[Security] No IP detected in development, allowing access");
      return true;
    }
  }

  if (!allowedIPs.includes(clientIP)) {
    console.log(`[Security] Blocked IP: ${clientIP}`);
    return false;
  }

  console.log(`[Security] Allowed IP: ${clientIP}`);
  return true;
}

const PUBLIC_PATHS = [
  "/api/auth/",
  "/auth/signin",
  "/api/crons/",
  "/api/cron/",
  "/api/slack/",
  "/api/post-prayers-to-slack",
  "/api/post-interviews-to-slack",
  "/api/interviews",
];

export default withAuth(
  async function proxy(req) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/internal")) {
      const hasIPAccess = await checkIPAccess(req);
      if (!hasIPAccess) {
        return new NextResponse("Forbidden - IP not whitelisted", {
          status: 403,
        });
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
          return true;
        }
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    "/internal/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
