"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { DEFAULT_REGION_SLUG } from "@/lib/data";
import { safeNextPath } from "@/lib/listings";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"), `/${DEFAULT_REGION_SLUG}`);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "sent">("idle");
  const [error, setError] = useState<string | null>(
    params.get("error") === "link" ? "That log-in link has expired or was already used. Send yourself a new one." : null,
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
      setError("notEligible");
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
          ? "Too many log-in emails were sent recently. Wait a few minutes and try again."
          : `Couldn't send the log-in email: ${otpError.message}`,
      );
      return;
    }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <div className="max-w-md border border-rule p-4">
        <h1 className="text-[17px] font-bold">check your school email</h1>
        <p className="mt-2">
          We sent a log-in link to <strong>{email.trim()}</strong>. Open it on this device to finish logging in. It
          may take a minute to arrive; check spam if you don&apos;t see it.
        </p>
        <p className="mt-3">
          <button type="button" onClick={() => setState("idle")} className="text-link">
            use a different email
          </button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-md border border-rule p-4">
      <h1 className="bar -mx-4 -mt-4 mb-3 border-x-0 border-t-0">log in or create an account</h1>
      <p className="text-zinc-700">Use your school email. We&apos;ll email you a link, so there&apos;s no password.</p>
      <label htmlFor="login-email" className="mb-1 mt-3 block font-bold">
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
        className="w-full"
      />
      {error && (
        <p id="login-error" role="alert" className="mt-2 text-red-700">
          {error === "notEligible" ? (
            <>
              SchoolYard isn&apos;t open at that school yet, or that isn&apos;t a school email. Use your school email
              (for example you@asu.edu), or{" "}
              <Link href="/about#request">request your campus</Link>.
            </>
          ) : (
            error
          )}
        </p>
      )}
      <p className="mt-3">
        <button type="submit" className="btn btn-primary" disabled={state === "checking"}>
          {state === "checking" ? "sending…" : "email me a log-in link"}
        </button>
      </p>
      <p className="mt-3 text-[12px] text-zinc-500">
        By logging in you agree to the <Link href="/terms">terms of use</Link> and <Link href="/privacy">privacy policy</Link>.
        Just looking? <Link href={next}>Keep browsing</Link>.
      </p>
    </form>
  );
}
