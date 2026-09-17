import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { defaultLocale, isLocale } from "@/i18n/config";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  const [, localeSegment] = request.nextUrl.pathname.split("/");
  const locale = localeSegment && isLocale(localeSegment) ? localeSegment : defaultLocale;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-airon-locale", locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|.*\\..*).*)"],
};
