import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  removeTemplate,
} from "@/app/actions/templates";
import { Category } from "@/types/messages";

vi.mock("@/utils/template-loader", () => ({
  getAllTemplates: vi.fn(),
  getTemplate: vi.fn(),
  saveTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
  extractVariables: vi.fn((content: string): string[] => {
    const matches = content.match(/\{(\w+)\}/g) || [];
    const uniqueVars = new Set(matches.map((m: string) => m.slice(1, -1)));
    return Array.from(uniqueVars);
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  getAllTemplates,
  getTemplate,
  saveTemplate,
  deleteTemplate,
} from "@/utils/template-loader";

const mockedGetAllTemplates = getAllTemplates as ReturnType<typeof vi.fn>;
const mockedGetTemplate = getTemplate as ReturnType<typeof vi.fn>;
const mockedSaveTemplate = saveTemplate as ReturnType<typeof vi.fn>;
const mockedDeleteTemplate = deleteTemplate as ReturnType<typeof vi.fn>;

describe("template server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTemplates", () => {
    it("returns all templates", async () => {
      const mockTemplates = [
        {
          id: "test-template",
          name: "Test Template",
          category: Category.interview,
          content: "Hello {name}",
          variables: ["name"],
        },
      ];
      mockedGetAllTemplates.mockResolvedValue(mockTemplates);

      const result = await getTemplates();

      expect(mockedGetAllTemplates).toHaveBeenCalled();
      expect(result).toEqual(mockTemplates);
    });

    it("returns empty array when no templates", async () => {
      mockedGetAllTemplates.mockResolvedValue([]);

      const result = await getTemplates();

      expect(result).toEqual([]);
    });
  });

  describe("getTemplateById", () => {
    it("returns template when found", async () => {
      const mockTemplate = {
        id: "test-template",
        name: "Test Template",
        category: Category.interview,
        content: "Hello {name}",
        variables: ["name"],
      };
      mockedGetTemplate.mockResolvedValue(mockTemplate);

      const result = await getTemplateById("test-template");

      expect(mockedGetTemplate).toHaveBeenCalledWith("test-template");
      expect(result).toEqual(mockTemplate);
    });

    it("returns null when not found", async () => {
      mockedGetTemplate.mockResolvedValue(null);

      const result = await getTemplateById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("createTemplate", () => {
    it("creates template with generated id", async () => {
      mockedSaveTemplate.mockResolvedValue(undefined);

      const result = await createTemplate({
        name: "New Template",
        content: "Hello {name}",
        category: Category.interview,
      });

      expect(result.error).toBeUndefined();
      expect(result.template).toBeDefined();
      expect(result.template?.id).toBe("new-template");
      expect(result.template?.name).toBe("New Template");
      expect(result.template?.variables).toContain("name");
      expect(mockedSaveTemplate).toHaveBeenCalled();
    });

    it("creates template with provided id", async () => {
      mockedSaveTemplate.mockResolvedValue(undefined);

      const result = await createTemplate({
        name: "New Template",
        content: "Hello {name}",
        category: Category.interview,
        id: "custom-id",
      });

      expect(result.template?.id).toBe("custom-id");
    });

    it("returns error when name is missing", async () => {
      const result = await createTemplate({
        name: "",
        content: "Hello {name}",
        category: Category.interview,
      });

      expect(result.error).toBe("Name and content are required");
      expect(result.template).toBeUndefined();
    });

    it("returns error when content is missing", async () => {
      const result = await createTemplate({
        name: "Test",
        content: "",
        category: Category.interview,
      });

      expect(result.error).toBe("Name and content are required");
    });
  });

  describe("updateTemplate", () => {
    it("updates existing template", async () => {
      const existing = {
        id: "test-template",
        name: "Old Name",
        category: Category.interview,
        content: "Old content",
        variables: [],
      };
      mockedGetTemplate.mockResolvedValue(existing);
      mockedSaveTemplate.mockResolvedValue(undefined);

      const result = await updateTemplate("test-template", {
        name: "New Name",
      });

      expect(result.error).toBeUndefined();
      expect(result.template).toBeDefined();
      expect(result.template?.name).toBe("New Name");
      expect(result.template?.content).toBe("Old content");
    });

    it("returns error when template not found", async () => {
      mockedGetTemplate.mockResolvedValue(null);

      const result = await updateTemplate("nonexistent", {
        name: "New Name",
      });

      expect(result.error).toBe("Template not found");
    });
  });

  describe("removeTemplate", () => {
    it("deletes existing template", async () => {
      const existing = {
        id: "test-template",
        name: "Test",
        category: Category.interview,
        content: "Content",
        variables: [],
      };
      mockedGetTemplate.mockResolvedValue(existing);
      mockedDeleteTemplate.mockResolvedValue(undefined);

      const result = await removeTemplate("test-template");

      expect(result.error).toBeUndefined();
      expect(result.success).toBe(true);
      expect(mockedDeleteTemplate).toHaveBeenCalledWith("test-template");
    });

    it("returns error when template not found", async () => {
      mockedGetTemplate.mockResolvedValue(null);

      const result = await removeTemplate("nonexistent");

      expect(result.error).toBe("Template not found");
    });
  });
});
