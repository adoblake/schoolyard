import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Footer, SignInNotice, TopBar } from "@/components/cl";
import { PostForm } from "@/components/post-form";
import { getCurrentProfile, isProfileComplete } from "@/lib/queries";

export const metadata: Metadata = { title: "create a posting · SchoolYard" };

export default async function PostPage({ params }: PageProps<"/[region]/post">) {
  const { region } = await params;
  return (
    <div>
      <TopBar regionSlug={region} crumbs={[{ label: region, href: `/${region}` }, { label: "create posting" }]} />
      <Suspense fallback={<div className="min-h-[50vh]" />}>
        <PostGate regionSlug={region} />
      </Suspense>
      <Footer />
    </div>
  );
}

async function PostGate({ regionSlug }: { regionSlug: string }) {
  const profile = await getCurrentProfile();
  const next = `/${regionSlug}/post`;

  if (!isProfileComplete(profile)) {
    return (
      <main className="mx-auto max-w-3xl px-3 pt-4">
        {profile ? (
          <div className="max-w-xl border border-rule bg-bar/40 p-4">
            <p>Add the name buyers will see and pick your campus before posting.</p>
            <p className="mt-3">
              <Link href={`/account?next=${encodeURIComponent(next)}`} className="btn btn-primary">
                finish your account
              </Link>
            </p>
          </div>
        ) : (
          <SignInNotice next={next}>Posting is for verified students. Log in with your school email to create a posting.</SignInNotice>
        )}
      </main>
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
