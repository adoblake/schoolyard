"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSchoolName } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";

type Profile = { id: string; email: string | null; displayName: string; schoolId: string | null; verifiedDomain: string | null };

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

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="text-sm">
        <div className="font-medium">{profile.email}</div>
        {profile.verifiedDomain && (
          <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> verified {profile.verifiedDomain} student
          </div>
        )}
      </div>

      <div>
        <label htmlFor="account-name" className="mb-1 block text-sm font-medium">
          name buyers will see
        </label>
        <input
          id="account-name"
          value={name}
          maxLength={40}
          autoComplete="name"
          onChange={(e) => setName(e.target.value)}
          placeholder="ex: Maya R."
          className="w-full rounded-xl border border-zinc-200 p-3 text-sm"
        />
        <p className="mt-1 text-xs text-zinc-500">First name and last initial is plenty.</p>
      </div>

      <div>
        <label htmlFor="account-school" className="mb-1 block text-sm font-medium">
          your campus
        </label>
        <select
          id="account-school"
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm"
        >
          {!schoolId && <option value="">Choose…</option>}
          {schoolIds.map((id) => (
            <option key={id} value={id}>
              {getSchoolName(id)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {saved && !next && <p className="text-sm text-emerald-700">Saved.</p>}

      <div className="flex gap-2">
        <Button type="submit" className="h-11 flex-1 rounded-2xl" disabled={pending}>
          {pending ? "Saving…" : next ? "Save and continue" : "Save"}
        </Button>
        <Button type="button" variant="outline" className="h-11 rounded-2xl" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </form>
  );
}
