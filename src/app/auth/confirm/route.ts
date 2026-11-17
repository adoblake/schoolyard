import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/listings";
import { getCurrentProfile, isProfileComplete } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

/**
 * Where the sign-in email link lands. Supports both the default Supabase email
 * template (PKCE: ?code=…) and the token-hash template (?token_hash=…&type=email).
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNextPath(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  let error: unknown = "missing token";
  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  }

  if (error) {
    console.error("Sign-in link failed", error);
    return NextResponse.redirect(new URL(`/login?error=link&next=${encodeURIComponent(next)}`, url.origin));
  }

  // New accounts finish their profile (name + campus) before carrying on.
  const profile = await getCurrentProfile();
  const destination = isProfileComplete(profile) ? next : `/account?welcome=1&next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(new URL(destination, url.origin));
}
