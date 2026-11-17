import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer, TopBar } from "@/components/cl";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "log in · SchoolYard" };

export default function LoginPage() {
  return (
    <div>
      <TopBar crumbs={[{ label: "log in" }]} />
      <main className="mx-auto max-w-6xl px-3 pt-5">
        <Suspense fallback={<div className="h-48" />}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
