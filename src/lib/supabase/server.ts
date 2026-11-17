import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { Database } from "./database.types";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

/** Supabase client acting as the signed-in user (reads auth cookies). */
export async function createClient() {
  // Supabase reads the clock (token expiry); make sure this only runs per request.
  await connection();
  const cookieStore = await cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component; proxy.ts refreshes sessions instead.
        }
      },
    },
  });
}

/**
 * Anonymous client for public data (active listings, schools). It doesn't touch
 * cookies, so pages using it stay cacheable and don't depend on who is viewing.
 */
export async function createPublicClient() {
  await connection();
  return createPlainClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
