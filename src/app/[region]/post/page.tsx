import type { Metadata } from "next";
import { PostForm } from "@/components/post-form";

export const metadata: Metadata = { title: "New post · SchoolYard" };

export default async function PostPage({ params }: PageProps<"/[region]/post">) {
  const { region } = await params;
  return <PostForm regionSlug={region} />;
}
