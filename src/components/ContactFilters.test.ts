import { describe, it, expect } from "vitest";
import { createInterviewContact, createCallingContact } from "@/test/factories";
import { CallingStage } from "@/constants";
import { filterContacts, FilterState } from "@/components/ContactFilters";
import type { Contact } from "@/types/messages";

describe("filterContacts", () => {
  const contacts: Contact[] = [
    createInterviewContact("John Doe", { id: "1", name: "Bishop Interview" }),
    createInterviewContact("Jane Smith", { id: "2", name: "Temple Recommend" }),
    createInterviewContact("Bob Wilson", { id: "3", name: "Member Record" }),
    createCallingContact(
      "Alice Brown",
      "Primary Teacher",
      CallingStage.needsCallingExtended,
    ),
    createCallingContact(
      "Charlie Davis",
      "Ward Mission Leader",
      CallingStage.needsSettingApart,
    ),
    createCallingContact(
      "Eve Miller",
      "Organist",
      CallingStage.needsCallingExtended,
    ),
  ];

  // Set assigned property on callings
  (contacts[3] as Contact & { assigned: string }).assigned = "Bishop";
  (contacts[4] as Contact & { assigned: string }).assigned = "Bishop";
  (contacts[5] as Contact & { assigned: string }).assigned = "First Counselor";

  const emptyFilters: FilterState = {
    type: "all",
    status: "all",
    label: "",
    stage: "all",
    assigned: "",
  };

  describe("type filter", () => {
    it("returns all contacts when type is 'all'", () => {
      const result = filterContacts(contacts, { ...emptyFilters, type: "all" });
      expect(result).toHaveLength(6);
    });

    it("filters to only interviews when type is 'interview'", () => {
      const result = filterContacts(contacts, {
        ...emptyFilters,
        type: "interview",
      });
      expect(result).toHaveLength(3);
      expect(result.every((c) => c.kind === "interview")).toBe(true);
    });

    it("filters to only callings when type is 'calling'", () => {
      const result = filterContacts(contacts, {
        ...emptyFilters,
        type: "calling",
      });
      expect(result).toHaveLength(3);
      expect(result.every((c) => c.kind === "calling")).toBe(true);
    });
  });

  describe("label filter", () => {
    it("returns all interviews when label is empty", () => {
      const result = filterContacts(contacts, {
        ...emptyFilters,
        type: "interview",
        label: "",
      });
      expect(result).toHaveLength(3);
    });

    it("filters by label name", () => {
      const result = filterContacts(contacts, {
        ...emptyFilters,
        type: "interview",
        label: "Bishop Interview",
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("John Doe");
    });

    it("returns empty array when label doesn't match", () => {
      const result = filterContacts(contacts, {
        ...emptyFilters,
        type: "interview",
        label: "Non-existent",
      });
      expect(result).toHaveLength(0);
    });

    it("ignores label filter for callings (filters them out)", () => {
      // Current behavior: label filter is only applied to interviews
      // When type is calling and label is set, callings are filtered out
      const result = filterContacts(contacts, {
        ...emptyFilters,
        type: "calling",
        label: "Bishop Interview",
      });
      expect(result).toHaveLength(0);
    });
  });

  describe("stage filter", () => {
    it("returns all callings when stage is 'all'", () => {
      const result = filterContacts(contacts, {
        ...emptyFilters,
        type: "calling",
        stage: "all",
      });
      expect(result).toHaveLength(3);
    });

    it("filters by needsCallingExtended stage", () => {
      const result = filterContacts(contacts, {
        ...emptyFilters,
        type: "calling",
        stage: CallingStage.needsCallingExtended,
      });
      expect(result).toHaveLength(2);
      expect(
        result.every(
          (c) =>
            c.kind === "calling" &&
            c.stage === CallingStage.needsCallingExtended,
        ),
      ).toBe(true);
    });

    it("filters by needsSettingApart stage", () => {
      const result = filterContacts(contacts, {
        ...emptyFilters,
        type: "calling",
        stage: CallingStage.needsSettingApart,
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Charlie Davis");
    });

    it("ignores stage filter for interviews (filters them out)", () => {
      // Current behavior: stage filter is only applied to callings
      // When type is interview and stage is set, interviews are filtered out
      const result = filterContacts(contacts, {
        ...emptyFilters,
        type: "interview",
        stage: CallingStage.needsCallingExtended,
      });
      expect(result).toHaveLength(0);
    });
  });

  describe("assigned filter", () => {
    it("returns all contacts when assigned is empty", () => {
      const result = filterContacts(contacts, {
        ...emptyFilters,
        assigned: "",
      });
      expect(result).toHaveLength(6);
    });

    it("filters by assigned member", () => {
      const result = filterContacts(contacts, {
        ...emptyFilters,
        assigned: "Bishop",
      });
      expect(result).toHaveLength(2);
      expect(result.every((c) => c.assigned === "Bishop")).toBe(true);
    });

    it("returns empty when no contacts match assigned", () => {
      const result = filterContacts(contacts, {
        ...emptyFilters,
        assigned: "Non-existent",
      });
      expect(result).toHaveLength(0);
    });
  });

  describe("combined filters", () => {
    it("applies multiple filters together", () => {
      const result = filterContacts(contacts, {
        type: "calling",
        status: "all",
        label: "",
        stage: CallingStage.needsCallingExtended,
        assigned: "Bishop",
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Alice Brown");
    });

    it("returns empty when no contacts match all filters", () => {
      const result = filterContacts(contacts, {
        type: "calling",
        status: "all",
        label: "",
        stage: CallingStage.needsSettingApart,
        assigned: "First Counselor",
      });
      expect(result).toHaveLength(0);
    });
  });
});
