import { describe, expect, it } from "vitest";
import { pageItems } from "../data/pagination-logic";
import { bookingDays, formatShortDay, localToday, searchError } from "../patterns/booking-bar-logic";
import { formatCents, formatEuro } from "../lib/format";
import { youtubeId } from "../feedback/VideoModal";
import { avatarTint, initials } from "../content/ReviewCard";

describe("pageItems", () => {
  it("lists every page when there are 7 or fewer", () => {
    expect(pageItems(1, 1)).toEqual([1]);
    expect(pageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(pageItems(1, 0)).toEqual([]);
  });
  it("keeps first, last and neighbours with gaps", () => {
    expect(pageItems(5, 20)).toEqual([1, "…", 4, 5, 6, "…", 20]);
    expect(pageItems(1, 20)).toEqual([1, 2, "…", 20]);
    expect(pageItems(20, 20)).toEqual([1, "…", 19, 20]);
  });
  it("shows the page instead of a gap of one", () => {
    expect(pageItems(4, 20)).toEqual([1, 2, 3, 4, 5, "…", 20]);
  });
});

describe("BookingBar logic", () => {
  const d = (date: string, time = "") => ({ date, time });
  it("counts started 24 h periods, at least one", () => {
    expect(bookingDays(d("2026-08-12", "06:30"), d("2026-08-20", "22:10"))).toBe(9);
    expect(bookingDays(d("2026-08-12", "06:30"), d("2026-08-12", "07:00"))).toBe(1);
    expect(bookingDays(d("2026-08-12"), d("2026-08-13"))).toBe(1);
  });
  it("validates the search like the bundle", () => {
    expect(searchError(d(""), d("2026-08-20"))).toMatch(/Indiquez vos dates/);
    expect(searchError(d("2026-08-20", "10:00"), d("2026-08-20", "09:00"))).toMatch(/après la date de départ/);
    expect(searchError(d("2026-08-12"), d("2026-08-20"))).toBeNull();
  });
  it("formats days and local today", () => {
    expect(formatShortDay("2026-08-12")).toBe("mer. 12 août");
    expect(formatShortDay("")).toBe("");
    expect(localToday(new Date(2026, 7, 12, 23, 30))).toBe("2026-08-12");
  });
});

describe("formatEuro / formatCents", () => {
  it("uses the French format and keeps € with its amount", () => {
    expect(formatEuro(45)).toBe("45,00 €");
    expect(formatEuro(12860)).toBe("12 860,00 €");
    expect(formatCents(5760)).toBe("57,60 €");
  });
});

describe("youtubeId", () => {
  it("extracts ids from every URL shape", () => {
    for (const u of ["https://youtu.be/dQw4w9WgXcQ", "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1", "https://www.youtube.com/embed/dQw4w9WgXcQ", "https://youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"]) {
      expect(youtubeId(u)).toBe("dQw4w9WgXcQ");
    }
  });
});

describe("ReviewCard helpers", () => {
  it("builds initials and a stable token tint", () => {
    expect(initials("Sophie Martin")).toBe("SM");
    expect(initials("karim")).toBe("K");
    expect(avatarTint("Sophie Martin")).toBe(avatarTint("Sophie Martin"));
    expect(avatarTint("Sophie Martin")).toMatch(/^var\(--/);
  });
});
