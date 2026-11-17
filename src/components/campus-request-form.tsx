"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const ROLES = [
  { value: "student", label: "Student" },
  { value: "staff", label: "Faculty or staff" },
  { value: "parent", label: "Parent" },
  { value: "other", label: "Other" },
] as const;

export function CampusRequestForm({ defaultRole = "student" }: { defaultRole?: (typeof ROLES)[number]["value"] }) {
  const [school, setSchool] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [role, setRole] = useState<string>(defaultRole);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (school.trim().length < 2) return setError("Enter your college or university.");
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("That email doesn't look right.");
    setError(null);
    setStatus("sending");
    const { error } = await createClient()
      .from("campus_requests")
      .insert({
        school_name: school.trim(),
        city: city.trim() || null,
        state: state.trim() || null,
        role,
        email: email.trim().toLowerCase() || null,
      });
    if (error) {
      setStatus("idle");
      setError("Couldn't send your request. Try again in a moment.");
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900" role="status">
        <CircleCheck className="mb-2 h-6 w-6" aria-hidden />
        Request received for <span className="font-semibold">{school.trim()}</span>. The more requests a campus gets, the
        sooner it opens. Share this page with classmates to move yours up the list.
      </div>
    );
  }

  const input = "w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm";
  return (
    <form onSubmit={submit} noValidate className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="req-school" className="mb-1 block text-sm font-medium">
          College or university
        </label>
        <input id="req-school" value={school} onChange={(e) => setSchool(e.target.value)} maxLength={120} placeholder="ex: University of Texas at Austin" className={input} />
      </div>
      <div>
        <label htmlFor="req-city" className="mb-1 block text-sm font-medium">
          City
        </label>
        <input id="req-city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} className={input} />
      </div>
      <div>
        <label htmlFor="req-state" className="mb-1 block text-sm font-medium">
          State
        </label>
        <input id="req-state" value={state} onChange={(e) => setState(e.target.value)} maxLength={40} className={input} />
      </div>
      <div>
        <label htmlFor="req-role" className="mb-1 block text-sm font-medium">
          I&apos;m a
        </label>
        <select id="req-role" value={role} onChange={(e) => setRole(e.target.value)} className={input}>
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="req-email" className="mb-1 block text-sm font-medium">
          Email <span className="font-normal text-zinc-400">(optional, to hear when it opens)</span>
        </label>
        <input id="req-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} className={input} />
      </div>
      {error && (
        <p className="text-sm text-red-600 sm:col-span-2" role="alert">
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" className="h-12 w-full rounded-2xl" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Request my campus"}
        </Button>
      </div>
    </form>
  );
}
