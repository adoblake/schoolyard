import { describe, expect, it } from "vitest";
import {
  formatPrice,
  formatTimeAgo,
  paramSource,
  parseFilters,
  parsePriceToCents,
  safeNextPath,
  toPrefixTsQuery,
} from "./listings";
import { getRegion } from "./data";

const phoenix = getRegion("phoenix")!;

describe("parseFilters", () => {
  it("reads valid filters from the URL", () => {
    const f = parseFilters(phoenix, new URLSearchParams("school=gcu&cat=books&q=lamp&min=5&max=40.5&sort=price-asc"));
    expect(f).toEqual({
      regionSlug: "phoenix",
      schoolId: "gcu",
      category: "books",
      query: "lamp",
      minPriceCents: 500,
      maxPriceCents: 4050,
      sort: "price-asc",
    });
  });

  it("ignores schools from other regions and unknown values", () => {
    const f = parseFilters(phoenix, new URLSearchParams("school=nau&cat=cars&min=-3&max=abc&sort=random"));
    expect(f.schoolId).toBe("all");
    expect(f.category).toBe("all");
    expect(f.minPriceCents).toBeUndefined();
    expect(f.maxPriceCents).toBeUndefined();
    expect(f.sort).toBe("newest");
  });

  it("accepts Next's searchParams object shape", () => {
    const f = parseFilters(phoenix, paramSource({ cat: ["free", "books"], q: undefined }));
    expect(f.category).toBe("free");
    expect(f.query).toBe("");
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
