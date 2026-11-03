"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 transition hover:text-gold after:absolute after:inset-x-3.5 after:bottom-0.5 after:h-px after:origin-left after:bg-gold after:transition-transform after:duration-500 after:ease-[var(--ease-out-quart)] hover:after:scale-x-100 ${
        active ? "text-gold after:scale-x-100" : "text-white/85 after:scale-x-0"
      }`}
    >
      {children}
    </Link>
  );
}
