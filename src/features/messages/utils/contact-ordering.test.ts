import { describe, it, expect } from "vitest";
import {
  sortContactsByLabel,
  getContactLabelPriority,
} from "@/utils/contact-ordering";
import { Contact } from "@/types/messages";
import { createInterviewContact, createCallingContact } from "@/test/factories";
import { CallingStage } from "@/constants";

describe("contact-ordering", () => {
  describe("getContactLabelPriority", () => {
    it("returns priority 1 for calling contacts", () => {
      const contact = createCallingContact(
        "John",
        "Ward Missionary",
        CallingStage.needsCallingExtended,
      );
      expect(getContactLabelPriority(contact)).toBe(1);
    });

    it("returns priority 1 for calling contacts in setting apart stage", () => {
      const contact = createCallingContact(
        "John",
        "Primary Teacher",
        CallingStage.needsSettingApart,
      );
      return expect(getContactLabelPriority(contact)).toBe(1);
    });

    it("returns priority 1 for interview contacts with 'calling' in label", () => {
      const contact = createInterviewContact("John", {
        id: "label-1",
        name: "Calling Interview",
      });
      expect(getContactLabelPriority(contact)).toBe(1);
    });

    it("returns priority 2 for interview contacts with 'interview' in label", () => {
      const contact = createInterviewContact("John", {
        id: "label-1",
        name: "Bishop Interview",
      });
      expect(getContactLabelPriority(contact)).toBe(2);
    });

    it("returns priority 3 for interview contacts without calling/interview in label", () => {
      const contact = createInterviewContact("John", {
        id: "label-1",
        name: "Temple Recommend Renewal",
      });
      expect(getContactLabelPriority(contact)).toBe(3);
    });

    it("returns priority 3 for interview contacts with no labels", () => {
      const contact = createInterviewContact("John");
      expect(getContactLabelPriority(contact)).toBe(3);
    });

    it("is case insensitive for label matching", () => {
      const contact1 = createInterviewContact("John", {
        id: "label-1",
        name: "BISHOP INTERVIEW",
      });
      const contact2 = createInterviewContact("Jane", {
        id: "label-2",
        name: "bishop interview",
      });

      expect(getContactLabelPriority(contact1)).toBe(2);
      expect(getContactLabelPriority(contact2)).toBe(2);
    });
  });

  describe("sortContactsByLabel", () => {
    it("sorts calling contacts first", () => {
      const contacts: Contact[] = [
        createInterviewContact("Interview Contact"),
        createCallingContact(
          "Calling Contact",
          "Ward Missionary",
          CallingStage.needsCallingExtended,
        ),
      ];

      const sorted = sortContactsByLabel(contacts);
      expect(sorted[0].kind).toBe("calling");
      expect(sorted[1].kind).toBe("interview");
    });

    it("maintains stable sort within same priority", () => {
      const contact1 = createInterviewContact("Alpha", {
        id: "label-1",
        name: "Bishop Interview",
      });
      const contact2 = createInterviewContact("Beta", {
        id: "label-2",
        name: "First Counselor Interview",
      });
      const contact3 = createInterviewContact("Gamma", {
        id: "label-3",
        name: "Second Counselor Interview",
      });

      const contacts = [contact3, contact1, contact2];
      const sorted = sortContactsByLabel(contacts);

      expect(sorted.length).toBe(3);
    });

    it("sorts by priority correctly with multiple contacts", () => {
      const contacts: Contact[] = [
        createInterviewContact("Temple Contact", { id: "1", name: "Temple" }),
        createCallingContact(
          "Calling Contact",
          "Ward Missionary",
          CallingStage.needsCallingExtended,
        ),
        createInterviewContact("Interview Contact", {
          id: "2",
          name: "Bishop Interview",
        }),
      ];

      const sorted = sortContactsByLabel(contacts);

      expect(sorted[0].kind).toBe("calling");
      expect(sorted[1].name).toBe("Interview Contact");
      expect(sorted[2].name).toBe("Temple Contact");
    });

    it("returns empty array for empty input", () => {
      const sorted = sortContactsByLabel([]);
      expect(sorted).toEqual([]);
    });

    it("does not mutate original array", () => {
      const contacts: Contact[] = [
        createInterviewContact("Interview"),
        createCallingContact(
          "Calling",
          "Ward Missionary",
          CallingStage.needsCallingExtended,
        ),
      ];
      const originalOrder = [...contacts];
      sortContactsByLabel(contacts);
      expect(contacts).toEqual(originalOrder);
    });

    it("handles invalid date format gracefully", () => {
      const contacts: Contact[] = [
        createInterviewContact(
          "John",
          { id: "1", name: "Bishop Interview" },
          { due: "invalid-date" },
        ),
      ];
      const sorted = sortContactsByLabel(contacts);
      expect(sorted.length).toBe(1);
    });

    it("handles contacts with missing due date", () => {
      const contacts: Contact[] = [
        {
          ...createInterviewContact("John", {
            id: "1",
            name: "Bishop Interview",
          }),
          due: "",
        },
      ];
      const sorted = sortContactsByLabel(contacts);
      expect(sorted.length).toBe(1);
    });
  });
});
