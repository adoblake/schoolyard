import { describe, expect, it } from "vitest";
import {
  formatListingPrice,
  formatPrice,
  formatTimeAgo,
  paramSource,
  parseFilters,
  parsePriceToCents,
  safeNextPath,
  searchHref,
  toPrefixTsQuery,
} from "./listings";
import { getRegion } from "./data";

const phoenix = getRegion("phoenix")!;

describe("parseFilters", () => {
  it("reads Craigslist-style search params", () => {
    const f = parseFilters(
      phoenix,
      new URLSearchParams("school=gcu&cat=books&query=lamp&min_price=5&max_price=40.5&has_pic=1&today=1&sort=priceasc&view=gallery&page=2"),
    );
    expect(f).toEqual({
      regionSlug: "phoenix",
      schoolId: "gcu",
      section: "all",
      category: "books",
      query: "lamp",
      minPriceCents: 500,
      maxPriceCents: 4050,
      hasImage: true,
      postedToday: true,
      sort: "price-asc",
      view: "gallery",
      page: 2,
    });
  });

  it("ignores schools from other regions and unknown values", () => {
    const f = parseFilters(phoenix, new URLSearchParams("school=nau&cat=cars&section=nope&min_price=-3&max_price=abc&sort=random&page=0"));
    expect(f.schoolId).toBe("all");
    expect(f.category).toBe("all");
    expect(f.section).toBe("all");
    expect(f.minPriceCents).toBeUndefined();
    expect(f.maxPriceCents).toBeUndefined();
    expect(f.sort).toBe("newest");
    expect(f.page).toBe(1);
  });

  it("accepts a whole section from the form (cat=@housing) or a link (section=housing)", () => {
    expect(parseFilters(phoenix, new URLSearchParams("cat=@housing")).section).toBe("housing");
    expect(parseFilters(phoenix, new URLSearchParams("cat=@housing")).category).toBe("all");
    expect(parseFilters(phoenix, new URLSearchParams("section=housing")).section).toBe("housing");
  });

  it("accepts Next's searchParams object shape", () => {
    const f = parseFilters(phoenix, paramSource({ cat: ["free", "books"], query: undefined }));
    expect(f.category).toBe("free");
    expect(f.query).toBe("");
  });
});

describe("searchHref", () => {
  it("round-trips filters and drops defaults", () => {
    const f = parseFilters(phoenix, new URLSearchParams("cat=dorm/apartment&school=gcu&max_price=40&view=gallery"));
    expect(searchHref(f)).toBe("/phoenix/search?cat=dorm%2Fapartment&school=gcu&max_price=40&view=gallery");
    expect(parseFilters(phoenix, new URLSearchParams(searchHref(f).split("?")[1]))).toEqual(f);
    expect(searchHref(f, { page: 3, view: "list" })).toBe("/phoenix/search?cat=dorm%2Fapartment&school=gcu&max_price=40&page=3");
    expect(searchHref(parseFilters(phoenix, new URLSearchParams()))).toBe("/phoenix/search");
  });
});

describe("formatListingPrice", () => {
  it("formats by category", () => {
    expect(formatListingPrice(4500, "books")).toBe("$45");
    expect(formatListingPrice(65000, "sublets")).toBe("$650/mo");
    expect(formatListingPrice(0, "free")).toBe("free");
    expect(formatListingPrice(0, "lost_found")).toBe("");
    expect(formatListingPrice(2000, "tutoring")).toBe("$20");
  });
});

describe("toPrefixTsQuery", () => {
  it("builds a prefix query and strips operators", () => {
    expect(toPrefixTsQuery("calc text")).toBe("calc:* & text:*");
    expect(toPrefixTsQuery("TI-84 & | ! ':*")).toBe("ti:* & 84:*");
    expect(toPrefixTsQuery("café")).toBe("café:*");
    expect(toPrefixTsQuery("  !!  ")).toBeNull();
  });
});

describe("prices", () => {
  it("formats cents", () => {
    expect(formatPrice(0)).toBe("free");
    expect(formatPrice(4200)).toBe("$42");
    expect(formatPrice(4250)).toBe("$42.50");
    expect(formatPrice(120000)).toBe("$1,200");
  });

  it("parses user input", () => {
    expect(parsePriceToCents("$42")).toBe(4200);
    expect(parsePriceToCents("42.5")).toBe(4250);
    expect(parsePriceToCents("1,200")).toBe(120000);
    expect(parsePriceToCents("0")).toBe(0);
    expect(parsePriceToCents("")).toBeNull();
    expect(parsePriceToCents("-5")).toBeNull();
    expect(parsePriceToCents("abc")).toBeNull();
    expect(parsePriceToCents("4.999")).toBeNull();
  });
});

describe("formatTimeAgo", () => {
  const now = Date.parse("2026-01-10T12:00:00Z");
  it("formats recent times", () => {
    expect(formatTimeAgo("2026-01-10T11:59:40Z", now)).toBe("just now");
    expect(formatTimeAgo("2026-01-10T11:42:00Z", now)).toBe("18 min ago");
    expect(formatTimeAgo("2026-01-10T09:00:00Z", now)).toBe("3 hr ago");
    expect(formatTimeAgo("2026-01-09T10:00:00Z", now)).toBe("yesterday");
    expect(formatTimeAgo("2026-01-05T12:00:00Z", now)).toBe("5 days ago");
  });
});

describe("safeNextPath", () => {
  it("only allows relative paths", () => {
    expect(safeNextPath("/phoenix/post")).toBe("/phoenix/post");
    expect(safeNextPath("https://evil.example")).toBe("/");
    expect(safeNextPath("//evil.example")).toBe("/");
    expect(safeNextPath("/\\evil.example")).toBe("/");
    expect(safeNextPath(null, "/account")).toBe("/account");
  });
});
