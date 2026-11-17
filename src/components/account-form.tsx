"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getSchoolName } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";

type Profile = { id: string; email: string | null; displayName: string; schoolId: string | null; verifiedDomain: string | null };

export function LogOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-link"
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      log out
    </button>
  );
}

export function AccountForm({ profile, schoolIds, next }: { profile: Profile; schoolIds: string[]; next: string | null }) {
  const router = useRouter();
  const [name, setName] = useState(profile.displayName);
  const [schoolId, setSchoolId] = useState(profile.schoolId ?? (schoolIds.length === 1 ? schoolIds[0] : ""));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    if (!name.trim()) return setError("Add the name buyers will see, like “Maya R.”");
    if (!schoolId) return setError("Pick your campus.");
    setError(null);
    startTransition(async () => {
      const { error } = await createClient()
        .from("profiles")
        .update({ display_name: name.trim(), school_id: schoolId })
        .eq("id", profile.id);
      if (error) {
        setError(`Couldn't save: ${error.message}`);
        return;
      }
      setSaved(true);
      if (next) router.push(next);
      router.refresh();
    });
  }

  return (
    <form onSubmit={save} className="grid max-w-xl gap-2 sm:grid-cols-[160px_1fr] sm:items-center">
      <label htmlFor="account-name">name buyers will see</label>
      <input id="account-name" value={name} maxLength={40} autoComplete="name" onChange={(e) => setName(e.target.value)} placeholder="Maya R." />
      <label htmlFor="account-school">your campus</label>
      <select id="account-school" value={schoolId} onChange={(e) => setSchoolId(e.target.value)}>
        {!schoolId && <option value="">choose…</option>}
        {schoolIds.map((id) => (
          <option key={id} value={id}>
            {getSchoolName(id)}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-700 sm:col-start-2" role="alert">
          {error}
        </p>
      )}
      {saved && !next && <p className="text-green-800 sm:col-start-2">saved</p>}
      <div className="sm:col-start-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "saving…" : next ? "save and continue" : "save"}
        </button>
      </div>
    </form>
  );
}
