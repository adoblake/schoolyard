import { BRAND, OUTLINE_PAGES, OUTLINE_RIBBON, TILE_PAGES, TILE_RIBBON } from "@/lib/brand";

/** The open-book mark, outline style, for use on white. */
export function BookMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      {OUTLINE_PAGES.map((d) => (
        <path key={d} d={d} fill="#fff" stroke={BRAND.green} strokeWidth={2.2} strokeLinejoin="round" />
      ))}
      <path d={OUTLINE_RIBBON} fill={BRAND.yellow} stroke={BRAND.yellow} strokeWidth={0.6} strokeLinejoin="round" />
    </svg>
  );
}

/** The app-icon version: white book on a green tile. */
export function BookTile({ className, rounded = true }: { className?: string; rounded?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx={rounded ? 7 : 0} fill={BRAND.green} />
      {TILE_PAGES.map((d) => (
        <path key={d} d={d} fill="#fff" />
      ))}
      <path d={TILE_RIBBON} fill={BRAND.yellow} />
    </svg>
  );
}
