import { NextResponse, type NextRequest } from "next/server";
import { assignVariant, isValidVisitor } from "@/lib/experiment";
import { recordImpression } from "@/lib/db";

const BOT_RE =
  /bot|crawl|spider|slurp|bingbot|googlebot|facebookexternalhit|headless/i;

const THIRTY_DAYS = 60 * 60 * 24 * 30;

function isPageNavigation(request: NextRequest): boolean {
  return (
    request.method === "GET" &&
    !request.headers.get("rsc") &&
    !request.headers.get("next-router-prefetch") &&
    !request.headers.get("next-router-segment-prefetch")
  );
}

export function proxy(request: NextRequest) {
  // El preview es un instrumento: no asigna, no escribe cookies y no cuenta.
  const preview = request.nextUrl.searchParams.get("preview");
  if (preview === "a" || preview === "b") {
    return NextResponse.next();
  }

  const headers = new Headers(request.headers);

  // Un crawler no conserva cookies: siempre ve el control, en la misma URL.
  if (BOT_RE.test(request.headers.get("user-agent") ?? "")) {
    headers.set("x-tn-variant", "a");
    headers.set("x-tn-visitor", "crawler");
    return NextResponse.next({ request: { headers } });
  }

  const existingVisitor = request.cookies.get("tn_visitor")?.value;
  const visitorId = isValidVisitor(existingVisitor)
    ? existingVisitor
    : crypto.randomUUID();

  // La variante se deriva del visitante: recargar nunca la cambia.
  const variant = assignVariant(visitorId);

  headers.set("x-tn-variant", variant);
  headers.set("x-tn-visitor", visitorId);

  const response = NextResponse.next({ request: { headers } });

  const cookieOptions = {
    httpOnly: true,
    path: "/",
    maxAge: THIRTY_DAYS,
    sameSite: "lax" as const,
  };
  response.cookies.set("tn_visitor", visitorId, cookieOptions);
  response.cookies.set("tn_variant", variant, cookieOptions);

  if (isPageNavigation(request)) {
    recordImpression(visitorId, variant);
  }

  return response;
}

export const config = {
  matcher: ["/practica"],
};
