import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTemplatePreview } from "./useTemplatePreview";
import { CallingStage } from "@/constants";

vi.mock("@/utils/template-loader", () => ({
  loadTemplateContent: vi.fn((id: string) => {
    const templates: Record<string, string> = {
      "interview-reminder":
        "Hello {{recipients}}, this {{verb}} a reminder about {{pronoun}} {{appointmentType}}.",
      "calling-notification":
        "Dear {{recipients}}, {{subjects}} has been extended a calling as {{appointmentSummary}}.",
      "parent-notification":
        "Hello {{recipients}}, {{subjects}}'s {{appointmentType}} has been scheduled.",
    };
    return templates[id] || "";
  }),
}));

vi.mock("@/utils/date-formatters", () => ({
  formatAppointmentDate: vi.fn(() => "tomorrow"),
  formatTimeForDisplay: vi.fn((time: string) => time),
}));

vi.mock("@/utils/time-utils", () => ({
  getBeforeOrAfterChurch: vi.fn(() => "after church"),
}));

vi.mock("@/data/members.json", () => ({
  default: [
    { id: 1, name: "Smith, John", age: 40, gender: "M", phone: "555-0001" },
    { id: 2, name: "Johnson, Jane", age: 35, gender: "F", phone: "555-0002" },
    { id: 3, name: "Williams, Bob", age: 45, gender: "M", phone: "555-0003" },
    { id: 4, name: "Brown, Alice", age: 30, gender: "F", phone: "555-0004" },
  ],
}));

