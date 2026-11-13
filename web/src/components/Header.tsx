import Link from "next/link";
import { getIndustries, getSettings } from "@/lib/wp";
import { NAV } from "@/lib/site";
import { Logo } from "./ui";
import { MobileNav } from "./MobileNav";
import { NavLink } from "./NavLink";
import { IconArrow, IconChevronDown, IconPhone, INDUSTRY_ICONS } from "./icons";

export async function Header() {
  const [industries, settings] = await Promise.all([getIndustries(), getSettings()]);
  const industryLinks = industries.map((i) => ({ href: `/industries/${i.slug}`, label: i.navLabel }));

  return (
    <header className="site-header on-dark fixed inset-x-0 top-0 z-50 text-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <div className="container-sw flex h-[5rem] items-center justify-between gap-6 md:h-[5.75rem]">
        <Link href="/" aria-label="Sharpe Wysman home" className="shrink-0">
          <Logo variant="light" priority />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1.5 text-[1rem]">
            {NAV.map((item) =>
              item.href === "/industries" ? (
                <li key={item.href} className="group relative">
                  <NavLink href={item.href}>
                    {item.label}
                    <IconChevronDown className="h-3.5 w-3.5 opacity-60 transition duration-300 group-hover:rotate-180 group-focus-within:rotate-180" strokeWidth={2} />
                  </NavLink>
                  <div className="invisible absolute left-1/2 top-full w-80 -translate-x-1/2 pt-3 opacity-0 transition duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <ul className="glass-panel rounded-xl border border-white/10 p-2 shadow-2xl shadow-black/40">
                      {industries.map((i) => {
                        const Icon = INDUSTRY_ICONS[i.slug];
                        return (
                          <li key={i.slug}>
                            <Link
                              href={`/industries/${i.slug}`}
                              className="glass-chip flex items-center gap-3 rounded-lg px-3 py-2.5 text-white/85 transition hover:text-gold"
                            >
                              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-gold">
                                {Icon ? <Icon className="h-5 w-5" /> : null}
                              </span>
                              {i.navLabel}
                            </Link>
                          </li>
                        );
                      })}
                      <li className="mt-1 border-t border-white/10 pt-1">
                        <Link href="/industries" className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-muted-dark hover:text-gold">
                          All industries <IconArrow className="h-4 w-4" />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <NavLink href={item.href}>{item.label}</NavLink>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a
            href={`tel:${settings.phoneHref}`}
            className="glass-chip icon-inline !hidden rounded-full px-3 xl:!inline-flex py-1.5 text-sm font-bold tabular-nums tracking-wide text-white/75 transition hover:text-gold"
          >
            <IconPhone className="h-4 w-4 text-gold" />
            {settings.phone}
          </a>
          <Link href="/contact" className="btn btn-gold !min-h-11 !px-5">
            Contact us
          </Link>
        </div>

        <MobileNav nav={[...NAV]} industries={industryLinks} phone={settings.phone} phoneHref={settings.phoneHref} />
      </div>
    </header>
  );
}
