import { describe, it, expect, vi, beforeEach } from "vitest";
import { matchContact, getPhoneById } from "@/utils/contact-fuzzy-match";

vi.mock("@/data/members.json", () => ({
  default: [
    { id: 1, name: "John Doe", age: 40, gender: "M", phone: "555-0001" },
    { id: 2, name: "Jane Smith", age: 35, gender: "F", phone: "555-0002" },
    { id: 3, name: "Bob Johnson", age: 45, gender: "M", phone: "" },
    { id: 4, name: "Alice Williams", age: 30, gender: "F", phone: "555-0004" },
  ],
}));

describe("contact-fuzzy-match", () => {
  describe("matchContact", () => {
    it("should return ID for exact match", () => {
      const result = matchContact("John Doe");
      expect(result).toBe(1);
    });

    it("should return ID for fuzzy match within threshold", () => {
      const result = matchContact("John D");
      expect(result).toBe(1);
    });

    it("should return undefined for no match", () => {
      const result = matchContact("xyznotfound");
      expect(result).toBeUndefined();
    });

    it("should return undefined if member has no phone", () => {
      const result = matchContact("Bob Johnson");
      expect(result).toBeUndefined();
    });
  });

  describe("getPhoneById", () => {
    it("should return phone for valid ID", () => {
      const result = getPhoneById(1);
      expect(result).toBe("555-0001");
    });

    it("should return undefined for invalid ID", () => {
      const result = getPhoneById(999);
      expect(result).toBeUndefined();
    });

    it("should return undefined for member with empty phone", () => {
      const result = getPhoneById(3);
      expect(result).toBeUndefined();
    });
  });
});
