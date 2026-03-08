import { describe, it, expect } from "vitest";
import { substituteTemplate } from "@/utils/template-substitution";

describe("template-substitution", () => {
  describe("substituteTemplate", () => {
    it("substitutes a single variable", () => {
      const template = "Hello {{name}}!";
      const result = substituteTemplate(template, { name: "John" });
      expect(result).toBe("Hello John!");
    });

    it("substitutes multiple variables", () => {
      const template = "Hello {{name}}, your appointment is at {{time}}.";
      const result = substituteTemplate(template, {
        name: "John",
        time: "2:30 PM",
      });
      expect(result).toBe("Hello John, your appointment is at 2:30 PM.");
    });

    it("substitutes provided variables and replaces missing with undefined", () => {
      const template = "Hello {{name}}, your appointment is at {{time}}.";
      const result = substituteTemplate(template, { name: "John" });
      expect(result).toBe("Hello John, your appointment is at undefined.");
    });

    it("replaces all variables with undefined when empty variables object", () => {
      const template = "Hello {{name}}!";
      const result = substituteTemplate(template, {});
      expect(result).toBe("Hello undefined!");
    });

    it("handles empty template", () => {
      const template = "";
      const result = substituteTemplate(template, { name: "John" });
      expect(result).toBe("");
    });

    it("handles numeric values", () => {
      const template = "You have {{count}} messages.";
      const result = substituteTemplate(template, { count: 5 });
      expect(result).toBe("You have 5 messages.");
    });

    it("handles special characters in values", () => {
      const template = "Message: {{message}}";
      const result = substituteTemplate(template, {
        message: "Hello & Goodbye <>",
      });
      expect(result).toBe("Message: Hello & Goodbye <>");
    });

    it("handles boolean values", () => {
      const template = "Status: {{active}}";
      const result = substituteTemplate(template, { active: true });
      expect(result).toBe("Status: true");
    });

    it("handles variables with underscores", () => {
      const template = "{{first_name}} {{last_name}}";
      const result = substituteTemplate(template, {
        first_name: "John",
        last_name: "Doe",
      });
      expect(result).toBe("John Doe");
    });

    it("handles variables with hyphens", () => {
      const template = "{{before-or-after-church}}";
      const result = substituteTemplate(template, {
        "before-or-after-church": "after church",
      });
      expect(result).toBe("after church");
    });

    it("does not modify template without variables", () => {
      const template = "Hello World!";
      const result = substituteTemplate(template, { name: "John" });
      expect(result).toBe("Hello World!");
    });
  });
});
