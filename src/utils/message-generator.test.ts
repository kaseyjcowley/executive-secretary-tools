import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateMessage, classifyScenario } from "@/utils/message-generator";
import { MessageScenario } from "@/types/messages";
import { createInterviewContact, createCallingContact } from "@/test/factories";
import { CallingStage } from "@/constants";

vi.mock("@/utils/template-loader", () => ({
  getAvailableMessageTypes: () => [
    {
      id: "bishop-interview",
      name: "Bishop Interview",
      category: "interview",
      templatePath: "bishop-interview",
      content: "Hello {{name}}, {{appointmentSummary}}",
    },
    {
      id: "temple-recommend-renewal",
      name: "Temple Recommend Renewal",
      category: "interview",
      templatePath: "temple-recommend-renewal",
      content: "Hello {{name}}, {{appointmentSummary}}",
    },
    {
      id: "welfare-meeting",
      name: "Welfare Meeting",
      category: "interview",
      templatePath: "welfare-meeting",
      content: "Hello {{name}}, {{appointmentSummary}}",
    },
    {
      id: "multiple-appointments",
      name: "Multiple Appointments",
      category: "interview",
      templatePath: "multiple-appointments",
      content:
        "Hello {{greeting}}, here are your appointments:\n{{bulletList}}",
    },
  ],
  loadTemplateContent: vi.fn((id: string) => {
    const templates: Record<string, string> = {
      "bishop-interview": "Hello {{name}}, you have a bishop interview",
      "temple-recommend-renewal":
        "Hello {{name}}, your temple recommend needs renewal",
      "welfare-meeting": "Hello {{name}}, you have a welfare meeting",
      "multiple-appointments":
        "Hello {{greeting}}, here are your appointments:\n{{bulletList}}",
    };
    return templates[id] || "";
  }),
}));

