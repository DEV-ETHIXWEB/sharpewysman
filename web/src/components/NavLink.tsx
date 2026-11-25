"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`glass-chip relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 transition hover:text-gold after:absolute after:inset-x-3.5 after:bottom-0.5 after:h-px after:origin-left after:bg-gold after:transition-transform after:duration-500 after:ease-[var(--ease-out-quart)] hover:after:scale-x-100 ${
        active ? "text-gold after:scale-x-100" : "text-white/85 after:scale-x-0"
      }`}
    >
      {children}
    </Link>
  );
}

/**
 * Escape closes the Industries dropdown even while the pointer still rests on it
 * (hover content must be dismissible). It reopens once the pointer leaves and returns.
 */
export function NavDropdownDismiss() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      document.querySelectorAll<HTMLElement>(".nav-dd").forEach((li) => {
        if (!li.matches(":hover, :focus-within")) return;
        li.dataset.dismissed = "";
        const trigger = li.querySelector<HTMLElement>("a");
        if (li.contains(document.activeElement)) trigger?.focus();
        const reset = () => {
          delete li.dataset.dismissed;
          li.removeEventListener("pointerleave", reset);
          li.removeEventListener("focusout", onOut);
        };
        const onOut = (ev: FocusEvent) => {
          if (!li.contains(ev.relatedTarget as Node)) reset();
        };
        li.addEventListener("pointerleave", reset);
        li.addEventListener("focusout", onOut);
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
