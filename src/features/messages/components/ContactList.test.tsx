import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { ContactList } from "@/features/messages/components/ContactList";
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

describe("ContactList", () => {
  it("renders empty message when no contacts provided", () => {
    render(<ContactList contacts={[]} />);
    expect(screen.getByText("No Contacts Found")).toBeInTheDocument();
  });

  it("renders contacts when provided", () => {
    const contacts = [
      createInterviewContact("John Doe", { id: "1", name: "Bishop Interview" }),
    ];
    render(<ContactList contacts={contacts} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders multiple contacts", () => {
    const contacts = [
      createInterviewContact("John Doe", { id: "1", name: "Bishop Interview" }),
      createInterviewContact("Jane Smith", { id: "2", name: "Temple" }),
    ];
    render(<ContactList contacts={contacts} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("shows select all checkbox when contacts exist and none selected", () => {
    const contacts = [
      createInterviewContact("John Doe", { id: "1", name: "Bishop Interview" }),
    ];
    render(<ContactList contacts={contacts} />);
    expect(screen.getByLabelText(/select all/i)).toBeInTheDocument();
  });

  it("does not show select all checkbox when contacts are selected", async () => {
    const user = userEvent.setup();
    const contacts = [
      createInterviewContact("John Doe", { id: "1", name: "Bishop Interview" }),
      createInterviewContact("Jane Smith", { id: "2", name: "Temple" }),
    ];
    render(<ContactList contacts={contacts} />);

    const checkbox = screen.getByLabelText(/select all/i);
    await user.click(checkbox);

    expect(screen.queryByLabelText(/select all/i)).not.toBeInTheDocument();
  });

  it("shows merge toolbar when contacts are selected", async () => {
    const user = userEvent.setup();
    const contacts = [
      createInterviewContact("John Doe", { id: "1", name: "Bishop Interview" }),
      createInterviewContact("Jane Smith", { id: "2", name: "Temple" }),
    ];
    render(<ContactList contacts={contacts} />);

    const checkbox = screen.getByLabelText(/select all/i);
    await user.click(checkbox);

    expect(screen.getByText(/contacts selected/i)).toBeInTheDocument();
  });

  it("calls onSelect when contact checkbox is clicked", async () => {
    const user = userEvent.setup();
    const contacts = [
      createInterviewContact("John Doe", { id: "1", name: "Bishop Interview" }),
    ];
    render(<ContactList contacts={contacts} />);

    const checkbox = screen.getAllByRole("checkbox")[0];
    await user.click(checkbox);

    expect(screen.getByText(/1 contact/i)).toBeInTheDocument();
  });

  it("select all selects all contacts", async () => {
    const user = userEvent.setup();
    const contacts = [
      createInterviewContact("John Doe", { id: "1", name: "Bishop Interview" }),
      createInterviewContact("Jane Smith", { id: "2", name: "Temple" }),
      createInterviewContact("Bob Brown", { id: "3", name: "Welfare" }),
    ];
    render(<ContactList contacts={contacts} />);

    const selectAllCheckbox = screen.getByLabelText(/select all/i);
    await user.click(selectAllCheckbox);

    expect(screen.getByText(/3 contacts selected/i)).toBeInTheDocument();
  });

  it("clear selection deselects all contacts", async () => {
    const user = userEvent.setup();
    const contacts = [
      createInterviewContact("John Doe", { id: "1", name: "Bishop Interview" }),
      createInterviewContact("Jane Smith", { id: "2", name: "Temple" }),
    ];
    render(<ContactList contacts={contacts} />);

    const selectAllCheckbox = screen.getByLabelText(/select all/i);
    await user.click(selectAllCheckbox);
    expect(screen.getByText(/2 contacts selected/i)).toBeInTheDocument();

    const clearButton = screen.getByRole("button", { name: /clear/i });
    await user.click(clearButton);

    expect(screen.queryByText(/contacts selected/i)).not.toBeInTheDocument();
  });

  it("merges selected contacts into a group", async () => {
    const user = userEvent.setup();
    const contacts = [
      createInterviewContact("John Doe", { id: "1", name: "Bishop Interview" }),
      createInterviewContact("Jane Smith", { id: "2", name: "Temple" }),
    ];
    render(<ContactList contacts={contacts} />);

    const selectAllCheckbox = screen.getByLabelText(/select all/i);
    await user.click(selectAllCheckbox);

    const mergeButton = screen.getByRole("button", { name: /merge/i });
    await user.click(mergeButton);

    expect(screen.getByText(/Group:/i)).toBeInTheDocument();
  });

  it("shows calling contacts with calling name displayed", () => {
    const contacts = [
      createCallingContact(
        "John Doe",
        "Ward Missionary",
        CallingStage.needsCallingExtended,
        { phone: "555-1234" },
      ),
    ];
    render(<ContactList contacts={contacts} />);
    expect(screen.getByText(/Ward Missionary/)).toBeInTheDocument();
  });

  it("shows setting apart contacts with calling name displayed", () => {
    const contacts = [
      createCallingContact(
        "Jane Smith",
        "Primary Teacher",
        CallingStage.needsSettingApart,
        { phone: "555-5678" },
      ),
    ];
    render(<ContactList contacts={contacts} />);
    expect(screen.getByText(/Primary Teacher/)).toBeInTheDocument();
  });

  it("handles contact without phone gracefully", () => {
    const contacts = [
      createInterviewContact("John Doe", { id: "1", name: "Bishop Interview" }),
    ];
    render(<ContactList contacts={contacts} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("handles contact without labels gracefully", () => {
    const contacts = [createInterviewContact("John Doe")];
    render(<ContactList contacts={contacts} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
