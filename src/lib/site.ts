/**
 * Public site URL, used for share previews and the sitemap. Set
 * NEXT_PUBLIC_SITE_URL once there's a custom domain; on Vercel the production
 * URL is picked up automatically until then.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");
export const SITE_NAME = "SchoolYard";
export const TAGLINE = "Buy, sell and trade with verified students at your campus.";
