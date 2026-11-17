"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_REGION_SLUG } from "@/lib/data";
import { safeNextPath } from "@/lib/listings";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"), `/${DEFAULT_REGION_SLUG}`);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "sent">("idle");
  const [error, setError] = useState<string | null>(
    params.get("error") === "link" ? "That sign-in link has expired or was already used. Send a new one." : null,
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const address = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setError("Enter your full school email address.");
      return;
    }
    setError(null);
    setState("checking");
    const supabase = createClient();

    const { data: eligible, error: rpcError } = await supabase.rpc("email_is_eligible", { email: address });
    if (rpcError) {
      setState("idle");
      setError("Couldn't check that email. Try again in a moment.");
      return;
    }
    if (!eligible) {
      setState("idle");
      setError(
        "SchoolYard is for students at the colleges we cover. Use your school email (for example you@asu.edu).",
      );
      return;
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: address,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}` },
    });
    if (otpError) {
      setState("idle");
      setError(
        otpError.status === 429
          ? "Too many sign-in emails were sent recently. Wait a few minutes and try again."
          : `Couldn't send the sign-in email: ${otpError.message}`,
      );
      return;
    }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
        <MailCheck className="mx-auto mb-3 h-10 w-10 text-emerald-600" aria-hidden />
        <h1 className="text-lg font-bold">Check your school email</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          We sent a sign-in link to <span className="font-medium text-zinc-900">{email.trim()}</span>. Open it on
          this device to finish signing in.
        </p>
        <button type="button" onClick={() => setState("idle")} className="mt-4 text-sm font-medium underline">
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h1 className="text-lg font-bold">Sign in or join</h1>
      <p className="mt-1 text-sm leading-6 text-zinc-500">
        Use your school email. We&apos;ll send you a link, so there&apos;s no password to remember.
      </p>
      <label htmlFor="login-email" className="mb-1 mt-4 block text-sm font-medium">
        school email
      </label>
      <input
        id="login-email"
        type="email"
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@asu.edu"
        aria-invalid={!!error}
        aria-describedby={error ? "login-error" : undefined}
        className="w-full rounded-xl border border-zinc-200 p-3 text-sm aria-[invalid=true]:border-red-500"
      />
      {error && (
        <p id="login-error" role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <Button type="submit" className="mt-4 h-12 w-full rounded-2xl" disabled={state === "checking"}>
        {state === "checking" ? "Sending…" : "Email me a sign-in link"}
      </Button>
      <p className="mt-4 text-center text-xs text-zinc-500">
        Just looking?{" "}
        <Link href={next} className="underline">
          Keep browsing
        </Link>
      </p>
    </form>
  );
}
