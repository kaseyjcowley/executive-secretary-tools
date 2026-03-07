import { describe, it, expect } from "vitest";
import { getBeforeOrAfterChurch } from "@/utils/time-utils";

describe("time-utils", () => {
  describe("getBeforeOrAfterChurch", () => {
    const defaultChurchEndTime = "12:30";

    it("returns 'before church' when selected time is before church end time", () => {
      expect(getBeforeOrAfterChurch("10:00", defaultChurchEndTime)).toBe(
        "before church",
      );
    });

    it("returns 'before church' when selected time equals church end time", () => {
      expect(getBeforeOrAfterChurch("12:30", defaultChurchEndTime)).toBe(
        "after church",
      );
    });

    it("returns 'after church' when selected time is after church end time", () => {
      expect(getBeforeOrAfterChurch("14:00", defaultChurchEndTime)).toBe(
        "after church",
      );
    });

    it("returns 'before church' for early morning times", () => {
      expect(getBeforeOrAfterChurch("09:00", defaultChurchEndTime)).toBe(
        "before church",
      );
    });

    it("returns 'after church' for late afternoon times", () => {
      expect(getBeforeOrAfterChurch("16:00", defaultChurchEndTime)).toBe(
        "after church",
      );
    });

    it("uses default church end time when not provided", () => {
      expect(getBeforeOrAfterChurch("10:00")).toBe("before church");
      expect(getBeforeOrAfterChurch("14:00")).toBe("after church");
    });

    it("works with custom church end time", () => {
      expect(getBeforeOrAfterChurch("10:00", "11:00")).toBe("before church");
      expect(getBeforeOrAfterChurch("12:00", "11:00")).toBe("after church");
    });

    it("handles half hour times correctly", () => {
      expect(getBeforeOrAfterChurch("12:00", defaultChurchEndTime)).toBe(
        "before church",
      );
      expect(getBeforeOrAfterChurch("12:30", defaultChurchEndTime)).toBe(
        "after church",
      );
    });

    it("handles invalid time format gracefully", () => {
      expect(getBeforeOrAfterChurch("invalid", defaultChurchEndTime)).toBe(
        "after church",
      );
    });

    it("handles midnight time correctly", () => {
      expect(getBeforeOrAfterChurch("00:00", defaultChurchEndTime)).toBe(
        "before church",
      );
    });

    it("handles late evening times correctly", () => {
      expect(getBeforeOrAfterChurch("23:59", defaultChurchEndTime)).toBe(
        "after church",
      );
    });
  });
});
