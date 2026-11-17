import type { Metadata } from "next";
import Link from "next/link";
import { CampusRequestForm } from "@/components/campus-request-form";
import { Footer, TopBar } from "@/components/cl";
import { TAGLINE } from "@/lib/site";

export const metadata: Metadata = { title: "About SchoolYard", description: TAGLINE };

export default function AboutPage() {
  return (
    <div>
      <TopBar crumbs={[{ label: "about" }]} />
      <main className="mx-auto max-w-3xl space-y-6 px-3 py-5 text-[15px] leading-relaxed">
        <section>
          <h1 className="text-2xl font-bold">About SchoolYard</h1>
          <p className="mt-2">
            SchoolYard is a classifieds site for college students. Each city has its own SchoolYard (like{" "}
            <Link href="/phoenix">phoenix</Link>), every listing belongs to a campus, and only people with a school
            email can post or reply. Textbooks, dorm furniture, electronics, sublets, tutoring, lost &amp; found and
            free stuff all change hands between students, a short walk away.
          </p>
        </section>

        <section>
          <h2 className="bar">how it works</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-6">
            <li>
              <Link href="/login">Log in</Link> with your school email. We email you a link; there&apos;s no password.
            </li>
            <li>Choose a category and post a title, price, pickup spot and photos.</li>
            <li>Buyers find it by city, campus, category or search, and you meet on campus to trade.</li>
          </ol>
        </section>

        <section>
          <h2 className="bar">why only students</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Every seller verified a school email, and listings show which school.</li>
            <li>Listings are tied to a campus and a pickup spot, so trades stay local.</li>
            <li>Posting is free: no listing fees and no cut of the sale.</li>
          </ul>
        </section>

        <section id="safety" className="scroll-mt-4">
          <h2 className="bar">safety tips</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Meet in a busy public place on campus: a library, student union or campus police safe-exchange spot.</li>
            <li>See the item before you pay. Never pay a deposit for something or somewhere you haven&apos;t seen.</li>
            <li>Be wary of anyone who asks you to move off SchoolYard, wire money or use gift cards.</li>
            <li>
              Use <strong>flag</strong> on any listing that looks like a scam or breaks the{" "}
              <Link href="/terms#prohibited">rules</Link>.
            </li>
          </ul>
        </section>

        <section id="request" className="scroll-mt-4">
          <h2 className="bar">request your campus</h2>
          <p className="mt-2">
            We open campuses where students ask for them. Tell us where you are; requests decide which schools open next.
          </p>
          <div className="mt-3 max-w-xl">
            <CampusRequestForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
