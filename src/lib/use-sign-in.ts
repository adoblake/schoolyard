"use client";

import { usePathname, useRouter } from "next/navigation";

/** Sends the viewer to sign in, coming back to the current page afterwards. */
export function useGoToSignIn() {
  const router = useRouter();
  const pathname = usePathname();
  return (next: string = pathname) => router.push(`/login?next=${encodeURIComponent(next)}`);
}
