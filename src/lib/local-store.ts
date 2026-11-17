"use client";

import { useMemo, useSyncExternalStore } from "react";
import { SEED_LISTINGS } from "./data";
import type { Listing } from "./types";

/**
 * Phase 0 stand-in for the backend: saved listings and listings posted from
 * this browser live in localStorage. Phase 1 replaces this module with
 * Supabase queries; components only use the hooks below.
 */

const SAVED_KEY = "schoolyard:saved";
const POSTED_KEY = "schoolyard:posted";

type Snapshot = { saved: string[]; posted: Listing[] };

const EMPTY: Snapshot = { saved: [], posted: [] };
let cache: Snapshot | null = null;
const listeners = new Set<() => void>();

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or storage full: keep working in memory for this visit.
  }
}

function getSnapshot(): Snapshot {
  if (!cache) {
    cache = {
      saved: readJson<string[]>(SAVED_KEY, []),
      posted: readJson<Listing[]>(POSTED_KEY, []),
    };
  }
  return cache;
}

function getServerSnapshot(): Snapshot {
  return EMPTY;
}

function update(next: Snapshot) {
  cache = next;
  writeJson(SAVED_KEY, next.saved);
  writeJson(POSTED_KEY, next.posted);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === SAVED_KEY || e.key === POSTED_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function useSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useAllListings(): Listing[] {
  const { posted } = useSnapshot();
  return useMemo(() => [...posted, ...SEED_LISTINGS], [posted]);
}

export function useListing(id: string): Listing | undefined {
  const all = useAllListings();
  return all.find((l) => l.id === id);
}

export function useSaved() {
  const { saved } = useSnapshot();
  return {
    savedIds: saved,
    isSaved: (id: string) => saved.includes(id),
    toggleSaved: (id: string) => {
      const current = getSnapshot();
      const next = current.saved.includes(id)
        ? current.saved.filter((s) => s !== id)
        : [...current.saved, id];
      update({ ...current, saved: next });
    },
  };
}

export function addLocalListing(listing: Listing) {
  const current = getSnapshot();
  update({ ...current, posted: [listing, ...current.posted] });
}

export function deleteLocalListing(id: string) {
  const current = getSnapshot();
  update({
    saved: current.saved.filter((s) => s !== id),
    posted: current.posted.filter((l) => l.id !== id),
  });
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

const noopSubscribe = () => () => {};

/** False during server render and hydration, true once running in the browser. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
