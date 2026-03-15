import { describe, it, expect } from "vitest";

function extractVariables(content: string): string[] {
  const singleVarRegex = /\{(\w+)\}/g;
  const doubleVarRegex = /\{\{(\w+)\}\}/g;

  const variables = new Set<string>();
  let match;

  while ((match = singleVarRegex.exec(content)) !== null) {
    variables.add(match[1]);
  }
  while ((match = doubleVarRegex.exec(content)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}

describe("extractVariables", () => {
  it("extracts single brace variables", () => {
    const content = "Hello {name}, how are you?";
    expect(extractVariables(content)).toEqual(["name"]);
  });

  it("extracts double brace variables", () => {
    const content = "Hello {{name}}, how are you?";
    expect(extractVariables(content)).toEqual(["name"]);
  });

  it("extracts multiple variables", () => {
    const content = "Hello {name}, your appointment is at {time} on {date}.";
    const vars = extractVariables(content);
    expect(vars).toContain("name");
    expect(vars).toContain("time");
    expect(vars).toContain("date");
  });

  it("extracts both single and double brace variables", () => {
    const content = "Hello {name}, your {event} is {{date}}";
    const vars = extractVariables(content);
    expect(vars).toContain("name");
    expect(vars).toContain("event");
    expect(vars).toContain("date");
  });

  it("returns empty array for no variables", () => {
    const content = "Hello World!";
    expect(extractVariables(content)).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(extractVariables("")).toEqual([]);
  });

  it("handles variables with underscores", () => {
    const content = "Hello {first_name} {last_name}";
    const vars = extractVariables(content);
    expect(vars).toContain("first_name");
    expect(vars).toContain("last_name");
  });

  it("handles variables with numbers", () => {
    const content = "Item {item1} and {item2}";
    const vars = extractVariables(content);
    expect(vars).toContain("item1");
    expect(vars).toContain("item2");
  });

  it("does not duplicate variables", () => {
    const content = "{name} said hello to {name}";
    expect(extractVariables(content)).toEqual(["name"]);
  });
});
