import type { Metadata } from "next";
import Link from "next/link";
import { CampusRequestForm } from "@/components/campus-request-form";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "SchoolYard for colleges and universities",
  description:
    "A verified-student marketplace that keeps usable items out of move-out dumpsters, lowers costs for students and keeps buying and selling within your campus community.",
};

const FACTS = [
  {
    figure: "25 → 105 tons",
    text: "Monthly waste at the University of New Hampshire jumped from about 25 tons to 105 tons during May move-out.",
    source: { label: "Resource Recycling, June 2026", href: "https://resource-recycling.com/recycling/2026/06/19/what-happens-to-college-move-out-waste/" },
  },
  {
    figure: "113 tons",
    text: "Material Boston University's \"Goodwill, Not Landfill\" program diverted during the spring 2024 move-out alone.",
    source: { label: "Resource Recycling, June 2026", href: "https://resource-recycling.com/recycling/2026/06/19/what-happens-to-college-move-out-waste/" },
  },
  {
    figure: "$341",
    text: "Average a student spent on required course materials in the 2024–25 school year.",
    source: { label: "NACS Student Watch 2025", href: "https://www.nacs.org/student-watch-report-course-materials-spending-stable" },
  },
];

const BENEFITS = [
  {
    title: "Less move-out waste",
    body: "Students list the mini fridge, desk chair and lamp before move-out week, and incoming students buy them. Every handoff is one less item in a dumpster or a donation truck.",
  },
  {
    title: "Lower cost of attendance",
    body: "Used textbooks, calculators and dorm basics change hands between students at student prices, with no fees taken from either side.",
  },
  {
    title: "A safer alternative to open marketplaces",
    body: "Only people who prove they have your school's email can post or reply. Listings are tied to a campus and a pickup spot, and we encourage meeting in public campus locations.",
  },
  {
    title: "No cost and no IT project",
    body: "SchoolYard is free for schools. There is nothing to install or integrate: students sign in with the school email they already have.",
  },
];

const ASKS = [
  "Confirm your student email domain so verification is accurate.",
  "Mention SchoolYard at orientation, in housing emails and before move-out.",
  "Suggest a few well-lit, public spots on campus for exchanges (some campuses already have safe-exchange zones at campus police).",
  "Tell us about items your campus doesn't allow, so we can keep them off your listings.",
];

export default function SchoolsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-xl font-bold tracking-tight">
            SchoolYard
          </Link>
          <Button asChild size="sm" variant="outline" className="rounded-xl">
            <Link href="/phoenix">See it live</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="bg-white px-4 py-10">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">For colleges and universities</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl">
              Keep good stuff on campus and out of the dumpster.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-600">
              SchoolYard is a buy-and-sell marketplace limited to verified students, organized by campus. It gives
              students somewhere better than a dumpster or an anonymous marketplace to pass things on.
            </p>
          </div>
        </section>

        <section className="px-4 py-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-bold tracking-tight">The problem, in numbers</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {FACTS.map((f) => (
                <figure key={f.figure} className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5">
                  <div className="text-3xl font-bold tabular-nums tracking-tight">{f.figure}</div>
                  <p className="mt-2 flex-1 text-sm leading-6 text-zinc-600">{f.text}</p>
                  <figcaption className="mt-3 text-xs text-zinc-400">
                    Source:{" "}
                    <a href={f.source.href} className="underline" target="_blank" rel="noreferrer">
                      {f.source.label}
                    </a>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-200 bg-white px-4 py-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-bold tracking-tight">What your campus gets</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <div key={b.title}>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-bold tracking-tight">What we&apos;d ask of a partner campus</h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-700">
              {ASKS.map((a) => (
                <li key={a} className="flex gap-2">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-900" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-4 pb-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-bold tracking-tight">Talk to us about your campus</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Leave your school and email and we&apos;ll follow up.
            </p>
            <div className="mt-5">
              <CampusRequestForm defaultRole="staff" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
