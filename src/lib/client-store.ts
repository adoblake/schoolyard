"use client";

import { useSyncExternalStore } from "react";
import { createClient } from "./supabase/client";

/**
 * Small client-side stores for per-viewer UI state: who is signed in, which
 * listings they saved, and a ticking clock for "18 min ago" labels. Public
 * listing data is rendered on the server; only viewer-specific bits live here.
 */

type State = {
  /** undefined = not known yet, null = signed out */
  userId: string | null | undefined;
  saved: Set<string>;
};

let state: State = { userId: undefined, saved: new Set() };
const SERVER_STATE: State = { userId: undefined, saved: new Set() };
const listeners = new Set<() => void>();
let started = false;

function emit(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

async function loadSaved(userId: string) {
  const { data } = await createClient().from("saved_listings").select("listing_id").eq("user_id", userId);
  if (state.userId === userId) emit({ saved: new Set((data ?? []).map((r) => r.listing_id)) });
}

function start() {
  if (started) return;
  started = true;
  const supabase = createClient();
  supabase.auth.onAuthStateChange((_event, session) => {
    const userId = session?.user.id ?? null;
    if (userId === state.userId) return;
    emit({ userId, saved: new Set() });
    if (userId) void loadSaved(userId);
  });
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function useStore() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  );
}

export function useUserId() {
  return useStore().userId;
}

export function useSaved() {
  const { userId, saved } = useStore();
  return {
    isSaved: (id: string) => saved.has(id),
    savedCount: saved.size,
    /** Returns false when the viewer must sign in first. */
    toggleSaved: async (id: string): Promise<boolean> => {
      const supabase = createClient();
      // Session may still be loading right after page load; check before treating as signed out.
      const uid = userId ?? (userId === undefined ? (await supabase.auth.getSession()).data.session?.user.id : null);
      if (!uid) return false;
      if (state.userId === undefined) emit({ userId: uid });
      const wasSaved = state.saved.has(id);
      const next = new Set(state.saved);
      if (wasSaved) next.delete(id);
      else next.add(id);
      emit({ saved: next });

      const { error } = wasSaved
        ? await supabase.from("saved_listings").delete().eq("user_id", uid).eq("listing_id", id)
        : await supabase.from("saved_listings").insert({ user_id: uid, listing_id: id });
      if (error) {
        console.error("toggleSaved failed", error);
        void loadSaved(uid); // put the true state back
      }
      return true;
    },
  };
}

/** Current time, ticking once a minute. Null during server render. */
let nowValue = 0;
const nowListeners = new Set<() => void>();
let nowTimer: ReturnType<typeof setInterval> | undefined;

function subscribeNow(listener: () => void) {
  nowListeners.add(listener);
  if (!nowTimer) {
    nowValue = Date.now();
    nowTimer = setInterval(() => {
      nowValue = Date.now();
      nowListeners.forEach((l) => l());
    }, 60_000);
  }
  return () => {
    nowListeners.delete(listener);
    if (nowListeners.size === 0 && nowTimer) {
      clearInterval(nowTimer);
      nowTimer = undefined;
    }
  };
}

export function useNow(): number | null {
  return useSyncExternalStore(
    subscribeNow,
    () => nowValue || (nowValue = Date.now()),
    () => null,
  );
}
