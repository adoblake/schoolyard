import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Sign in · SchoolYard" };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-950">
      <div className="mx-auto max-w-sm">
        <div className="mb-6 text-center">
          <div className="text-2xl font-bold tracking-tight">SchoolYard</div>
          <p className="mt-1 text-sm text-zinc-500">Student classifieds for colleges near you</p>
        </div>
        <Suspense fallback={<div className="h-64 rounded-2xl border border-zinc-200 bg-white" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
