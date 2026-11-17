import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-8 text-sm text-zinc-500">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <nav className="flex flex-wrap gap-x-5 gap-y-2 font-medium text-zinc-700">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/phoenix" className="hover:underline">
            Browse listings
          </Link>
          <Link href="/schools" className="hover:underline">
            For schools
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
        </nav>
        <p className="text-xs leading-5">
          SchoolYard is an independent student marketplace and isn&apos;t affiliated with or endorsed by any college or
          university named on this site.
        </p>
      </div>
    </footer>
  );
}
