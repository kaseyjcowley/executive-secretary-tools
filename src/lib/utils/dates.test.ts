import { describe, it, expect } from "vitest";
import { wasYesterdayLastSundayOfMonth, getLastSundayOfMonth } from "./dates";

describe("dates", () => {
  describe("wasYesterdayLastSundayOfMonth", () => {
    it("returns true when yesterday was the last Sunday of March 2026 (March 29)", () => {
      const mondayMarch30 = new Date(2026, 2, 30);
      expect(wasYesterdayLastSundayOfMonth(mondayMarch30)).toBe(true);
    });

    it("returns false when yesterday was not the last Sunday of the month", () => {
      const mondayMarch23 = new Date(2026, 2, 23);
      expect(wasYesterdayLastSundayOfMonth(mondayMarch23)).toBe(false);
    });

    it("returns true when yesterday was the last Sunday of February 2026 (Feb 22)", () => {
      const mondayFeb23 = new Date(2026, 1, 23);
      expect(wasYesterdayLastSundayOfMonth(mondayFeb23)).toBe(true);
    });

    it("returns false for a regular Monday after a regular Sunday", () => {
      const mondayMarch2 = new Date(2026, 2, 2);
      expect(wasYesterdayLastSundayOfMonth(mondayMarch2)).toBe(false);
    });

    it("returns true when yesterday was the only Sunday of February in a non-leap year", () => {
      const mondayFeb24 = new Date(2025, 1, 24);
      expect(wasYesterdayLastSundayOfMonth(mondayFeb24)).toBe(true);
    });

    it("handles January correctly (last Sunday was Jan 25 in 2026)", () => {
      const mondayJan26 = new Date(2026, 0, 26);
      expect(wasYesterdayLastSundayOfMonth(mondayJan26)).toBe(true);
    });

    it("handles December correctly (last Sunday was Dec 28 in 2025)", () => {
      const mondayDec29 = new Date(2025, 11, 29);
      expect(wasYesterdayLastSundayOfMonth(mondayDec29)).toBe(true);
    });

    it("returns false when yesterday was a regular Sunday but not the last", () => {
      const sundayMarch8 = new Date(2026, 2, 9);
      expect(wasYesterdayLastSundayOfMonth(sundayMarch8)).toBe(false);
    });
  });

  describe("getLastSundayOfMonth", () => {
    it("returns March 29, 2026 for March 2026", () => {
      const march = new Date(2026, 2, 15);
      const lastSunday = getLastSundayOfMonth(march);
      expect(lastSunday.getDate()).toBe(29);
      expect(lastSunday.getMonth()).toBe(2);
    });

    it("returns Feb 22, 2026 for February 2026 (not a leap year)", () => {
      const feb = new Date(2026, 1, 15);
      const lastSunday = getLastSundayOfMonth(feb);
      expect(lastSunday.getDate()).toBe(22);
      expect(lastSunday.getMonth()).toBe(1);
    });

    it("returns Feb 27, 2028 for February 2028 (leap year)", () => {
      const feb = new Date(2028, 1, 15);
      const lastSunday = getLastSundayOfMonth(feb);
      expect(lastSunday.getDate()).toBe(27);
      expect(lastSunday.getMonth()).toBe(1);
    });

    it("returns Jan 31, 2027 for January 2027 (31st is Sunday)", () => {
      const jan = new Date(2027, 0, 15);
      const lastSunday = getLastSundayOfMonth(jan);
      expect(lastSunday.getDate()).toBe(31);
      expect(lastSunday.getMonth()).toBe(0);
    });
  });
});
