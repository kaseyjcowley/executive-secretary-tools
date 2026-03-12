import { describe, it, expect } from "vitest";
import {
  formatTimeForDisplay,
  formatAppointmentDate,
} from "@/utils/date-formatters";

describe("date-formatters", () => {
  describe("formatTimeForDisplay", () => {
    it("should format 24h time to 12h with AM/PM", () => {
      expect(formatTimeForDisplay("09:00")).toBe("9:00 AM");
      expect(formatTimeForDisplay("14:30")).toBe("2:30 PM");
      expect(formatTimeForDisplay("00:00")).toBe("12:00 AM");
      expect(formatTimeForDisplay("12:00")).toBe("12:00 PM");
    });
  });

  describe("formatAppointmentDate", () => {
    it("should return 'Sunday' if tomorrow is not Sunday", () => {
      const result = formatAppointmentDate();
      expect(result).toMatch(/^Sunday|tomorrow$/);
    });
  });
});