describe("useTemplatePreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockInterviewContact = {
    name: "Test Contact",
    due: "2024-01-01T14:00:00.000Z",
    idMembers: "member-1",
    assigned: "John Doe",
    kind: "interview" as const,
    labels: { id: "label-1", name: "Temple recommend interview" },
  };

  const mockCallingContact = {
    name: "Test Calling",
    due: "2024-01-01T14:00:00.000Z",
    idMembers: "member-1",
    assigned: "John Doe",
    kind: "calling" as const,
    calling: "Ward Mission Leader",
    stage: CallingStage.needsCallingExtended,
  };

  describe("recipient = subject (single)", () => {
    it("should use 'you' pronoun when recipient is subject (single male)", async () => {
      const { result } = renderHook(() =>
        useTemplatePreview({
          selectedTemplateId: "interview-reminder",
          selectedTime: "12:30",
          recipientMemberIds: [1],
          subjectMemberIds: [1],
          recipientsAreSubjects: true,
          contact: mockInterviewContact,
        }),
      );

      const output = result.current;
      expect(output).toContain("you");
      expect(output).not.toContain(" he ");
      expect(output).not.toContain("{{pronoun}}");
    });

    it("should use 'you' pronoun when recipient is subject (single female)", async () => {
      const { result } = renderHook(() =>
        useTemplatePreview({
          selectedTemplateId: "interview-reminder",
          selectedTime: "12:30",
          recipientMemberIds: [2],
          subjectMemberIds: [2],
          recipientsAreSubjects: true,
          contact: mockInterviewContact,
        }),
      );

      const output = result.current;
      expect(output).toContain("you");
      expect(output).not.toContain("she");
      expect(output).not.toContain("{{pronoun}}");
    });
  });

  describe("recipient = subject (multiple)", () => {
    it("should use 'you all' for multiple recipients who are also subjects", async () => {
      const { result } = renderHook(() =>
        useTemplatePreview({
          selectedTemplateId: "interview-reminder",
          selectedTime: "12:30",
          recipientMemberIds: [1, 2],
          subjectMemberIds: [1, 2],
          recipientsAreSubjects: true,
          contact: mockInterviewContact,
        }),
      );

      const output = result.current;
      expect(output).toContain("you");
      expect(output).not.toContain("they");
      expect(output).not.toContain("{{pronoun}}");
    });
  });

  describe("recipient != subject", () => {
    it("should use 'he' pronoun for single male subject", async () => {
      const { result } = renderHook(() =>
        useTemplatePreview({
          selectedTemplateId: "interview-reminder",
          selectedTime: "12:30",
          recipientMemberIds: [1],
          subjectMemberIds: [3],
          recipientsAreSubjects: false,
          contact: mockInterviewContact,
        }),
      );

      const output = result.current;
      expect(output).toContain("he");
      expect(output).not.toContain("you");
      expect(output).not.toContain("{{pronoun}}");
    });

    it("should use 'she' pronoun for single female subject", async () => {
      const { result } = renderHook(() =>
        useTemplatePreview({
          selectedTemplateId: "interview-reminder",
          selectedTime: "12:30",
          recipientMemberIds: [1],
          subjectMemberIds: [4],
          recipientsAreSubjects: false,
          contact: mockInterviewContact,
        }),
      );

      const output = result.current;
      expect(output).toContain("she");
      expect(output).not.toContain("you");
      expect(output).not.toContain("{{pronoun}}");
    });

    it("should use 'they' pronoun for multiple subjects", async () => {
      const { result } = renderHook(() =>
        useTemplatePreview({
          selectedTemplateId: "interview-reminder",
          selectedTime: "12:30",
          recipientMemberIds: [1],
          subjectMemberIds: [3, 4],
          recipientsAreSubjects: false,
          contact: mockInterviewContact,
        }),
      );

      const output = result.current;
      expect(output).toContain("they");
      expect(output).not.toContain(" he ");
      expect(output).not.toContain(" she ");
      expect(output).not.toContain("{{pronoun}}");
    });

    it("should use subject names in template when recipient != subject", async () => {
      const { result } = renderHook(() =>
        useTemplatePreview({
          selectedTemplateId: "parent-notification",
          selectedTime: "12:30",
          recipientMemberIds: [1],
          subjectMemberIds: [3],
          recipientsAreSubjects: false,
          contact: mockInterviewContact,
        }),
      );

      const output = result.current;
      expect(output).toContain("Bob");
      expect(output).not.toContain("{{subjects}}");
    });
  });

  describe("recipients variable", () => {
    it("should format recipients with Brother/Sister prefix", async () => {
      const { result } = renderHook(() =>
        useTemplatePreview({
          selectedTemplateId: "interview-reminder",
          selectedTime: "12:30",
          recipientMemberIds: [1],
          subjectMemberIds: [1],
          recipientsAreSubjects: true,
          contact: mockInterviewContact,
        }),
      );

      const output = result.current;
      expect(output).toContain("Brother");
      expect(output).not.toContain("{{recipients}}");
    });
  });

  describe("appointment variables", () => {
    it("should pass appointmentSummary for interview contacts", async () => {
      const { result } = renderHook(() =>
        useTemplatePreview({
          selectedTemplateId: "interview-reminder",
          selectedTime: "12:30",
          recipientMemberIds: [1],
          subjectMemberIds: [1],
          recipientsAreSubjects: true,
          contact: mockInterviewContact,
        }),
      );

      const output = result.current;
      expect(output).toContain("Temple recommend interview");
      expect(output).not.toContain("{{appointmentType}}");
    });

    it("should pass appointmentSummary for calling contacts", async () => {
      const { result } = renderHook(() =>
        useTemplatePreview({
          selectedTemplateId: "calling-notification",
          selectedTime: "12:30",
          recipientMemberIds: [1],
          subjectMemberIds: [1],
          recipientsAreSubjects: true,
          contact: mockCallingContact,
        }),
      );

      const output = result.current;
      expect(output).toContain("Ward Mission Leader");
      expect(output).not.toContain("{{appointmentSummary}}");
    });
  });

  describe("verb conjugation", () => {
    it("should use 'is' for singular subject", async () => {
      const { result } = renderHook(() =>
        useTemplatePreview({
          selectedTemplateId: "interview-reminder",
          selectedTime: "12:30",
          recipientMemberIds: [1],
          subjectMemberIds: [3],
          recipientsAreSubjects: false,
          contact: mockInterviewContact,
        }),
      );

      const output = result.current;
      expect(output).toContain(" is ");
      expect(output).not.toContain(" are ");
      expect(output).not.toContain("{{verb}}");
    });

    it("should use 'are' for plural subjects", async () => {
      const { result } = renderHook(() =>
        useTemplatePreview({
          selectedTemplateId: "interview-reminder",
          selectedTime: "12:30",
          recipientMemberIds: [1],
          subjectMemberIds: [3, 4],
          recipientsAreSubjects: false,
          contact: mockInterviewContact,
        }),
      );

      const output = result.current;
      expect(output).toContain(" are ");
      expect(output).not.toContain(" is ");
      expect(output).not.toContain("{{verb}}");
    });

    it("should use 'are' when recipient = subject (regardless of count)", async () => {
      const { result: singularResult } = renderHook(() =>
        useTemplatePreview({
          selectedTemplateId: "interview-reminder",
          selectedTime: "12:30",
          recipientMemberIds: [1],
          subjectMemberIds: [1],
          recipientsAreSubjects: true,
          contact: mockInterviewContact,
        }),
      );

      expect(singularResult.current).toContain(" are ");
      expect(singularResult.current).not.toContain(" is ");

      const { result: pluralResult } = renderHook(() =>
        useTemplatePreview({
          selectedTemplateId: "interview-reminder",
          selectedTime: "12:30",
          recipientMemberIds: [1, 2],
          subjectMemberIds: [1, 2],
          recipientsAreSubjects: true,
          contact: mockInterviewContact,
        }),
      );

      expect(pluralResult.current).toContain(" are ");
    });
  });
});
