import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TemplateSelector } from "@/components/TemplateSelector";
import { MessageType, Category } from "@/types/messages";

describe("TemplateSelector", () => {
  const mockCategories: Record<string, MessageType[]> = {
    calling: [
      {
        id: "extend-calling",
        name: "Extend Calling",
        category: Category.calling,
        templatePath: "extend-calling",
        content: "Hello {{name}}",
      },
      {
        id: "setting-apart",
        name: "Setting Apart",
        category: Category.calling,
        templatePath: "setting-apart",
        content: "Hello {{name}}",
      },
    ],
    interview: [
      {
        id: "interview-reminder",
        name: "Interview Reminder",
        category: Category.interview,
        templatePath: "interview-reminder",
        content: "Hello {{name}}",
      },
    ],
  };

  it("should render options grouped by category", () => {
    render(
      <TemplateSelector
        selectedTemplateId={undefined}
        onChange={() => {}}
        categories={mockCategories}
      />,
    );

    expect(screen.getByText("Select message type")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Calling" })).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Interview" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Extend Calling")).toBeInTheDocument();
    expect(screen.getByText("Setting Apart")).toBeInTheDocument();
    expect(screen.getByText("Interview Reminder")).toBeInTheDocument();
  });

  it("should call onChange when selection changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TemplateSelector
        selectedTemplateId={undefined}
        onChange={onChange}
        categories={mockCategories}
      />,
    );

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, ["interview-reminder"]);

    expect(onChange).toHaveBeenCalledWith("interview-reminder");
  });

  it("should show placeholder when no selection", () => {
    render(
      <TemplateSelector
        selectedTemplateId={undefined}
        onChange={() => {}}
        categories={mockCategories}
      />,
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("");
  });

  it("should show selected value", () => {
    render(
      <TemplateSelector
        selectedTemplateId="interview-reminder"
        onChange={() => {}}
        categories={mockCategories}
      />,
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("interview-reminder");
  });

  it("should not render empty categories", () => {
    render(
      <TemplateSelector
        selectedTemplateId={undefined}
        onChange={() => {}}
        categories={{ calling: [], interview: [] }}
      />,
    );

    expect(screen.queryByText("Calling")).not.toBeInTheDocument();
    expect(screen.queryByText("Interview")).not.toBeInTheDocument();
  });
});
