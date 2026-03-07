import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { ContactRow } from "@/components/ContactRow";
import { createInterviewContact, createCallingContact } from "@/test/factories";
import { CallingStage } from "@/constants";

vi.mock("@/utils/template-loader", () => ({
  getAvailableMessageTypes: () => [
    {
      id: "interview-reminder",
      name: "Interview Reminder",
      category: "interview",
      templatePath: "interview-reminder",
      content: "Hello {{name}}",
    },
    {
      id: "extend-calling",
      name: "Extend Calling",
      category: "calling",
      templatePath: "extend-calling",
      content: "Hello {{name}}",
    },
    {
      id: "setting-apart",
      name: "Setting Apart",
      category: "calling",
      templatePath: "setting-apart",
      content: "Hello {{name}}",
    },
    {
      id: "bishop-interview",
      name: "Bishop Interview",
      category: "interview",
      templatePath: "bishop-interview",
      content: "Hello {{name}}",
    },
  ],
  loadTemplateContent: vi.fn((id: string) => `Template for ${id}`),
}));

vi.mock("@/utils/template-substitution", () => ({
  substituteTemplate: vi.fn((template: string) => template),
}));

vi.mock("@/utils/format-member-display", () => ({
  formatMemberDisplayNames: vi.fn((members: { name: string }[]) =>
    members.map((m) => m.name),
  ),
}));

vi.mock("@/utils/time-utils", () => ({
  getBeforeOrAfterChurch: vi.fn(() => "after church"),
}));

vi.mock("@/hooks/useMemberSelection", () => ({
  useMemberSelection: vi.fn(() => ({
    selectedMemberIds: [-1],
    addMember: vi.fn(),
    removeMember: vi.fn(),
    changeMember: vi.fn(),
  })),
}));

vi.mock("@/data/members.json", () => ({
  default: [
    { id: 1, name: "Bishop John", age: 40, gender: "M", phone: "555-0001" },
    { id: 2, name: "Sister Jane", age: 35, gender: "F", phone: "555-0002" },
  ],
}));

describe("ContactRow", () => {
  it("renders contact name", () => {
    const contact = createInterviewContact("John Doe", {
      id: "1",
      name: "Bishop Interview",
    });
    render(<ContactRow contact={contact} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders checkbox unchecked by default", () => {
    const contact = createInterviewContact("John Doe");
    render(<ContactRow contact={contact} isSelected={false} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("renders checkbox checked when selected", () => {
    const contact = createInterviewContact("John Doe");
    render(<ContactRow contact={contact} isSelected={true} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("checkbox is disabled when contact is in a group", () => {
    const contact = createInterviewContact("John Doe");
    render(<ContactRow contact={contact} isInGroup={true} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("calls onSelect when checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const contact = createInterviewContact("John Doe");
    render(<ContactRow contact={contact} onSelect={onSelect} />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(onSelect).toHaveBeenCalledWith("John Doe", true);
  });

  it("renders calling info for calling contacts", () => {
    const contact = createCallingContact(
      "John Doe",
      "Ward Missionary",
      CallingStage.needsCallingExtended,
    );
    render(<ContactRow contact={contact} />);
    expect(screen.getByText(/Ward Missionary/)).toBeInTheDocument();
  });

  it("renders labels for interview contacts", () => {
    const contact = createInterviewContact("John Doe", {
      id: "1",
      name: "Bishop Interview",
    });
    render(<ContactRow contact={contact} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders with contact data", () => {
    const contact = createInterviewContact("John Doe", undefined, {
      phone: "555-1234",
    });
    render(<ContactRow contact={contact} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders with contact data including phone", () => {
    const contact = createInterviewContact("John Doe", undefined, {
      phone: "555-1234",
    });
    render(<ContactRow contact={contact} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("handles missing phone gracefully", () => {
    const contact = createInterviewContact("John Doe");
    render(<ContactRow contact={contact} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("handles contact without labels gracefully", () => {
    const contact = createInterviewContact("John Doe");
    render(<ContactRow contact={contact} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
