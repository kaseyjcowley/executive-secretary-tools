import { describe, it, expect } from "vitest";
import {
  formatNameList,
  getPossessive,
  pluralize,
  getPronoun,
  conjugateVerb,
  getPossessiveForNameList,
} from "@/utils/grammar";

describe("grammar utilities", () => {
  describe("formatNameList", () => {
    it("returns empty string for empty array", () => {
      expect(formatNameList([])).toBe("");
    });

    it("returns single name without modification", () => {
      expect(formatNameList(["John"])).toBe("John");
    });

    it("joins two names with 'and'", () => {
      expect(formatNameList(["John", "Jane"])).toBe("John and Jane");
    });

    it("joins three or more names with commas and 'and'", () => {
      expect(formatNameList(["John", "Jane", "Bob"])).toBe(
        "John, Jane, and Bob",
      );
    });

    it("handles four names correctly", () => {
      expect(formatNameList(["John", "Jane", "Bob", "Alice"])).toBe(
        "John, Jane, Bob, and Alice",
      );
    });
  });

  describe("getPossessive", () => {
    it("returns empty string for empty input", () => {
      expect(getPossessive("")).toBe("");
    });

    it("adds 's to names not ending in s", () => {
      expect(getPossessive("John")).toBe("John's");
    });

    it("adds only apostrophe to names ending in s", () => {
      expect(getPossessive("Jones")).toBe("Jones'");
    });

    it("handles names ending in s with special cases", () => {
      expect(getPossessive("Chris")).toBe("Chris'");
    });
  });

  describe("pluralize", () => {
    it("returns singular for count of 1", () => {
      expect(pluralize("cat", 1)).toBe("cat");
    });

    it("adds s to regular words", () => {
      expect(pluralize("cat", 2)).toBe("cats");
    });

    it("adds es to words ending in s", () => {
      expect(pluralize("class", 2)).toBe("classes");
    });

    it("adds es to words ending in sh", () => {
      expect(pluralize("wish", 2)).toBe("wishes");
    });

    it("adds es to words ending in ch", () => {
      expect(pluralize("church", 2)).toBe("churches");
    });

    it("handles count of 0", () => {
      expect(pluralize("cat", 0)).toBe("cats");
    });
  });

  describe("getPronoun", () => {
    it("returns 'your' when recipient is true", () => {
      expect(getPronoun(true)).toBe("your");
    });

    it("returns 'their' when recipient is false", () => {
      expect(getPronoun(false)).toBe("their");
    });

    it("returns 'your' for multiple recipients when isRecipient is true", () => {
      expect(getPronoun(true)).toBe("your");
    });

    it("returns 'their' for multiple subjects when isRecipient is false", () => {
      expect(getPronoun(false)).toBe("their");
    });
  });

  describe("conjugateVerb", () => {
    it("returns singular form for count of 1", () => {
      expect(conjugateVerb("walk", 1)).toBe("walks");
    });

    it("returns plural form for count > 1", () => {
      expect(conjugateVerb("walk", 2)).toBe("walk");
    });

    it("adds es to verbs ending in s", () => {
      expect(conjugateVerb("kiss", 1)).toBe("kisses");
    });

    it("adds es to verbs ending in sh", () => {
      expect(conjugateVerb("wish", 1)).toBe("wishes");
    });

    it("adds es to verbs ending in ch", () => {
      expect(conjugateVerb("watch", 1)).toBe("watches");
    });

    it("adds es to verbs ending in x", () => {
      expect(conjugateVerb("fix", 1)).toBe("fixes");
    });

    it("adds es to verbs ending in z", () => {
      expect(conjugateVerb("buzz", 1)).toBe("buzzes");
    });

    it("changes verbs ending in y to ies when preceded by consonant", () => {
      expect(conjugateVerb("try", 1)).toBe("tries");
    });

    it("keeps y and adds s when preceded by vowel", () => {
      expect(conjugateVerb("play", 1)).toBe("plays");
    });

    it("handles 'have' as special case", () => {
      expect(conjugateVerb("have", 1)).toBe("has");
    });
  });

  describe("getPossessiveForNameList", () => {
    it("returns empty string for empty array", () => {
      expect(getPossessiveForNameList([])).toBe("");
    });

    it("returns possessive form for single name", () => {
      expect(getPossessiveForNameList(["John"])).toBe("John's");
    });

    it("returns possessive form for two names (only last name possessive)", () => {
      expect(getPossessiveForNameList(["John", "Jane"])).toBe(
        "John and Jane's",
      );
    });

    it("returns plural possessive for three or more names (only last name plural)", () => {
      expect(getPossessiveForNameList(["John", "Jane", "Bob"])).toBe(
        "John, Jane, and Bob's",
      );
    });

    it("handles names ending in s correctly", () => {
      expect(getPossessiveForNameList(["Jones", "Chris"])).toBe(
        "Jones and Chris'",
      );
    });

    it("handles four names correctly", () => {
      expect(getPossessiveForNameList(["John", "Jane", "Bob", "Alice"])).toBe(
        "John, Jane, Bob, and Alice's",
      );
    });
  });
});
