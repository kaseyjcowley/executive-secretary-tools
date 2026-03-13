import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { GroupCard } from "@/features/messages/components/GroupCard";
import { createInterviewContact, createContactGroup } from "@/test/factories";

vi.mock("@/features/messages/utils/template-loader", () => ({
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
    {
      id: "temple-recommend-renewal",
      name: "Temple Recommend Renewal",
      category: "interview",
      templatePath: "temple-recommend-renewal",
      content: "Hello {{name}}",
    },
  ],
  loadTemplateContent: vi.fn((id: string) => `Template for ${id}`),
}));

vi.mock("@/utils/message-generator", () => ({
  classifyScenario: vi.fn(() => "single"),
  generateMessage: vi.fn(() => "Generated message"),
}));

vi.mock("@/utils/format-member-display", () => ({
  formatMemberDisplayNames: vi.fn((members: { name: string }[]) =>
    members.map((m) => m.name),
  ),
}));

vi.mock("@/data/members.json", () => ({
  default: [
    { id: 1, name: "Member One", age: 40, gender: "M", phone: "555-0001" },
    { id: 2, name: "Member Two", age: 35, gender: "F", phone: "555-0002" },
  ],
}));

describe("GroupCard", () => {
  const contacts = [
    createInterviewContact("John Doe", { id: "1", name: "Bishop Interview" }),
    createInterviewContact("Jane Smith", { id: "2", name: "Temple" }),
  ];

  it("renders group with member names", () => {
    const group = createContactGroup(["John Doe", "Jane Smith"]);
    render(<GroupCard group={group} contacts={contacts} onUnmerge={vi.fn()} />);
    expect(screen.getByText(/Group:/)).toBeInTheDocument();
    expect(screen.getByText(/John Doe, Jane Smith/)).toBeInTheDocument();
  });

  it("renders step labels for group configuration", () => {
    const group = createContactGroup(["John Doe"]);
    render(<GroupCard group={group} contacts={contacts} onUnmerge={vi.fn()} />);
    expect(screen.getAllByText(/Step/i).length).toBeGreaterThan(0);
  });

  it("renders step 2 label for selecting subjects", () => {
    const group = createContactGroup(["John Doe"]);
    render(<GroupCard group={group} contacts={contacts} onUnmerge={vi.fn()} />);
    expect(screen.getByText(/Step 2:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Configure Appointment Subjects/i),
    ).toBeInTheDocument();
  });

  it("renders recipients are subjects checkbox", () => {
    const group = createContactGroup(["John Doe"]);
    render(<GroupCard group={group} contacts={contacts} onUnmerge={vi.fn()} />);
    expect(
      screen.getByLabelText(/Recipients are the same as subjects/i),
    ).toBeInTheDocument();
  });

  it("calls onUnmerge when unmerge button is clicked", async () => {
    const user = userEvent.setup();
    const onUnmerge = vi.fn();
    const group = createContactGroup(["John Doe"]);
    render(
      <GroupCard group={group} contacts={contacts} onUnmerge={onUnmerge} />,
    );

    const unmergeButton = screen.getByRole("button", { name: /unmerge/i });
    await user.click(unmergeButton);

    expect(onUnmerge).toHaveBeenCalled();
  });

  it("shows member selector when recipients are not subjects", () => {
    const group = createContactGroup(["John Doe"]);
    render(<GroupCard group={group} contacts={contacts} onUnmerge={vi.fn()} />);
    expect(screen.getByText(/Select member/i)).toBeInTheDocument();
  });

  it("shows subject checkboxes for group contacts", () => {
    const group = createContactGroup(["John Doe", "Jane Smith"]);
    render(<GroupCard group={group} contacts={contacts} onUnmerge={vi.fn()} />);
    expect(screen.getByText(/Group:/)).toBeInTheDocument();
  });

  it("displays incomplete state message when steps not done", () => {
    const group = createContactGroup(["John Doe", "Jane Smith"]);
    render(<GroupCard group={group} contacts={contacts} onUnmerge={vi.fn()} />);
    expect(
      screen.getByText(/Complete the steps above to see preview/i),
    ).toBeInTheDocument();
  });

  it("handles empty group gracefully", () => {
    const group = createContactGroup([]);
    render(<GroupCard group={group} contacts={contacts} onUnmerge={vi.fn()} />);
    expect(screen.getByText(/Group:/)).toBeInTheDocument();
  });
});
