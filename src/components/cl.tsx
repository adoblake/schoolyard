import Link from "next/link";

/** SchoolYard wordmark: yellow square + name. */
export function Wordmark({ href = "/", size = "md" }: { href?: string; size?: "md" | "lg" }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 font-bold tracking-tight text-[#222] hover:no-underline ${
        size === "lg" ? "text-3xl" : "text-lg"
      }`}
    >
      <span aria-hidden className={`inline-block rounded-[3px] bg-brand ${size === "lg" ? "h-5 w-5" : "h-3 w-3"}`} />
      SchoolYard
    </Link>
  );
}

export type Crumb = { label: string; href?: string };

/**
 * Thin header on every inner page: wordmark, breadcrumb trail
 * ("SchoolYard > phoenix > for sale > books") and account links.
 */
export function TopBar({ regionSlug, crumbs = [] }: { regionSlug?: string; crumbs?: Crumb[] }) {
  const r = regionSlug ?? "phoenix";
  return (
    <header className="border-b border-rule bg-bar/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-1.5">
        <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-[15px]">
          <Wordmark href={regionSlug ? `/${regionSlug}` : "/"} />
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1.5">
              <span className="text-zinc-400">&gt;</span>
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
            </span>
          ))}
        </nav>
        <nav aria-label="Account" className="flex items-center gap-3 text-[13px]">
          <Link href={`/${r}/post`}>post</Link>
          <Link href={`/account?region=${r}`}>account</Link>
          <Link href={`/${r}/saved`}>favorites</Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto mt-10 max-w-6xl border-t border-rule px-3 py-4 text-[12px] text-zinc-500">
      <nav className="flex flex-wrap gap-x-3 gap-y-1">
        <span>© 2026 SchoolYard</span>
        <Link href="/about">about</Link>
        <Link href="/about#safety">safety</Link>
        <Link href="/terms#prohibited">prohibited items</Link>
        <Link href="/terms">terms</Link>
        <Link href="/privacy">privacy</Link>
        <Link href="/schools">for schools</Link>
        <Link href="/about#request">request a campus</Link>
      </nav>
      <p className="mt-2">
        SchoolYard is an independent student marketplace and isn&apos;t affiliated with or endorsed by any college or
        university named on this site.
      </p>
    </footer>
  );
}

/** Box shown where signing in is needed. */
export function SignInNotice({ next, children }: { next: string; children: React.ReactNode }) {
  return (
    <div className="max-w-xl border border-rule bg-bar/40 p-4">
      <p>{children}</p>
      <p className="mt-3">
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="btn btn-primary">
          log in with your school email
        </Link>
      </p>
    </div>
  );
}
