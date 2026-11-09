/**
 * Small "Option 1 / Option 2" control for client design review. Each side is a plain
 * link: the middleware stores the choice and returns to this page in that design.
 * `className` positions it per design, because the two headers differ in height.
 */
export function OptionSwitch({ current, className = "" }: { current: 1 | 2; className?: string }) {
  return (
    <nav aria-label="Design options" className={`pointer-events-none absolute inset-x-0 z-20 ${className}`}>
      <div className="container-sw">
        <div className="pointer-events-auto inline-flex items-center gap-0.5 rounded-full border border-white/20 bg-black/55 p-0.5 text-xs font-bold text-white shadow-lg backdrop-blur">
          {([1, 2] as const).map((n) => (
            // A full page load is intended: the two designs are separate stylesheets and layouts.
            <a
              key={n}
              href={`/?option=${n}`}
              aria-current={current === n ? "page" : undefined}
              className={`flex h-7 items-center rounded-full px-3 transition-colors ${current === n ? "bg-gold text-ink" : "text-white/75 hover:text-white"}`}
            >
              Option {n}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
