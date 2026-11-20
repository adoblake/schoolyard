import type { Metadata } from "next";
import { Footer, TopBar } from "@/components/cl";
import { BookMark, BookTile } from "@/components/logo";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "SchoolYard logos and brand",
  description: "Logos, colors and writing style for student groups, campus offices and press writing about SchoolYard.",
};

const DOWNLOADS = [
  { label: "logo (green), SVG", href: "/brand/schoolyard-logo.svg" },
  { label: "logo (white, for dark backgrounds), SVG", href: "/brand/schoolyard-logo-white.svg" },
  { label: "book mark, SVG", href: "/brand/schoolyard-mark.svg" },
  { label: "app icon, SVG", href: "/brand/schoolyard-icon.svg" },
  { label: "app icon, 1024px PNG", href: "/brand/schoolyard-icon-1024.png" },
];

const COLORS = [
  { name: "ivy green", hex: BRAND.green, use: "the wordmark, the book and app icons. Nothing else." },
  { name: "school-bus yellow", hex: BRAND.yellow, use: "the bookmark ribbon only." },
  { name: "ink", hex: BRAND.ink, use: "body text." },
  { name: "link blue", hex: "#0000ee", use: "every link. Visited links turn purple (#551a8b)." },
  { name: "bar gray", hex: "#eeeeee", use: "section headers and boxes, with #cccccc rules." },
];

const VOICE = [
  ["Say what it is.", "“mini fridge, works, $40” beats “Amazing deal on a must-have dorm essential!”"],
  ["Lowercase labels.", "Buttons, links and section names are lowercase: “create a posting”, “for sale”, “favorites”."],
  ["SchoolYard in sentences, schoolyard in the logo.", "Write the name as SchoolYard in text. The lowercase form is only the wordmark."],
  ["No hype, no emoji, no exclamation marks.", "The listings are the content. The site stays out of the way."],
  ["Talk like a student.", "Campus, pickup spot, move-out, sublet. Not “users”, “inventory” or “solutions”."],
  ["Name the school, never borrow it.", "Say which campuses SchoolYard serves, but don’t use a school’s logo, seal or colors next to ours or suggest a school endorses it."],
] as const;

export default function BrandPage() {
  return (
    <div>
      <TopBar crumbs={[{ label: "logos & brand" }]} />
      <main className="mx-auto max-w-3xl space-y-7 px-3 py-5 text-[15px] leading-relaxed">
        <section>
          <h1 className="text-2xl font-bold">SchoolYard logos and brand</h1>
          <p className="mt-2">
            For student groups, campus offices, flyers and press. SchoolYard looks like what it is: a plain, fast
            classifieds page for one campus. The only decoration is an open book with a yellow bookmark.
          </p>
        </section>

        <section>
          <h2 className="bar">logo</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-center border border-rule p-6">
              <span className="inline-flex items-center gap-2 text-[34px] font-bold leading-none tracking-tight text-brand">
                <BookMark className="h-10 w-10" />
                schoolyard
              </span>
            </div>
            <div className="flex items-center justify-center border border-rule bg-brand p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/schoolyard-logo-white.svg" alt="schoolyard logo in white" className="h-10 w-auto" />
            </div>
            <div className="flex items-center justify-center gap-5 border border-rule p-6">
              <BookMark className="h-16 w-16" title="book mark" />
              <BookTile className="h-16 w-16" />
              <BookTile className="h-8 w-8" />
              <BookTile className="h-4 w-4" />
            </div>
            <ul className="space-y-1 border border-rule p-3 text-[14px]">
              <li className="font-bold">downloads</li>
              {DOWNLOADS.map((d) => (
                <li key={d.href}>
                  <a href={d.href} download>
                    {d.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <ul className="mt-3 ml-6 list-disc space-y-1 text-[14px]">
            <li>Leave clear space around the logo at least as wide as the book.</li>
            <li>Use the full logo at 100px wide or more; below that, use the app icon.</li>
            <li>Don&apos;t recolor, stretch, outline, shadow or rearrange it.</li>
          </ul>
        </section>

        <section>
          <h2 className="bar">colors</h2>
          <ul className="mt-3 space-y-2">
            {COLORS.map((c) => (
              <li key={c.hex} className="flex items-start gap-3">
                <span className="mt-0.5 inline-block h-6 w-10 shrink-0 border border-rule" style={{ background: c.hex }} aria-hidden />
                <span>
                  <strong>{c.name}</strong> <code className="text-[13px] text-zinc-600">{c.hex}</code>: {c.use}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[14px] text-zinc-600">
            Type is Arial (or Helvetica, or Liberation Sans): 14px body, bold for titles and prices.
          </p>
        </section>

        <section>
          <h2 className="bar">how SchoolYard talks</h2>
          <dl className="mt-3 space-y-2">
            {VOICE.map(([rule, example]) => (
              <div key={rule}>
                <dt className="font-bold">{rule}</dt>
                <dd className="text-zinc-700">{example}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="bar">one-line description</h2>
          <p className="mt-2">
            SchoolYard is a free classifieds site where college students buy, sell and trade with other verified
            students at their campus.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
