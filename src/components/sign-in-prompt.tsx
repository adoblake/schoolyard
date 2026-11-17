import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SignInPrompt({ next, children }: { next: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-600">
      <p>{children}</p>
      <Button asChild className="mt-4 rounded-2xl">
        <Link href={`/login?next=${encodeURIComponent(next)}`}>Sign in with your school email</Link>
      </Button>
    </div>
  );
}
