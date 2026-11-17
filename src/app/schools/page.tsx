import type { Metadata } from "next";
import Link from "next/link";
import { CampusRequestForm } from "@/components/campus-request-form";
import { Footer, TopBar } from "@/components/cl";

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
    <div>
      <TopBar crumbs={[{ label: "for schools" }]} />
      <main className="mx-auto max-w-3xl space-y-6 px-3 py-5 text-[15px] leading-relaxed">
        <section>
          <h1 className="text-2xl font-bold">SchoolYard for colleges and universities</h1>
          <p className="mt-2">
            SchoolYard is a classifieds site limited to verified students and organized by campus. It gives students
            somewhere better than a dumpster or an anonymous marketplace to pass things on, and it&apos;s free for
            schools. <Link href="/phoenix">See it live</Link>.
          </p>
        </section>

        <section>
          <h2 className="bar">the problem, in numbers</h2>
          <ul className="mt-2 space-y-3">
            {FACTS.map((f) => (
              <li key={f.figure}>
                <strong className="text-[18px]">{f.figure}</strong>: {f.text}{" "}
                <a href={f.source.href} target="_blank" rel="noreferrer" className="text-[13px]">
                  ({f.source.label})
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="bar">what your campus gets</h2>
          <dl className="mt-2 space-y-3">
            {BENEFITS.map((b) => (
              <div key={b.title}>
                <dt className="font-bold">{b.title}</dt>
                <dd>{b.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="bar">what we&apos;d ask of a partner campus</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {ASKS.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="bar">talk to us about your campus</h2>
          <p className="mt-2">Leave your school and email and we&apos;ll follow up.</p>
          <div className="mt-3 max-w-xl">
            <CampusRequestForm defaultRole="staff" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
