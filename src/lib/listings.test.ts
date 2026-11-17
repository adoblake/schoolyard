import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS, filterListings, formatPrice, formatTimeAgo, parsePriceToCents } from "./listings";
import { SEED_LISTINGS } from "./data";

const phoenix = { ...DEFAULT_FILTERS, regionSlug: "phoenix" };

describe("filterListings", () => {
  it("only returns listings from the selected region", () => {
    const tucson = filterListings(SEED_LISTINGS, { ...DEFAULT_FILTERS, regionSlug: "tucson" });
    expect(tucson.length).toBeGreaterThan(0);
    expect(tucson.every((l) => l.regionSlug === "tucson")).toBe(true);
  });

  it("filters by school and category", () => {
    const result = filterListings(SEED_LISTINGS, { ...phoenix, schoolId: "gcu", category: "dorm/apartment" });
    expect(result.map((l) => l.id)).toEqual(["seed-2"]);
  });

  it("searches descriptions and school names, all terms must match", () => {
    expect(filterListings(SEED_LISTINGS, { ...phoenix, query: "noble library" }).map((l) => l.id)).toEqual(["seed-1"]);
    expect(filterListings(SEED_LISTINGS, { ...phoenix, query: "asu downtown" }).map((l) => l.id)).toEqual(["seed-3"]);
    expect(filterListings(SEED_LISTINGS, { ...phoenix, query: "fridge textbook" })).toEqual([]);
  });

  it("applies price bounds", () => {
    const result = filterListings(SEED_LISTINGS, { ...phoenix, minPriceCents: 3000, maxPriceCents: 5000 });
    expect(result.map((l) => l.id).sort()).toEqual(["seed-1", "seed-5"]);
  });

  it("sorts by price and by newest", () => {
    const asc = filterListings(SEED_LISTINGS, { ...phoenix, sort: "price-asc" }).map((l) => l.priceCents);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    const newest = filterListings(SEED_LISTINGS, phoenix);
    expect(newest[0].id).toBe("seed-1");
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
