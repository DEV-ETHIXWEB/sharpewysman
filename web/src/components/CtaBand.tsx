import Image from "next/image";
import Link from "next/link";
import { Arrow } from "./ui";

/**
 * Closing call to action. The gold handshake inside a ring (from the client's
 * own assets, AI-upscaled) sits on charcoal, echoing the Sharpe Wysman mark.
 */
export function CtaBand({
  title = "Ready to make your next move?",
  body = "Whether you're hiring or looking for your next role, a short confidential conversation is the best place to start.",
  primary = { href: "/contact", label: "Start a conversation" },
  secondary = { href: "/jobs", label: "See current jobs" },
}: {
  title?: string;
  body?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="group/cta on-dark relative isolate overflow-hidden border-t-2 border-accent bg-[#050505] text-white">
      <div className="absolute inset-y-0 right-0 -z-10 w-full md:w-[68%]">
        <Image
          src="/images/handshake.jpg"
          alt=""
          fill
          sizes="(min-width: 768px) 68vw, 100vw"
          className="object-cover object-[60%_50%] opacity-45 transition-transform duration-[2500ms] ease-out group-hover/cta:scale-[1.03] md:opacity-100"
          style={{ maskImage: "linear-gradient(to right, transparent 0%, #000 38%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 38%)" }}
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#050505] via-[#050505]/85 to-transparent md:via-[#050505]/60" />
      <div className="container-sw py-14 md:py-20">
        <div data-reveal className="max-w-xl">
          <p className="eyebrow text-gold">Vancouver · Since 2008</p>
          <h2 className="mt-4 text-4xl md:text-[3.5rem]">{title}</h2>
          <p className="mt-5 text-lg text-white/75">{body}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={primary.href} className="btn btn-gold">
              {primary.label} <Arrow />
            </Link>
            <Link href={secondary.href} className="btn btn-ghost-light">
              {secondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
