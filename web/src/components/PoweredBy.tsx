import Image from "next/image";

/**
 * "Powered by Ethixweb" credit.
 *  - tone "light": white wordmark for dark surfaces (footer)
 *  - tone "dark":  charcoal wordmark for light surfaces (assistant panel)
 * Quiet by default, full strength on hover. rel="nofollow": Google's guidelines
 * treat site-wide footer/template links as a pattern to avoid, so this keeps
 * both sites' search standing safe.
 */
export function PoweredBy({ tone = "light", size = "md", className = "" }: { tone?: "light" | "dark"; size?: "sm" | "md"; className?: string }) {
  const h = size === "sm" ? 9 : 11;
  const w = Math.round((690 / 96) * h);
  return (
    <a
      href="https://www.ethixweb.com/"
      target="_blank"
      rel="noopener nofollow"
      aria-label="Powered by Ethixweb (opens in a new tab)"
      className={`group inline-flex items-center gap-2.5 transition-opacity duration-300 ${
        tone === "light" ? "text-white opacity-60 hover:opacity-100" : "text-ink opacity-70 hover:opacity-100"
      } ${className}`}
    >
      <span className={`font-bold uppercase tracking-[0.18em] ${size === "sm" ? "text-[9px]" : "text-[10px]"}`}>Powered by</span>
      <Image
        src={tone === "light" ? "/images/ethixweb-white.png" : "/images/ethixweb-ink.png"}
        alt="Ethixweb"
        width={w}
        height={h}
        className="h-auto translate-y-[0.5px]"
        style={{ width: w, height: h }}
      />
    </a>
  );
}
