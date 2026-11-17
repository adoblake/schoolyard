import { notFound } from "next/navigation";
import { REGIONS, getRegion } from "@/lib/data";

export function generateStaticParams() {
  return REGIONS.map((r) => ({ region: r.slug }));
}

export default async function RegionLayout({ children, params }: LayoutProps<"/[region]">) {
  const { region } = await params;
  if (!getRegion(region)) notFound();
  return children;
}
