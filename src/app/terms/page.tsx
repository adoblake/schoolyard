import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms of Use · SchoolYard" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="November 17, 2026">
      <p>
        SchoolYard is a classifieds site where verified college students list items and services for other students.
        By using SchoolYard you agree to these terms.
      </p>

      <h2>Who can use SchoolYard</h2>
      <ul>
        <li>Anyone can browse. Posting, saving and messaging require signing in with a school email address we support.</li>
        <li>You must be at least 18, or have permission from a parent or guardian.</li>
        <li>One account per person. Keep access to your school email secure; anything posted from your account is your responsibility.</li>
      </ul>

      <h2>SchoolYard is a meeting place, not a seller</h2>
      <p>
        Buyers and sellers deal directly with each other. SchoolYard doesn&apos;t own, inspect or guarantee anything
        listed, doesn&apos;t handle payments, and isn&apos;t a party to any sale. Meet in public places on campus,
        inspect items before paying, and use your judgment.
      </p>

      <h2>What you can&apos;t post</h2>
      <ul>
        <li>Weapons, ammunition, explosives or fireworks</li>
        <li>Drugs, drug paraphernalia, alcohol, tobacco or vaping products, or prescription medication</li>
        <li>Stolen, counterfeit or recalled goods</li>
        <li>Completing assignments, papers or exams for someone else, or selling exams or answer keys</li>
        <li>Housing you don&apos;t have the right to rent or sublet, or any listing that asks for payment before viewing</li>
        <li>Animals, adult content, or anything illegal where you are or banned by your school</li>
        <li>Misleading listings, spam, or posts that harass or discriminate against anyone</li>
      </ul>
      <p>Tutoring and study help are welcome as long as the work submitted for grades stays the student&apos;s own.</p>

      <h2>Your content</h2>
      <p>
        You keep ownership of what you post. You give SchoolYard permission to host and display it so the service
        works. Only post photos you took or have the right to use, and don&apos;t include other people&apos;s
        personal information.
      </p>

      <h2>Removal and suspension</h2>
      <p>
        We may remove listings or suspend accounts that break these terms or put others at risk, and we may cooperate
        with campus or law enforcement authorities when required.
      </p>

      <h2>Fees</h2>
      <p>
        SchoolYard is currently free. If we introduce fees for posting in the future, we&apos;ll announce them in
        advance and they won&apos;t apply to listings already posted.
      </p>

      <h2>No warranty</h2>
      <p>
        SchoolYard is provided as is. To the extent the law allows, we aren&apos;t liable for losses arising from
        transactions between users or from use of the service.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms. If changes are significant, we&apos;ll let signed-in users know.</p>
    </LegalPage>
  );
}
