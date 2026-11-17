import type { Metadata } from "next";
import { SavedView } from "@/components/saved-view";

export const metadata: Metadata = { title: "Saved · SchoolYard" };

export default async function SavedPage({ params }: PageProps<"/[region]/saved">) {
  const { region } = await params;
  return <SavedView regionSlug={region} />;
}
