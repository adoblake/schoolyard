import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PostForm } from "@/components/post-form";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getRegion } from "@/lib/data";
import { getCurrentProfile, isProfileComplete } from "@/lib/queries";

export const metadata: Metadata = { title: "New post · SchoolYard" };

export default async function PostPage({ params }: PageProps<"/[region]/post">) {
  const { region } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <PostGate regionSlug={region} />
    </Suspense>
  );
}

async function PostGate({ regionSlug }: { regionSlug: string }) {
  const region = getRegion(regionSlug)!;
  const profile = await getCurrentProfile();
  const next = `/${regionSlug}/post`;

  if (!isProfileComplete(profile)) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-950">
        <SiteHeader region={region} />
        <main className="mx-auto max-w-md px-4 py-6">
          {profile ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-600">
              <p>Add your name and campus before posting, so buyers know who they&apos;re meeting.</p>
              <Button asChild className="mt-4 rounded-2xl">
                <Link href={`/account?next=${encodeURIComponent(next)}`}>Finish your profile</Link>
              </Button>
            </div>
          ) : (
            <SignInPrompt next={next}>
              Posting is for verified students. Sign in with your school email to post in {region.name}.
            </SignInPrompt>
          )}
        </main>
      </div>
    );
  }

  return (
    <PostForm
      regionSlug={regionSlug}
      userId={profile.id}
      sellerName={profile.displayName}
      sellerDomain={profile.verifiedDomain}
      defaultSchoolId={profile.schoolId}
    />
  );
}
