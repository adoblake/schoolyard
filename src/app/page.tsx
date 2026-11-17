import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GraduationCap, HandCoins, MapPin, ShieldCheck, Store } from "lucide-react";
import { CampusRequestForm } from "@/components/campus-request-form";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { REGIONS } from "@/lib/data";
import { TAGLINE } from "@/lib/site";

export const metadata: Metadata = {
  title: "SchoolYard · the student marketplace for your campus",
  description: TAGLINE,
};

const STEPS = [
  {
    title: "Sign in with your school email",
    body: "No password. Only students with a verified school address can post or reply, so you're dealing with classmates, not strangers.",
  },
  {
    title: "Post in about a minute",
    body: "Title, price, pickup spot and a few photos. Pick a category like books, furniture or dorm stuff.",
  },
  {
    title: "Meet on campus",
    body: "Hand it off at the library or the student union. Pay however you both like.",
  },
];

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Verified students only",
    body: "Every seller signed in with a school email. Listings show which school verified them.",
  },
  {
    icon: MapPin,
    title: "Built around campuses",
    body: "Each city has its own SchoolYard, and every listing is tagged to a campus, so pickup is a short walk.",
  },
  {
    icon: HandCoins,
    title: "Free to post",
    body: "No listing fees and no cut of your sale. Keep what you make on that textbook.",
  },
  {
    icon: Store,
    title: "Made for the school year",
    body: "Textbooks at the start of term, furniture at move-out, tutoring and wanted posts all year.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-xl font-bold tracking-tight">
            SchoolYard
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link href="/schools" className="rounded-xl px-3 py-2 hover:bg-zinc-100">
              For schools
            </Link>
            <Button asChild size="sm" className="rounded-xl">
              <Link href="/login">Sign in</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="bg-white px-4 pb-10 pt-10">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-600">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden /> Student classifieds
            </p>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl">
              The marketplace for your campus, with only students on it.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-zinc-600">{TAGLINE} Textbooks, dorm furniture, electronics, free stuff and more.</p>

            <h2 className="mb-3 mt-8 text-xs font-bold uppercase tracking-wide text-zinc-500">Choose your SchoolYard</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {REGIONS.map((r) => (
                <Link
                  key={r.slug}
                  href={`/${r.slug}`}
                  className="group flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-950 hover:bg-white"
                >
                  <span className="flex items-center justify-between font-bold">
                    {r.label}
                    <ArrowRight className="h-4 w-4 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-zinc-950" aria-hidden />
                  </span>
                  <span className="mt-1 text-sm text-zinc-500">{r.subtitle}</span>
                  <span className="mt-3 text-xs leading-5 text-zinc-400">{r.schools.map((s) => s.name).join(" · ")}</span>
                </Link>
              ))}
            </div>
            <p className="mt-3 text-sm text-zinc-500">
              Not in Arizona? <a href="#request" className="font-medium text-zinc-900 underline">Request your campus</a>.
            </p>
          </div>
        </section>

        <section className="px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step.title} className="rounded-2xl border border-zinc-200 bg-white p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-y border-zinc-200 bg-white px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight">Why students use SchoolYard</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {REASONS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-zinc-900" aria-hidden />
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="request" className="scroll-mt-4 px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight">Bring SchoolYard to your campus</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
              We open campuses where students ask for them. Tell us where you are; requests decide which schools open next.
            </p>
            <div className="mt-6">
              <CampusRequestForm />
            </div>
          </div>
        </section>

        <section className="px-4 pb-12">
          <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 rounded-2xl bg-zinc-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Work at a college?</h2>
              <p className="mt-1 text-sm text-zinc-300">See how SchoolYard helps with move-out waste, costs and safety.</p>
            </div>
            <Button asChild variant="outline" className="rounded-xl border-white bg-transparent text-white hover:bg-white hover:text-zinc-950">
              <Link href="/schools">For schools</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
