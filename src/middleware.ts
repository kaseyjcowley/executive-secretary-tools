import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getClientIP(request: NextRequest): string {
  // Check various headers in order of precedence
  // Vercel and other platforms may use different headers

  // 1. Vercel-specific header
  const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0].trim();
  }

  // 2. Standard forwarded header (can contain multiple IPs, first is client)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  // 3. Real IP header (used by some proxies)
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP.trim();
  }

  // 4. Direct connection IP
  if (request.ip) {
    return request.ip;
  }

  // 5. Fallback - no IP detected
  return "";
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/internal")) {
    const allowedIPs =
      process.env.INTERNAL_ALLOWED_IPS?.split(",").map((ip) => ip.trim()) || [];

    if (allowedIPs.length > 0) {
      const clientIP = getClientIP(request);

      // Log for debugging
      console.log("[Middleware] IP Detection:", {
        "x-vercel-forwarded-for": request.headers.get("x-vercel-forwarded-for"),
        "x-forwarded-for": request.headers.get("x-forwarded-for"),
        "x-real-ip": request.headers.get("x-real-ip"),
        "request.ip": request.ip,
        detected: clientIP,
        allowed: allowedIPs,
      });

      if (!clientIP) {
        // No IP detected - likely local development without proxy
        // Allow access in development, deny in production
        if (process.env.NODE_ENV === "production") {
          console.log(
            "[Security] No IP detected in production, denying access",
          );
          return new NextResponse("Forbidden - Unable to detect IP", {
            status: 403,
          });
        } else {
          console.log(
            "[Security] No IP detected in development, allowing access",
          );
          return NextResponse.next();
        }
      }

      if (!allowedIPs.includes(clientIP)) {
        console.log(`[Security] Blocked IP: ${clientIP}`);
        return new NextResponse("Forbidden - IP not whitelisted", {
          status: 403,
        });
      }

      console.log(`[Security] Allowed IP: ${clientIP}`);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/internal/:path*",
};
