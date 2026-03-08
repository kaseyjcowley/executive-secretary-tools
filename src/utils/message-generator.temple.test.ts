import { describe, it, expect, vi } from "vitest";
import { generateMessage, classifyScenario } from "@/utils/message-generator";
import { substituteTemplate } from "@/utils/template-substitution";
import { MessageScenario } from "@/types/messages";
import { createInterviewContact } from "@/test/factories";

vi.mock("@/utils/template-loader", () => ({
  getAvailableMessageTypes: () => [
    {
      id: "temple-recommend-renewal",
      name: "Temple Recommend Renewal",
      category: "interview" as const,
      templatePath: "temple-recommend-renewal",
      content:
        "Hello {{greeting}}! Our records indicate that {{appointmentSummary}}. The Bishopric has times this Sunday for recommend renewals. {{schedulingPhrase}}, please let me know!",
    },
    {
      id: "welfare-meeting",
      name: "Welfare Meeting",
      category: "interview" as const,
      templatePath: "welfare-meeting",
      content:
        "Hello {{greeting}}! Our records indicate that {{appointmentSummary}}. The Bishopric has times this Sunday for welfare meetings. {{schedulingPhrase}}, please let me know!",
    },
    {
      id: "multiple-appointments",
      name: "Multiple Appointments",
      category: "interview" as const,
      templatePath: "multiple-appointments",
      content:
        "Hello {{greeting}}! Our records indicate the following appointments are needed:\n\n{{bulletList}}\n\nThe Bishopric has times this Sunday. If you would like to get on our schedule, please let me know!",
    },
  ],
  loadTemplateContent: vi.fn((id: string) => {
    const templates: Record<string, string> = {
      "temple-recommend-renewal":
        "Hello {{greeting}}! Our records indicate that {{appointmentSummary}}. The Bishopric has times this Sunday for recommend renewals. {{schedulingPhrase}}, please let me know!",
      "welfare-meeting":
        "Hello {{greeting}}! Our records indicate that {{appointmentSummary}}. The Bishopric has times this Sunday for welfare meetings. {{schedulingPhrase}}, please let me know!",
      "multiple-appointments":
        "Hello {{greeting}}! Our records indicate the following appointments are needed:\n\n{{bulletList}}\n\nThe Bishopric has times this Sunday. If you would like to get on our schedule, please let me know!",
    };
    return templates[id] || "";
  }),
}));

vi.mock("@/constants/appointment-summaries", () => ({
  appointmentSummaries: {
    "temple-recommend-renewal": {
      singular: "your temple recommend expires at the end of this month",
      pluralRecipients:
        "your temple recommends expire at the end of this month",
      pluralSubjects: "their temple recommends expire at the end of this month",
      listFormat: "temple recommend renewal",
    },
    "welfare-meeting": {
      singular: "you have a welfare meeting scheduled",
      pluralRecipients: "you have welfare meetings scheduled",
      pluralSubjects: "they have welfare meetings scheduled",
      listFormat: "welfare meeting",
    },
  },
}));

