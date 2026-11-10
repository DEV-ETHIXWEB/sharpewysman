import type { Stat } from "@/lib/types";
import { Tick } from "./ui";
import { CountUp } from "./motion/CountUp";

/** Figures set out like a short financial statement, each one ticked. */
export function StatsLedger({ stats, title = "Statement of record" }: { stats: Stat[]; title?: string }) {
  return (
    <div data-reveal data-glow className="rounded-xl border border-line bg-white p-6 [--glow:rgb(128_25_33/0.05)] md:p-10">
      <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
        <p className="font-display text-xl md:text-2xl">{title}</p>
        <p className="hidden font-mono text-xs uppercase tracking-widest text-muted sm:block">Sharpe Wysman</p>
      </div>
      <dl>
        {stats.map((s, i) => (
          <div key={s.label} className="flex items-end gap-3 border-b border-line py-5 last:border-b-0">
            <dt className="max-w-[60%] md:max-w-none">
              <span className="block font-bold leading-snug">{s.label}</span>
              {s.note ? <span className="font-mono text-xs text-muted">{s.note}</span> : null}
            </dt>
            <span className="leader" aria-hidden />
            <dd className="flex items-center gap-2 font-mono text-3xl font-medium tabular-nums tracking-tight md:text-[2.6rem]">
              <CountUp value={s.value} />
              <Tick animate delay={0.6 + i * 0.2} className="h-4 w-5 text-maroon" />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
