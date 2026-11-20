import Link from "next/link";
import { Footer, Wordmark } from "@/components/cl";

export default function NotFound() {
  return (
    <div className="px-3">
      <div className="mx-auto max-w-6xl pt-5">
        <Wordmark size="lg" />
        <h1 className="mt-6 text-xl font-bold">Page not found</h1>
        <p className="mt-2">That SchoolYard site or page doesn&apos;t exist.</p>
        <p className="mt-3">
          <Link href="/">see all SchoolYard sites</Link>
        </p>
      </div>
      <Footer />
    </div>
  );
}
