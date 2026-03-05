import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  if (request.ip) {
    return request.ip;
  }

  return "";
}

function checkBasicAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader) {
    const authValue = authHeader.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    if (
      user === process.env.BASIC_AUTH_USER &&
      pwd === process.env.BASIC_AUTH_PASSWORD
    ) {
      return true;
    }
  }

  return false;
}

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/internal")) {
    const allowedIPs =
      process.env.INTERNAL_ALLOWED_IPS?.split(",").map((ip) => ip.trim()) || [];

    if (allowedIPs.length > 0) {
      const clientIP = getClientIP(req);

      console.log("[Middleware] IP Detection:", {
        "x-vercel-forwarded-for": req.headers.get("x-vercel-forwarded-for"),
        "x-forwarded-for": req.headers.get("x-forwarded-for"),
        "x-real-ip": req.headers.get("x-real-ip"),
        "request.ip": req.ip,
        detected: clientIP,
        allowed: allowedIPs,
      });

      if (!clientIP) {
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
  } else {
    if (!checkBasicAuth(req)) {
      return new NextResponse("Authentication Required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Secure Area"',
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/internal/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
