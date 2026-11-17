import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-16 text-center text-zinc-950">
      <h1 className="text-lg font-bold">Page not found</h1>
      <p className="mt-2 text-sm text-zinc-500">That SchoolYard or page doesn&apos;t exist.</p>
      <Link href="/" className="mt-6 inline-block font-medium underline">
        Go to SchoolYard
      </Link>
    </div>
  );
}
