import { SERVICE_ICONS } from "./icons";

/** A service's custom mark in a gold ring that fills on hover (parent needs `group`). */
export function ServiceMark({ slug }: { slug: string }) {
  const Icon = SERVICE_ICONS[slug];
  if (!Icon) return null;
  return (
    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/35 text-gold transition duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
      <Icon className="h-8 w-8" />
    </span>
  );
}
