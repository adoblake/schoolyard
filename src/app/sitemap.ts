import type { MetadataRoute } from "next";
import { REGIONS } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/schools` },
    ...REGIONS.map((r) => ({ url: `${SITE_URL}/${r.slug}` })),
    { url: `${SITE_URL}/terms` },
    { url: `${SITE_URL}/privacy` },
  ];
}
