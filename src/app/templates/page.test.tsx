import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TemplatesPage from "./page";
import { Category } from "@/types/messages";

vi.mock("@/app/actions/templates", () => ({
  getTemplates: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  removeTemplate: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { getTemplates } from "@/app/actions/templates";

const mockedGetTemplates = vi.mocked(getTemplates);

const mockTemplates = [
  {
    id: "baptismal-interview",
    name: "Baptismal Interview",
    category: Category.interview,
    content: "Hello {recipients}, are you available for an interview?",
    variables: ["recipients"],
  },
  {
    id: "calling-acceptance",
    name: "Calling Acceptance",
    category: Category.calling,
    content: "We would like to extend a calling to {name}",
    variables: ["name"],
  },
];

describe("TemplatesPage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders templates after loading", async () => {
    mockedGetTemplates.mockResolvedValue(mockTemplates);

    render(await TemplatesPage());

    expect(screen.getByText("Baptismal Interview")).toBeInTheDocument();
    expect(screen.getByText("Calling Acceptance")).toBeInTheDocument();
  });

  it("renders empty state when no templates", async () => {
    mockedGetTemplates.mockResolvedValue([]);

    render(await TemplatesPage());

    expect(screen.getByText("No templates found.")).toBeInTheDocument();
  });

  it("filters templates by search query", async () => {
    mockedGetTemplates.mockResolvedValue(mockTemplates);

    render(await TemplatesPage());

    expect(screen.getByText("Baptismal Interview")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search templates/i);
    await userEvent.type(searchInput, "baptism");

    await waitFor(() => {
      expect(screen.getByText("Baptismal Interview")).toBeInTheDocument();
      expect(screen.queryByText("Calling Acceptance")).not.toBeInTheDocument();
    });
  });

  it("shows only matching templates for search", async () => {
    mockedGetTemplates.mockResolvedValue(mockTemplates);

    render(await TemplatesPage());

    expect(screen.getByText("Baptismal Interview")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search templates/i);
    await userEvent.type(searchInput, "calling");

    await waitFor(() => {
      expect(screen.queryByText("Baptismal Interview")).not.toBeInTheDocument();
      expect(screen.getByText("Calling Acceptance")).toBeInTheDocument();
    });
  });

  it("opens create form when New Template button is clicked", async () => {
    mockedGetTemplates.mockResolvedValue(mockTemplates);

    render(await TemplatesPage());

    expect(screen.getByText("Baptismal Interview")).toBeInTheDocument();

    const newButton = screen.getByText("+ New Template");
    await userEvent.click(newButton);

    expect(screen.getByText("New Template")).toBeInTheDocument();
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);
  });

  it("groups templates by category", async () => {
    mockedGetTemplates.mockResolvedValue(mockTemplates);

    render(await TemplatesPage());

    expect(screen.getByText("Interview")).toBeInTheDocument();
    expect(screen.getByText("Calling")).toBeInTheDocument();
  });

  it("displays template variables on cards", async () => {
    mockedGetTemplates.mockResolvedValue(mockTemplates);

    render(await TemplatesPage());

    expect(screen.getByText(/Variables: recipients/)).toBeInTheDocument();
    expect(screen.getByText(/Variables: name/)).toBeInTheDocument();
  });
});
