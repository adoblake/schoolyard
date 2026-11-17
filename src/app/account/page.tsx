import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountForm } from "@/components/account-form";
import { ListingList, ListingListSkeleton, PostFirstLink } from "@/components/listing-list";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { SiteHeader } from "@/components/site-header";
import { DEFAULT_REGION_SLUG, getRegion, REGIONS } from "@/lib/data";
import { safeNextPath } from "@/lib/listings";
import { getCurrentProfile, getMyListings, getSchoolsForDomain } from "@/lib/queries";

export const metadata: Metadata = { title: "Account · SchoolYard" };

export default function AccountPage({ searchParams }: PageProps<"/account">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <Account searchParams={searchParams} />
    </Suspense>
  );
}

function regionForSchool(schoolId: string | null) {
  return REGIONS.find((r) => r.schools.some((s) => s.id === schoolId));
}

async function Account({ searchParams }: { searchParams: PageProps<"/account">["searchParams"] }) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const profile = await getCurrentProfile();
  const region =
    getRegion(one(sp.region) ?? "") ?? regionForSchool(profile?.schoolId ?? null) ?? getRegion(DEFAULT_REGION_SLUG)!;
  const next = one(sp.next) ? safeNextPath(one(sp.next)) : null;

  if (!profile) {
    return (
      <Page region={region}>
        <SignInPrompt next="/account">Sign in to manage your profile and listings.</SignInPrompt>
      </Page>
    );
  }

  const [schoolIds, myListings] = await Promise.all([
    getSchoolsForDomain(profile.verifiedDomain),
    getMyListings(profile.id),
  ]);

  return (
    <Page region={region}>
      {one(sp.welcome) && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          You&apos;re in! Add the name buyers will see and pick your campus to finish setting up.
        </div>
      )}
      <AccountForm profile={profile} schoolIds={schoolIds} next={next} />

      <h2 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide text-zinc-500">my listings</h2>
      <ListingList
        listings={myListings}
        hideActions
        empty={
          <>
            You haven&apos;t posted anything yet. <PostFirstLink regionSlug={region.slug} />?
          </>
        }
      />
    </Page>
  );
}

function Page({ region, children }: { region: NonNullable<ReturnType<typeof getRegion>>; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <SiteHeader region={region} />
      <main className="mx-auto max-w-md px-4 py-4 pb-24">
        <h1 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">account</h1>
        <Suspense fallback={<ListingListSkeleton />}>{children}</Suspense>
      </main>
    </div>
  );
}
