import { describe, it, expect, vi } from "vitest";
import { generateMessage } from "@/utils/message-generator";
import { MessageScenario } from "@/types/messages";
import { createInterviewContact } from "@/test/factories";

vi.mock("@/utils/template-loader", () => ({
  getAvailableMessageTypes: () => [],
  loadTemplateContent: vi.fn((id: string) => {
    const templates: Record<string, string> = {
      "bishop-youth-interview":
        "Hey {{recipients}}! {{verb}} {{subjects}} available Sunday at {{time}} for their annual interview with Bishop Preece?",
    };
    return templates[id] || "";
  }),
}));

vi.mock("@/constants/appointment-summaries", () => ({
  appointmentSummaries: {
    "bishop-youth-interview": {
      singular: "you have a youth bishop interview scheduled",
      pluralRecipients: "you have youth bishop interviews scheduled",
      pluralSubjects: "they have youth bishop interviews scheduled",
      listFormat: "youth bishop interview",
    },
  },
}));

describe("message-generator - bishop youth interview", () => {
  it("generates message for single youth with parent recipients", () => {
    const parent1 = createInterviewContact("Smith, John");
    const youth = createInterviewContact("Smith, Tommy", {
      id: "label-1",
      name: "Bishop Youth Interview",
    });

    const scenario: MessageScenario = {
      type: "pair-subjects",
      recipients: [parent1],
      subjects: [youth],
      appointmentTypes: new Map([["bishop-youth-interview", [youth]]]),
    };

    const result = generateMessage(scenario);

    expect(result).toContain("John");
    expect(result).toContain("Tommy");
    expect(result).toContain("is");
    expect(result).toContain("Sunday");
  });

  it("generates message for multiple youth (siblings) with parent recipients", () => {
    const parent1 = createInterviewContact("Smith, John");
    const youth1 = createInterviewContact("Smith, Tommy", {
      id: "label-1",
      name: "Bishop Youth Interview",
    });
    const youth2 = createInterviewContact("Smith, Sally", {
      id: "label-2",
      name: "Bishop Youth Interview",
    });

    const scenario: MessageScenario = {
      type: "pair-subjects",
      recipients: [parent1],
      subjects: [youth1, youth2],
      appointmentTypes: new Map([["bishop-youth-interview", [youth1, youth2]]]),
    };

    const result = generateMessage(scenario);

    expect(result).toContain("John");
    expect(result).toContain("Tommy");
    expect(result).toContain("Sally");
    expect(result).toContain("are");
    expect(result).toContain("Sunday");
  });

  it("extracts first name from 'First Last' format", () => {
    const parent1 = createInterviewContact("John Smith");
    const youth = createInterviewContact("Tommy Smith", {
      id: "label-1",
      name: "Bishop Youth Interview",
    });

    const scenario: MessageScenario = {
      type: "pair-subjects",
      recipients: [parent1],
      subjects: [youth],
      appointmentTypes: new Map([["bishop-youth-interview", [youth]]]),
    };

    const result = generateMessage(scenario);

    expect(result).toContain("John");
    expect(result).toContain("Tommy");
    expect(result).toContain("is");
  });

  it("extracts first name from 'Last, First' format", () => {
    const parent1 = createInterviewContact("Smith, John");
    const youth = createInterviewContact("Smith, Tommy", {
      id: "label-1",
      name: "Bishop Youth Interview",
    });

    const scenario: MessageScenario = {
      type: "pair-subjects",
      recipients: [parent1],
      subjects: [youth],
      appointmentTypes: new Map([["bishop-youth-interview", [youth]]]),
    };

    const result = generateMessage(scenario);

    expect(result).toContain("John");
    expect(result).toContain("Tommy");
    expect(result).toContain("is");
  });
});
