import { redirect } from "next/navigation";
import { DEFAULT_REGION_SLUG } from "@/lib/data";

export default function Home() {
  redirect(`/${DEFAULT_REGION_SLUG}`);
}
