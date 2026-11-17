import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy Policy · SchoolYard" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 17, 2026">
      <p>This explains what SchoolYard collects, why, and what control you have over it.</p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Your school email address</strong>, used to sign you in and to confirm you&apos;re a student. It
          isn&apos;t shown to other users. Listings show only the school domain that verified you (for example
          &ldquo;asu.edu verified&rdquo;).
        </li>
        <li>
          <strong>The name you choose to show and your campus</strong>, displayed on your listings.
        </li>
        <li>
          <strong>Your listings and photos.</strong> Photos are resized in your browser before upload, which removes
          embedded camera data such as GPS location.
        </li>
        <li>
          <strong>Listings you save</strong>, visible only to you.
        </li>
        <li>
          <strong>Campus requests</strong>: the school, city, state, role and optional email you submit when asking us
          to open a campus.
        </li>
        <li>
          <strong>Basic technical data</strong> such as sign-in session cookies, needed to keep you signed in.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        To run the marketplace, keep it limited to students, prevent abuse, and decide which campuses to open next. We
        don&apos;t sell your personal information and we don&apos;t show third-party ads.
      </p>

      <h2>Who we share it with</h2>
      <p>
        Our hosting and database providers process data on our behalf to run the service (currently Supabase for the
        database, sign-in and photo storage). We may disclose information when the law requires it or to protect users
        from harm.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Edit your name and campus on your Account page at any time.</li>
        <li>Delete any listing; its photos are deleted with it.</li>
        <li>Ask us to delete your account and its data entirely.</li>
      </ul>

      <h2>Retention</h2>
      <p>
        Listings expire after 30 days and stop being shown publicly. We keep account data while your account is
        active and delete it when you ask us to.
      </p>

      <h2>Children</h2>
      <p>SchoolYard is for college students and isn&apos;t directed to children under 13.</p>

      <h2>Contact</h2>
      <p>Questions or deletion requests: a contact address will be listed here before launch.</p>
    </LegalPage>
  );
}
