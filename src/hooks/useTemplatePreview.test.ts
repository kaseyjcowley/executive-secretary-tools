import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTemplatePreview } from "./useTemplatePreview";
import { CallingStage } from "@/constants";

vi.mock("@/utils/template-loader", () => ({
  loadTemplateContent: vi.fn((id: string) => {
    const templates: Record<string, string> = {
      "temple-recommend-renewal":
        "Hello {{greeting}}! Our records indicate that {{appointmentSummary}}.",
      "interview-reminder":
        "Hello {{name}}, this is a reminder about your {{appointmentType}}.",
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

  it("should pass greeting and appointmentSummary template variables for interview contacts", () => {
    const mockContact = {
      name: "Test Contact",
      due: "2024-01-01T14:00:00.000Z",
      idMembers: "member-1",
      assigned: "John Doe",
      kind: "interview" as const,
      labels: { id: "label-1", name: "Temple recommend interview" },
    };

    const { result } = renderHook(() =>
      useTemplatePreview({
        selectedTemplateId: "temple-recommend-renewal",
        selectedTime: "12:30",
        recipientMemberIds: [1],
        subjectMemberIds: [1],
        recipientsAreSubjects: true,
        contact: mockContact,
      }),
    );

    const output = result.current;
    expect(output).toContain("Brother Smith");
    expect(output).toContain("Temple recommend interview");
    expect(output).not.toContain("{{greeting}}");
    expect(output).not.toContain("{{appointmentSummary}}");
  });

  it("should still pass name and appointmentType for templates using those variables", () => {
    const mockContact = {
      name: "Test Contact",
      due: "2024-01-01T14:00:00.000Z",
      idMembers: "member-1",
      assigned: "Jane Doe",
      kind: "interview" as const,
      labels: { id: "label-2", name: "Youth interview" },
    };

    const { result } = renderHook(() =>
      useTemplatePreview({
        selectedTemplateId: "interview-reminder",
        selectedTime: "14:00",
        recipientMemberIds: [2],
        subjectMemberIds: [2],
        recipientsAreSubjects: true,
        contact: mockContact,
      }),
    );

    const output = result.current;
    expect(output).toContain("Sister Johnson");
    expect(output).toContain("Youth interview");
    expect(output).not.toContain("{{name}}");
    expect(output).not.toContain("{{appointmentType}}");
  });

  it("should pass greeting and appointmentSummary for calling contacts", () => {
    const mockContact = {
      name: "Test Calling",
      due: "2024-01-01T14:00:00.000Z",
      idMembers: "member-1",
      assigned: "John Doe",
      kind: "calling" as const,
      calling: "Ward Mission Leader",
      stage: CallingStage.needsCallingExtended,
    };

    const { result } = renderHook(() =>
      useTemplatePreview({
        selectedTemplateId: "temple-recommend-renewal",
        selectedTime: "12:30",
        recipientMemberIds: [3],
        subjectMemberIds: [3],
        recipientsAreSubjects: true,
        contact: mockContact,
      }),
    );

    const output = result.current;
    expect(output).toContain("Brother Williams");
    expect(output).toContain("Ward Mission Leader");
    expect(output).not.toContain("{{greeting}}");
    expect(output).not.toContain("{{appointmentSummary}}");
  });
});
