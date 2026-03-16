import { describe, it, expect, vi } from "vitest";

const { mockPostMessage, mockConversationsInfo } = vi.hoisted(() => ({
  mockPostMessage: vi.fn(),
  mockConversationsInfo: vi.fn(),
}));

vi.mock("@/utils/slack", () => ({
  app: {
    client: {
      chat: { postMessage: mockPostMessage },
      conversations: { info: mockConversationsInfo },
    },
  },
}));

vi.stubEnv("SLACK_USER_OAUTH_TOKEN", "xoxb-test-token");
vi.stubEnv("SLACK_SIGNING_SECRET", "test-secret");

const { extractPrayers } = await import("./route");

describe("extractPrayers", () => {
  it("extracts opening and closing prayers from formatted message", () => {
    const result = extractPrayers(`Opening prayer:
Jane Smith
Closing prayer:
John Doe`);

    expect(result.openingPrayer).toBe("Jane Smith");
    expect(result.closingPrayer).toBe("John Doe");
  });

  it("handles case-insensitive labels", () => {
    const result = extractPrayers(`OPENING PRAYER:
Jane
CLOSING PRAYER:
John`);

    expect(result.openingPrayer).toBe("Jane");
    expect(result.closingPrayer).toBe("John");
  });

  it("handles labels with trailing colon", () => {
    const result = extractPrayers(`Opening prayer:
Jane
Closing prayer:
John`);

    expect(result.openingPrayer).toBe("Jane");
    expect(result.closingPrayer).toBe("John");
  });

  it("returns null for missing opening prayer", () => {
    const result = extractPrayers(`Closing prayer:
John Doe`);

    expect(result.openingPrayer).toBeNull();
    expect(result.closingPrayer).toBe("John Doe");
  });

  it("returns null for missing closing prayer", () => {
    const result = extractPrayers(`Opening prayer:
Jane Smith`);

    expect(result.openingPrayer).toBe("Jane Smith");
    expect(result.closingPrayer).toBeNull();
  });

  it("returns null for both when no prayers present", () => {
    const result = extractPrayers(`Some other message`);

    expect(result.openingPrayer).toBeNull();
    expect(result.closingPrayer).toBeNull();
  });

  it("handles extra whitespace in names", () => {
    const result = extractPrayers(`Opening prayer:
   Jane Smith   
Closing prayer:
  John Doe`);

    expect(result.openingPrayer).toBe("Jane Smith");
    expect(result.closingPrayer).toBe("John Doe");
  });
});