describe("Temple Recommend Renewal single contact", () => {
  it("generates message for single contact - NO appointmentSummaries mock", () => {
    const contact = createInterviewContact("John Smith", {
      id: "1",
      name: "Temple",
    });

    const scenario: MessageScenario = {
      type: "single",
      recipients: [contact],
      subjects: [contact],
      appointmentTypes: new Map([["temple-recommend-renewal", [contact]]]),
    };

    const result = generateMessage(scenario);
    console.log("Generated message (single):", result);
    expect(result).toBeDefined();
  });

  it("classifyScenario returns single when recipient=subject", () => {
    const contact = createInterviewContact("John Smith", {
      id: "1",
      name: "Temple",
    });

    const result = classifyScenario([contact], [contact]);
    console.log("Scenario type:", result);
    expect(result).toBe("single");
  });

  it("full flow: classify then generate", () => {
    const contact = createInterviewContact("John Smith", {
      id: "1",
      name: "Temple",
    });

    const scenarioType = classifyScenario([contact], [contact]);
    console.log("Classified scenario type:", scenarioType);

    const scenario: MessageScenario = {
      type: scenarioType,
      recipients: [contact],
      subjects: [contact],
      appointmentTypes: new Map([["temple-recommend-renewal", [contact]]]),
    };

    const result = generateMessage(scenario);
    console.log("Generated message (full flow):", result);
    expect(result).toBeDefined();
  });

  it("generates message for pair-subjects (different recipient and subject)", () => {
    const recipient = createInterviewContact("Bishop John");
    const subject = createInterviewContact("Jane Smith", {
      id: "1",
      name: "Temple",
    });

    const scenario: MessageScenario = {
      type: "pair-subjects",
      recipients: [recipient],
      subjects: [subject],
      appointmentTypes: new Map([["temple-recommend-renewal", [subject]]]),
      recipientNames: ["Bishop John"],
    };

    const result = generateMessage(scenario);
    console.log("Generated message (pair-subjects):", result);
    expect(result).toBeDefined();
  });

  it("generates message when template ID not in appointmentSummaries", () => {
    const contact = createInterviewContact("John Smith", {
      id: "1",
      name: "Some Unknown Type",
    });

    const scenario: MessageScenario = {
      type: "single",
      recipients: [contact],
      subjects: [contact],
      appointmentTypes: new Map([["some-unknown-type", [contact]]]),
    };

    const result = generateMessage(scenario);
    console.log("Generated message (unknown type):", result);
    expect(result).toBeDefined();
  });

  it("uses wrong template ID key in Map", () => {
    const contact = createInterviewContact("John Smith", {
      id: "1",
      name: "Temple",
    });

    const scenario: MessageScenario = {
      type: "single",
      recipients: [contact],
      subjects: [contact],
      appointmentTypes: new Map([["temple", [contact]]]),
    };

    const result = generateMessage(scenario);
    console.log("Generated message (wrong key 'temple'):", result);
    expect(result).toBeDefined();
  });

  it("MISMATCH: Map has 'temple-recommend-renewal' but contact label doesn't match", () => {
    const contact = createInterviewContact("John Smith", {
      id: "1",
      name: "Bishop Interview",
    });

    const scenario: MessageScenario = {
      type: "single",
      recipients: [contact],
      subjects: [contact],
      appointmentTypes: new Map([["temple-recommend-renewal", [contact]]]),
    };

    const result = generateMessage(scenario);
    console.log("Generated message (MISMATCH):", result);
    expect(result).toBeDefined();
  });

  it("tests interpolate behavior with missing variables", () => {
    const template = "Hello {{greeting}}! Your {{appointmentSummary}} is due.";
    const result = substituteTemplate(template, {
      greeting: "John",
    });
    console.log("Substitute result (missing appointmentSummary):", result);
    expect(result).toContain("undefined");
  });

  it("multiple-types: mismatch between Map key and contact labels", () => {
    const recipient = createInterviewContact("Bishop John");
    const subjects = [
      createInterviewContact("Jane Smith", { id: "1", name: "Temple" }),
      createInterviewContact("Bob Jones", { id: "2", name: "Welfare" }),
    ];

    const scenario: MessageScenario = {
      type: "multiple-types",
      recipients: [recipient],
      subjects,
      appointmentTypes: new Map([
        ["temple-recommend-renewal", [subjects[0]]],
        ["welfare-meeting", [subjects[1]]],
      ]),
      recipientNames: ["Bishop John"],
    };

    const result = generateMessage(scenario);
    console.log("Generated message (multiple-types mismatch):", result);
    expect(result).toBeDefined();
  });

  it("multiple-types: uses Map keys not contact labels for summary", () => {
    const recipient = createInterviewContact("Bishop John");
    const subjects = [
      createInterviewContact("Jane Smith", {
        id: "1",
        name: "Bishop Interview",
      }),
      createInterviewContact("Bob Jones", { id: "2", name: "Temple" }),
    ];

    const scenario: MessageScenario = {
      type: "multiple-types",
      recipients: [recipient],
      subjects,
      appointmentTypes: new Map([
        ["temple-recommend-renewal", [subjects[0]]],
        ["welfare-meeting", [subjects[1]]],
      ]),
      recipientNames: ["Bishop John"],
    };

    const result = generateMessage(scenario);
    console.log("Generated message (Map keys mismatch with labels):", result);

    // The Map says: Jane should be temple-recommend-renewal, Bob should be welfare-meeting
    // The output should reflect the Map keys, not the contact labels
    expect(result).toContain("temple recommend renewal");
    expect(result).toContain("welfare meeting");
  });
});
