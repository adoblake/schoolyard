import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AccountForm, LogOutButton } from "@/components/account-form";
import { Footer, SignInNotice, TopBar } from "@/components/cl";
import { ShortDate } from "@/components/listing-bits";
import { CATEGORY_LABELS } from "@/lib/categories";
import { DEFAULT_REGION_SLUG, getRegion, getSchoolName, REGIONS } from "@/lib/data";
import { formatListingPrice, safeNextPath } from "@/lib/listings";
import { getCurrentProfile, getMyListings, getSchoolsForDomain } from "@/lib/queries";

export const metadata: Metadata = { title: "account · SchoolYard" };

export default function AccountPage({ searchParams }: PageProps<"/account">) {
  return (
    <Suspense fallback={<TopBar crumbs={[{ label: "account" }]} />}>
      <Account searchParams={searchParams} />
    </Suspense>
  );
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function Account({ searchParams }: { searchParams: PageProps<"/account">["searchParams"] }) {
  const sp = await searchParams;
  const profile = await getCurrentProfile();
  const region =
    getRegion(one(sp.region) ?? "") ??
    REGIONS.find((r) => r.schools.some((s) => s.id === profile?.schoolId)) ??
    getRegion(DEFAULT_REGION_SLUG)!;
  const next = one(sp.next) ? safeNextPath(one(sp.next)) : null;

  if (!profile) {
    return (
      <div>
        <TopBar regionSlug={region.slug} crumbs={[{ label: region.slug, href: `/${region.slug}` }, { label: "account" }]} />
        <main className="mx-auto max-w-6xl px-3 pt-4">
          <SignInNotice next="/account">Log in to see your postings and account settings.</SignInNotice>
        </main>
        <Footer />
      </div>
    );
  }

  const [schoolIds, postings] = await Promise.all([getSchoolsForDomain(profile.verifiedDomain), getMyListings(profile.id)]);
  const needsSetup = !profile.displayName.trim() || !profile.schoolId;

  return (
    <div>
      <TopBar regionSlug={region.slug} crumbs={[{ label: region.slug, href: `/${region.slug}` }, { label: "account" }]} />
      <main className="mx-auto max-w-6xl space-y-6 px-3 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
          <span>
            logged in as <strong>{profile.email}</strong>
            {profile.verifiedDomain && <span className="ml-1 text-green-800">✓ {profile.verifiedDomain} verified</span>}
          </span>
          <LogOutButton />
        </div>

        {(one(sp.welcome) || needsSetup) && (
          <p className="border border-green-700 bg-green-50 p-3 text-green-900">
            Welcome to SchoolYard. Add the name buyers will see and pick your campus to finish setting up.
          </p>
        )}

        <section>
          <div className="bar flex items-center justify-between">
            <h2>postings</h2>
            <Link href={`/${region.slug}/post`} className="font-normal">
              create a posting
            </Link>
          </div>
          {postings.length === 0 ? (
            <p className="mt-2">You haven&apos;t posted anything yet.</p>
          ) : (
            <div className="mt-1 overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="text-zinc-500">
                  <tr>
                    <th className="py-1 pr-3 font-normal">status</th>
                    <th className="py-1 pr-3 font-normal">title</th>
                    <th className="py-1 pr-3 font-normal">price</th>
                    <th className="py-1 pr-3 font-normal">category</th>
                    <th className="py-1 pr-3 font-normal">campus</th>
                    <th className="py-1 pr-3 font-normal">posted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 border-y border-zinc-200">
                  {postings.map((l) => (
                    <tr key={l.id}>
                      <td className="py-1.5 pr-3">
                        <span className={l.status === "active" ? "text-green-800" : "text-zinc-500"}>{l.status}</span>
                      </td>
                      <td className="py-1.5 pr-3">
                        <Link href={`/${l.regionSlug}/listing/${l.id}`}>{l.title}</Link>
                      </td>
                      <td className="py-1.5 pr-3">{formatListingPrice(l.priceCents, l.category)}</td>
                      <td className="py-1.5 pr-3">{CATEGORY_LABELS[l.category]}</td>
                      <td className="py-1.5 pr-3">{getSchoolName(l.schoolId)}</td>
                      <td className="py-1.5 pr-3">
                        <ShortDate iso={l.postedAt} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-1 text-[12px] text-zinc-500">Open a posting to mark it sold, re-list it or delete it.</p>
            </div>
          )}
        </section>

        <section>
          <h2 className="bar">settings</h2>
          <div className="mt-2">
            <AccountForm profile={profile} schoolIds={schoolIds} next={next} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