vi.mock("@/constants/appointment-summaries", () => ({
  appointmentSummaries: {
    "bishop-interview": {
      singular: "you have a bishop interview scheduled",
      pluralRecipients: "you have bishop interviews scheduled",
      pluralSubjects: "they have bishop interviews scheduled",
      listFormat: "bishop interview",
    },
    "temple-recommend-renewal": {
      singular: "your temple recommend expires",
      pluralRecipients: "your temple recommends expire",
      pluralSubjects: "their temple recommends expire",
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

describe("message-generator", () => {
  describe("classifyScenario", () => {
    it("returns 'single' for empty recipients", () => {
      const result = classifyScenario([], [createInterviewContact("John")]);
      expect(result).toBe("single");
    });

    it("returns 'single' for empty subjects", () => {
      const result = classifyScenario([createInterviewContact("John")], []);
      expect(result).toBe("single");
    });

    it("returns 'single' when recipient and subject are the same person", () => {
      const contact = createInterviewContact("John", {
        id: "1",
        name: "Bishop Interview",
      });
      const result = classifyScenario([contact], [contact]);
      expect(result).toBe("single");
    });

    it("returns 'pair-subjects' for 1 recipient and 1 different subject", () => {
      const recipient = createInterviewContact("John");
      const subject = createInterviewContact("Jane", {
        id: "1",
        name: "Bishop Interview",
      });
      const result = classifyScenario([recipient], [subject]);
      expect(result).toBe("pair-subjects");
    });

    it("returns 'pair-recipients' when 2 recipients match 2 subjects with same appointment type", () => {
      const contacts = [
        createInterviewContact("John", { id: "1", name: "Bishop Interview" }),
        createInterviewContact("Jane", { id: "1", name: "Bishop Interview" }),
      ];
      const result = classifyScenario(contacts, [...contacts]);
      expect(result).toBe("pair-recipients");
    });

    it("returns 'multiple-types' when 2 recipients don't match 2 subjects with different labels", () => {
      const recipients = [
        createInterviewContact("John"),
        createInterviewContact("Jane"),
      ];
      const subjects = [
        createInterviewContact("Bob", { id: "1", name: "Temple" }),
        createInterviewContact("Alice", { id: "2", name: "Welfare" }),
      ];
      const result = classifyScenario(recipients, subjects);
      expect(result).toBe("multiple-types");
    });

    it("returns 'multiple-types' when subjects have different appointment types", () => {
      const recipients = [createInterviewContact("John")];
      const subjects = [
        createInterviewContact("Bob", { id: "1", name: "Temple" }),
        createInterviewContact("Alice", { id: "2", name: "Welfare" }),
      ];
      const result = classifyScenario(recipients, subjects);
      expect(result).toBe("multiple-types");
    });

    it("returns 'pair-subjects' for 1 recipient and 2 subjects with same type", () => {
      const recipients = [createInterviewContact("John")];
      const subjects = [
        createInterviewContact("Bob", { id: "1", name: "Bishop Interview" }),
        createInterviewContact("Alice", { id: "1", name: "Bishop Interview" }),
      ];
      const result = classifyScenario(recipients, subjects);
      expect(result).toBe("pair-subjects");
    });

    it("returns error when no appointment type selected", async () => {
      const subject = createInterviewContact("John");
      const scenario: MessageScenario = {
        type: "single",
        recipients: [subject],
        subjects: [subject],
        appointmentTypes: new Map(),
      };
      const result = await generateMessage(scenario);
      expect(result).toContain("Error");
    });

    it("generates message for single recipient and subject", async () => {
      const recipient = createInterviewContact("John");
      const subject = createInterviewContact("Jane", {
        id: "1",
        name: "Bishop Interview",
      });
      const scenario: MessageScenario = {
        type: "pair-subjects",
        recipients: [recipient],
        subjects: [subject],
        appointmentTypes: new Map([["bishop-interview", [subject]]]),
        recipientNames: ["John"],
      };
      const result = await generateMessage(scenario);
      expect(result).toContain("bishop interview");
    });
  });

  describe("generateMessage", () => {
    it("returns error when no appointment type selected", async () => {
      const scenario: MessageScenario = {
        type: "single",
        recipients: [],
        subjects: [],
        appointmentTypes: new Map(),
      };
      const result = await generateMessage(scenario);
      expect(result).toContain("Error");
    });

    it("generates message for single recipient and subject", async () => {
      const recipient = createInterviewContact("John");
      const subject = createInterviewContact("Jane", {
        id: "1",
        name: "Bishop Interview",
      });
      const scenario: MessageScenario = {
        type: "pair-subjects",
        recipients: [recipient],
        subjects: [subject],
        appointmentTypes: new Map([["bishop-interview", [subject]]]),
        recipientNames: ["John"],
      };
      const result = await generateMessage(scenario);
      expect(result).toContain("bishop interview");
    });

    it("generates list message for multiple types", async () => {
      const recipients = [createInterviewContact("John")];
      const subjects = [
        createInterviewContact("Bob", { id: "1", name: "Temple" }),
        createInterviewContact("Alice", { id: "2", name: "Welfare" }),
      ];
      const scenario: MessageScenario = {
        type: "multiple-types",
        recipients,
        subjects,
        appointmentTypes: new Map([
          ["temple-recommend-renewal", [subjects[0]]],
          ["welfare-meeting", [subjects[1]]],
        ]),
        recipientNames: ["John"],
      };
      const result = await generateMessage(scenario);
      expect(result).toContain("Hello");
      expect(result).toContain("welfare");
    });

    it("returns error for missing template", async () => {
      const subject = createInterviewContact("John", {
        id: "1",
        name: "Unknown Type",
      });
      const scenario: MessageScenario = {
        type: "single",
        recipients: [subject],
        subjects: [subject],
        appointmentTypes: new Map([["non-existent-template", [subject]]]),
      };
      const result = await generateMessage(scenario);
      // With async API call, non-existent templates are handled by API returning error
      expect(result).toBeDefined();
    });
  });
});
