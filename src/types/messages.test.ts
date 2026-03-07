import { describe, it, expect } from "vitest";
import { isContactGroup, ContactGroup, Contact } from "@/types/messages";
import { CallingStage } from "@/constants";

const createContact = (): Contact => ({
  name: "John Doe",
  due: "2024-01-15T14:00:00.000Z",
  idMembers: "member-1",
  assigned: undefined,
  kind: "interview",
});

const createContactGroup = (): ContactGroup => ({
  id: "group-1",
  memberIds: ["John", "Jane"],
  createdAt: new Date(),
});

describe("messages types", () => {
  describe("isContactGroup", () => {
    it("returns false for Contact object", () => {
      const contact = createContact();
      expect(isContactGroup(contact)).toBe(false);
    });

    it("returns true for ContactGroup object", () => {
      const group = createContactGroup();
      expect(isContactGroup(group)).toBe(true);
    });

    it("returns false for Contact with memberIds property", () => {
      const contact: Contact = {
        ...createContact(),
        name: "group-1",
      } as Contact;
      expect(isContactGroup(contact)).toBe(false);
    });

    it("correctly distinguishes between contact and group with same id", () => {
      const contact: Contact & { memberIds?: string[] } = {
        name: "test",
        due: "2024-01-15T14:00:00.000Z",
        idMembers: "member-1",
        assigned: undefined,
        kind: "interview",
        memberIds: ["a", "b"],
      };
      expect(isContactGroup(contact)).toBe(false);
    });
  });
});
