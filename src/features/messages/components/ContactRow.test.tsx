import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { ContactRow } from "@/features/messages/components/ContactRow";
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

vi.mock("@/features/messages/hooks/useMemberSelection", () => ({
  useMemberSelection: vi.fn(() => ({
    selectedMemberIds: [-1],
    addMember: vi.fn(),
    removeMember: vi.fn(),
    changeMember: vi.fn(),
  })),
}));

vi.mock("@/utils/contact-fuzzy-match", () => ({
  matchContact: vi.fn((name: string) => {
    if (name === "Bishop John") return 1;
    if (name === "John Doe") return 1;
    return undefined;
  }),
}));

vi.mock("@/data/members.json", () => ({
  default: [
    { id: 1, name: "Bishop John", age: 40, gender: "M", phone: "555-0001" },
    { id: 2, name: "Sister Jane", age: 35, gender: "F", phone: "555-0002" },
    { id: 3, name: "Brother Smith", age: 45, gender: "M", phone: "555-0003" },
    { id: 4, name: "Sister Mary", age: 30, gender: "F", phone: "555-0004" },
  ],
}));

vi.mock("@/utils/message-generator", () => ({
  classifyScenario: vi.fn(() => "single-type"),
  generateMessage: vi.fn(),
}));

vi.mock("@/utils/date-formatters", () => ({
  formatTimeForDisplay: vi.fn(() => "6:00 PM"),
}));

import { generateMessage, classifyScenario } from "@/utils/message-generator";
import { MEMBER_SELECTION } from "@/constants";

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
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).not.toBeChecked();
  });

  it("renders checkbox checked when selected", () => {
    const contact = createInterviewContact("John Doe");
    render(<ContactRow contact={contact} isSelected={true} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeChecked();
  });

  it("checkbox is disabled when contact is in a group", () => {
    const contact = createInterviewContact("John Doe");
    render(<ContactRow contact={contact} isInGroup={true} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeDisabled();
  });

  it("calls onSelect when checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const contact = createInterviewContact("John Doe");
    render(<ContactRow contact={contact} onSelect={onSelect} />);

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);

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

  describe("generatePreview", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should call generateMessage with correct scenario when button is clicked", async () => {
      const user = userEvent.setup();
      const contact = createInterviewContact("Bishop John", {
        id: "interview-reminder",
        name: "Interview Reminder",
      });

      (generateMessage as ReturnType<typeof vi.fn>).mockResolvedValue(
        "Test message",
      );

      render(
        <ContactRow contact={contact} initialTemplateId="interview-reminder" />,
      );

      const generateButton = await screen.findByText("Generate Message");
      await user.click(generateButton);

      expect(generateMessage).toHaveBeenCalled();
    });

    it("should set templatePreview on success", async () => {
      const user = userEvent.setup();
      const contact = createInterviewContact("Bishop John", {
        id: "interview-reminder",
        name: "Interview Reminder",
      });

      (generateMessage as ReturnType<typeof vi.fn>).mockResolvedValue(
        "Hello, this is your message",
      );

      render(
        <ContactRow contact={contact} initialTemplateId="interview-reminder" />,
      );

      const generateButton = await screen.findByText("Generate Message");
      await user.click(generateButton);

      await screen.findByText("Hello, this is your message");
    });

    it("should set error message on failure", async () => {
      const user = userEvent.setup();
      const contact = createInterviewContact("Bishop John", {
        id: "interview-reminder",
        name: "Interview Reminder",
      });

      (generateMessage as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("API Error"),
      );

      render(
        <ContactRow contact={contact} initialTemplateId="interview-reminder" />,
      );

      const generateButton = await screen.findByText("Generate Message");
      await user.click(generateButton);

      await screen.findByText("Unable to generate message. Please try again.");
    });

    it("should set isLoadingPreview to true then false during generation", async () => {
      const user = userEvent.setup();
      const contact = createInterviewContact("Bishop John", {
        id: "interview-reminder",
        name: "Interview Reminder",
      });

      let resolveMessage: (value: string) => void;
      (generateMessage as ReturnType<typeof vi.fn>).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveMessage = resolve;
          }),
      );

      render(
        <ContactRow contact={contact} initialTemplateId="interview-reminder" />,
      );

      const generateButton = await screen.findByText("Generate Message");
      await user.click(generateButton);

      await screen.findByText(/Generating message/i);

      resolveMessage!("Test message");

      await screen.findByText("Test message");
    });

    it("should handle AbortError gracefully without showing error", async () => {
      const user = userEvent.setup();
      const contact = createInterviewContact("Bishop John", {
        id: "interview-reminder",
        name: "Interview Reminder",
      });

      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      (generateMessage as ReturnType<typeof vi.fn>).mockRejectedValue(
        abortError,
      );

      render(
        <ContactRow contact={contact} initialTemplateId="interview-reminder" />,
      );

      const generateButton = await screen.findByText("Generate Message");
      await user.click(generateButton);

      await screen.findByText("Generate Message");
    });
  });

  describe("conditional rendering", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should show Generate button when canGenerate is true", async () => {
      const contact = createInterviewContact("Bishop John", {
        id: "interview-reminder",
        name: "Interview Reminder",
      });

      (generateMessage as ReturnType<typeof vi.fn>).mockResolvedValue(
        "Test message",
      );

      render(
        <ContactRow contact={contact} initialTemplateId="interview-reminder" />,
      );

      expect(await screen.findByText("Generate Message")).toBeInTheDocument();
    });

    it("should hide Generate button when template not selected", () => {
      const contact = createInterviewContact("John Doe");

      render(<ContactRow contact={contact} />);

      expect(screen.queryByText("Generate Message")).not.toBeInTheDocument();
    });

    it("should show subject selector when recipientsAreSubjects is false", async () => {
      const user = userEvent.setup();
      const contact = createInterviewContact("John Doe");

      render(<ContactRow contact={contact} />);

      const checkbox = screen.getByLabelText("Recipients are subjects");
      await user.click(checkbox);

      expect(screen.getByText("Subject:")).toBeInTheDocument();
    });

    it("should hide subject selector when recipientsAreSubjects is true", async () => {
      const user = userEvent.setup();
      const contact = createInterviewContact("John Doe");

      render(<ContactRow contact={contact} />);

      expect(screen.queryByText("Subject:")).not.toBeInTheDocument();

      const checkbox = screen.getByLabelText("Recipients are subjects");
      await user.click(checkbox);
      await user.click(checkbox);

      expect(screen.queryByText("Subject:")).not.toBeInTheDocument();
    });
  });

  describe("member selection", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should show Add button for recipients", async () => {
      const user = userEvent.setup();
      const contact = createInterviewContact("John Doe");

      render(<ContactRow contact={contact} />);

      const addButtons = await screen.findAllByRole("button", { name: /add/i });
      expect(addButtons.length).toBeGreaterThan(0);
    });

    it("should show subject selector after unchecking recipientsAreSubjects", async () => {
      const user = userEvent.setup();
      const contact = createInterviewContact("John Doe");

      render(<ContactRow contact={contact} />);

      const checkbox = screen.getByLabelText("Recipients are subjects");
      await user.click(checkbox);

      expect(screen.getByText("Subject:")).toBeInTheDocument();
    });
  });

  describe("recipientsAreSubjects checkbox", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should toggle recipientsAreSubjects state on change", async () => {
      const user = userEvent.setup();
      const contact = createInterviewContact("John Doe");

      render(<ContactRow contact={contact} />);

      const checkbox = screen.getByLabelText("Recipients are subjects");
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });
});
