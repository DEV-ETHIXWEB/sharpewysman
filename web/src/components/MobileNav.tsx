"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconPhone } from "./icons";

type L = { href: string; label: string };

export function MobileNav({ nav, industries, phone, phoneHref }: { nav: L[]; industries: L[]; phone: string; phoneHref: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on navigation
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className="group relative -mr-2 flex h-11 w-11 items-center justify-center rounded-full text-white"
      >
        {/* Two ledger rules of unequal length; they fold into a cross when open. */}
        <span
          className={`absolute right-2.5 h-[1.5px] rounded-full bg-current transition-all duration-300 ease-[var(--ease-out-quart)] ${
            open ? "w-6 translate-y-0 rotate-45" : "w-6 -translate-y-[4px]"
          }`}
        />
        <span
          className={`absolute right-2.5 h-[1.5px] rounded-full transition-all duration-300 ease-[var(--ease-out-quart)] ${
            open ? "w-6 translate-y-0 -rotate-45 bg-current" : "w-3.5 translate-y-[4px] bg-gold group-hover:w-6"
          }`}
        />
      </button>

      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 overflow-y-auto border-t border-white/10 bg-ink"
      >
        <nav aria-label="Mobile" className="container-sw py-6">
          <ul className="divide-y divide-white/10">
            {nav.map((item, i) => (
              <li key={item.href} data-menu-item style={{ ["--i" as string]: i }}>
                <Link
                  href={item.href}
                  className={`block py-4 font-display text-[1.75rem] ${pathname.startsWith(item.href) ? "text-gold" : "text-white"}`}
                >
                  {item.label}
                </Link>
                {item.href === "/industries" ? (
                  <ul className="-mt-1 mb-4 grid grid-cols-2 gap-x-4 gap-y-2 pl-1">
                    {industries.map((i) => (
                      <li key={i.href}>
                        <Link href={i.href} className="text-sm text-muted-dark hover:text-gold">
                          {i.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          <div data-menu-item style={{ ["--i" as string]: nav.length }} className="mt-8 grid gap-3">
            <Link href="/contact" className="btn btn-gold w-full">
              Contact us
            </Link>
            <a href={`tel:${phoneHref}`} className="btn btn-ghost-light w-full tabular-nums">
              <IconPhone className="h-4 w-4 text-gold" />
              Call {phone}
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}
