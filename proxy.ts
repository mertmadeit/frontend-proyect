import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const DEFAULT_ORIGINS = new Set(["http://localhost:3000"]);

function buildAllowedOrigins() {
  const configuredOrigins = process.env.BETTER_AUTH_URL
    ? [process.env.BETTER_AUTH_URL]
    : [];

  return new Set(
    [...DEFAULT_ORIGINS, ...configuredOrigins]
      .map((origin) => origin.trim().replace(/\/+$/, ""))
      .filter(Boolean),
  );
}

function createCorsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
  };
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPrivatePage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/productos/editar");

  // This is a fast redirect. Pages and actions still verify the full session.
  if (isPrivatePage && !getSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const origin = request.headers.get("origin")?.trim().replace(/\/+$/, "");
  const allowedOrigins = buildAllowedOrigins();
  const isAllowedOrigin = !!origin && allowedOrigins.has(origin);

  if (!isAllowedOrigin) {
    return NextResponse.next();
  }

  const corsHeaders = createCorsHeaders(origin);

  if (request.method === "OPTIONS") {
    return NextResponse.json({}, { headers: corsHeaders });
  }

  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/productos/editar/:path*",
  ],
};
