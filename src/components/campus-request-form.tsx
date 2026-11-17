"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ROLES = [
  { value: "student", label: "student" },
  { value: "staff", label: "faculty or staff" },
  { value: "parent", label: "parent" },
  { value: "other", label: "other" },
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
      <p className="border border-green-700 bg-green-50 p-3 text-green-900" role="status">
        Request received for <strong>{school.trim()}</strong>. The more requests a campus gets, the sooner it opens, so
        share this page with classmates.
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-2 border border-rule p-3 sm:grid-cols-[140px_1fr] sm:items-center">
      <label htmlFor="req-school">college or university</label>
      <input id="req-school" value={school} onChange={(e) => setSchool(e.target.value)} maxLength={120} placeholder="University of Texas at Austin" />
      <label htmlFor="req-city">city</label>
      <input id="req-city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} />
      <label htmlFor="req-state">state</label>
      <input id="req-state" value={state} onChange={(e) => setState(e.target.value)} maxLength={40} />
      <label htmlFor="req-role">I&apos;m a</label>
      <select id="req-role" value={role} onChange={(e) => setRole(e.target.value)}>
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <label htmlFor="req-email">
        email <span className="text-zinc-500">(optional)</span>
      </label>
      <input id="req-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} placeholder="to hear when it opens" />
      {error && (
        <p className="text-red-700 sm:col-start-2" role="alert">
          {error}
        </p>
      )}
      <div className="sm:col-start-2">
        <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
          {status === "sending" ? "sending…" : "request my campus"}
        </button>
      </div>
    </form>
  );
}
