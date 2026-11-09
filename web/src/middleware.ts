import { NextResponse, type NextRequest } from "next/server";

/**
 * Client design review: one site, two designs, same URLs.
 *  - ?option=1 or ?option=2 stores the visitor's choice in a cookie (the switch button is a plain link to this).
 *  - With option 2 chosen, every page is served from /option-2 while the address bar stays the same.
 *  - Runs before any CDN cache, so each design is cached separately.
 * Search engines send no cookie, so they only ever see Option 1.
 */
const COOKIE = "sw-design";
const PREFIX = "/option-2";

function remember(res: NextResponse, option: "1" | "2") {
  res.cookies.set(COOKIE, option, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax", httpOnly: true });
  return res;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const asked = url.searchParams.get("option");

  if (asked === "1" || asked === "2") {
    const clean = url.clone();
    clean.searchParams.delete("option");
    return remember(NextResponse.redirect(clean, 307), asked);
  }

  // The prefix is internal: a direct visit lands on the normal URL with Option 2 selected.
  if (url.pathname === PREFIX || url.pathname.startsWith(`${PREFIX}/`)) {
    const clean = url.clone();
    clean.pathname = url.pathname.slice(PREFIX.length) || "/";
    return remember(NextResponse.redirect(clean, 307), "2");
  }

  if (req.cookies.get(COOKIE)?.value === "2") {
    const target = url.clone();
    target.pathname = url.pathname === "/" ? PREFIX : `${PREFIX}${url.pathname}`;
    return NextResponse.rewrite(target);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|images|video|icons|favicon|icon|apple-icon|opengraph-image|robots\\.txt|sitemap\\.xml|manifest|llms\\.txt).*)"],
};
