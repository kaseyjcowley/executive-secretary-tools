import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useRecipientSubjectSelection } from "./useRecipientSubjectSelection";

vi.mock("@/utils/contact-fuzzy-match", () => ({
  matchContact: vi.fn((name: string) => {
    if (name === "Smith, John") return 1;
    if (name === "Johnson, Jane") return 2;
    if (name === "Williams, Bob") return 3;
    return undefined;
  }),
}));

vi.mock("@/data/members.json", () => ({
  default: [
    { id: 1, name: "Smith, John", age: 40, gender: "M", phone: "555-0001" },
    { id: 2, name: "Johnson, Jane", age: 35, gender: "F", phone: "555-0002" },
    { id: 3, name: "Williams, Bob", age: 45, gender: "M", phone: "555-0003" },
    { id: 4, name: "Brown, Alice", age: 30, gender: "F", phone: "555-0004" },
  ],
}));

describe("useRecipientSubjectSelection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with recipientsAreSubjects as true by default", () => {
      const { result } = renderHook(() =>
        useRecipientSubjectSelection({ contactName: "Smith, John" }),
      );

      expect(result.current.recipientsAreSubjects).toBe(true);
    });

    it("should initialize with recipientsAreSubjects based on defaultRecipientsAreSubjects", () => {
      const { result: resultFalse } = renderHook(() =>
        useRecipientSubjectSelection({
          contactName: "Smith, John",
          defaultRecipientsAreSubjects: false,
        }),
      );
      expect(resultFalse.current.recipientsAreSubjects).toBe(false);

      const { result: resultTrue } = renderHook(() =>
        useRecipientSubjectSelection({
          contactName: "Smith, John",
          defaultRecipientsAreSubjects: true,
        }),
      );
      expect(resultTrue.current.recipientsAreSubjects).toBe(true);
    });

    it("should auto-populate recipient from fuzzy match", async () => {
      const { result } = renderHook(() =>
        useRecipientSubjectSelection({ contactName: "Smith, John" }),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.recipientMemberIds).toEqual([1]);
    });

    it("should have empty subjectMemberIds initially when recipientsAreSubjects is true", () => {
      const { result } = renderHook(() =>
        useRecipientSubjectSelection({ contactName: "Smith, John" }),
      );

      expect(result.current.subjectMemberIds).toEqual([]);
    });
  });

  describe("recipient management", () => {
    it("should add a recipient", async () => {
      const { result } = renderHook(() =>
        useRecipientSubjectSelection({ contactName: "Smith, John" }),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.addRecipient();
      });

      expect(result.current.recipientMemberIds).toEqual([1, -1]);
    });

    it("should remove a recipient", async () => {
      const { result } = renderHook(() =>
        useRecipientSubjectSelection({ contactName: "Smith, John" }),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.addRecipient();
      });

      act(() => {
        result.current.removeRecipient(1);
      });

      expect(result.current.recipientMemberIds).toEqual([1]);
    });

    it("should change a recipient", async () => {
      const { result } = renderHook(() =>
        useRecipientSubjectSelection({ contactName: "Smith, John" }),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.changeRecipient(0, 2);
      });

      expect(result.current.recipientMemberIds).toEqual([2]);
    });

    it("should limit recipients to MAX_RECIPIENTS (2)", async () => {
      const { result } = renderHook(() =>
        useRecipientSubjectSelection({ contactName: "Smith, John" }),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.addRecipient();
      });

      act(() => {
        result.current.addRecipient();
      });

      expect(result.current.recipientMemberIds.length).toBeLessThanOrEqual(2);
    });
  });

  describe("subject management when recipientsAreSubjects is false", () => {
    it("should add a subject when recipientsAreSubjects is false", async () => {
      const { result } = renderHook(() =>
        useRecipientSubjectSelection({
          contactName: "Smith, John",
          defaultRecipientsAreSubjects: false,
        }),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.addSubject();
      });

      expect(result.current.subjectMemberIds.length).toBe(2);
    });

    it("should auto-populate subject from fuzzy match when unchecking recipientsAreSubjects", async () => {
      const { result } = renderHook(() =>
        useRecipientSubjectSelection({
          contactName: "Johnson, Jane",
          defaultRecipientsAreSubjects: true,
        }),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.subjectMemberIds).toEqual([]);

      act(() => {
        result.current.setRecipientsAreSubjects(false);
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.subjectMemberIds).toEqual([2]);
    });

    it("should allow unlimited subjects", async () => {
      const { result } = renderHook(() =>
        useRecipientSubjectSelection({
          contactName: "Smith, John",
          defaultRecipientsAreSubjects: false,
        }),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.addSubject();
        });
      }

      expect(result.current.subjectMemberIds.length).toBe(6);
    });
  });

  describe("recipientsAreSubjects checkbox", () => {
    it("should set recipientsAreSubjects to false", async () => {
      const { result } = renderHook(() =>
        useRecipientSubjectSelection({ contactName: "Smith, John" }),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.setRecipientsAreSubjects(false);
      });

      expect(result.current.recipientsAreSubjects).toBe(false);
    });

    it("should set recipientsAreSubjects to true", async () => {
      const { result } = renderHook(() =>
        useRecipientSubjectSelection({
          contactName: "Smith, John",
          defaultRecipientsAreSubjects: false,
        }),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.setRecipientsAreSubjects(true);
      });

      expect(result.current.recipientsAreSubjects).toBe(true);
    });
  });

  describe("effectiveSubjectIds", () => {
    it("should return recipient IDs when recipientsAreSubjects is true", async () => {
      const { result } = renderHook(() =>
        useRecipientSubjectSelection({ contactName: "Smith, John" }),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.effectiveSubjectIds).toEqual([1]);
    });

    it("should return subject IDs when recipientsAreSubjects is false", async () => {
      const { result } = renderHook(() =>
        useRecipientSubjectSelection({
          contactName: "Smith, John",
          defaultRecipientsAreSubjects: false,
        }),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.changeSubject(0, 2);
      });

      expect(result.current.effectiveSubjectIds).toEqual([2]);
    });
  });

  describe("recipient/subject phone numbers", () => {
    it("should return recipient phone numbers", async () => {
      const { result } = renderHook(() =>
        useRecipientSubjectSelection({ contactName: "Smith, John" }),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.recipientPhoneNumbers).toEqual(["555-0001"]);
    });

    it("should return subject phone numbers when recipientsAreSubjects is false", async () => {
      const { result } = renderHook(() =>
        useRecipientSubjectSelection({
          contactName: "Smith, John",
          defaultRecipientsAreSubjects: false,
        }),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.changeSubject(0, 2);
      });

      expect(result.current.subjectPhoneNumbers).toEqual(["555-0002"]);
    });
  });
});
