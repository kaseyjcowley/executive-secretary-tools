import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactFilters, FilterState } from "@/components/ContactFilters";
import { createInterviewContact, createCallingContact } from "@/test/factories";
import { CallingStage } from "@/constants";

describe("ContactFilters component", () => {
  const contacts = [
    createInterviewContact("John Doe", { id: "1", name: "Bishop Interview" }),
    createInterviewContact("Jane Smith", { id: "2", name: "Temple Recommend" }),
    createCallingContact(
      "Alice Brown",
      "Primary Teacher",
      CallingStage.needsCallingExtended,
    ),
  ];

  const defaultFilters: FilterState = {
    type: "all",
    status: "all",
    label: "",
    stage: "all",
    assigned: "",
  };

  it("renders all filter dropdowns", () => {
    render(
      <ContactFilters
        contacts={contacts}
        filters={defaultFilters}
        onFiltersChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Type:")).toBeInTheDocument();
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("Label:")).toBeInTheDocument();
    expect(screen.getByText("Stage:")).toBeInTheDocument();
    expect(screen.getByText("Assigned:")).toBeInTheDocument();
  });

  it("shows correct contact count", () => {
    render(
      <ContactFilters
        contacts={contacts}
        filters={defaultFilters}
        onFiltersChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/Showing 3 of 3 contacts/)).toBeInTheDocument();
  });

  it("calls onFiltersChange when type is changed", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();

    render(
      <ContactFilters
        contacts={contacts}
        filters={defaultFilters}
        onFiltersChange={onFiltersChange}
      />,
    );

    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[0], "interview");

    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      type: "interview",
    });
  });

  it("calls onFiltersChange when status is changed", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();

    render(
      <ContactFilters
        contacts={contacts}
        filters={defaultFilters}
        onFiltersChange={onFiltersChange}
      />,
    );

    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[1], "unmessaged");

    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      status: "unmessaged",
    });
  });

  it("shows label dropdown only when type is not calling", () => {
    render(
      <ContactFilters
        contacts={contacts}
        filters={defaultFilters}
        onFiltersChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Label:")).toBeInTheDocument();
  });

  it("shows stage dropdown only when type is not interview", () => {
    render(
      <ContactFilters
        contacts={contacts}
        filters={defaultFilters}
        onFiltersChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Stage:")).toBeInTheDocument();
  });

  it("shows available labels from contacts", () => {
    render(
      <ContactFilters
        contacts={contacts}
        filters={defaultFilters}
        onFiltersChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Bishop Interview")).toBeInTheDocument();
    expect(screen.getByText("Temple Recommend")).toBeInTheDocument();
  });

  it("shows available assigned members from contacts", () => {
    const contactsWithAssigned = [
      { ...contacts[0], assigned: "Bishop" },
      { ...contacts[1], assigned: "First Counselor" },
      ...contacts.slice(2),
    ];

    render(
      <ContactFilters
        contacts={contactsWithAssigned}
        filters={defaultFilters}
        onFiltersChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Bishop")).toBeInTheDocument();
    expect(screen.getByText("First Counselor")).toBeInTheDocument();
  });

  it("shows clear all button when filters are active", () => {
    render(
      <ContactFilters
        contacts={contacts}
        filters={{ ...defaultFilters, type: "interview" }}
        onFiltersChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Clear all")).toBeInTheDocument();
  });

  it("does not show clear all button when no filters are active", () => {
    render(
      <ContactFilters
        contacts={contacts}
        filters={defaultFilters}
        onFiltersChange={vi.fn()}
      />,
    );

    expect(screen.queryByText("Clear all")).not.toBeInTheDocument();
  });

  it("calls onFiltersChange with empty filters when clear all is clicked", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();

    render(
      <ContactFilters
        contacts={contacts}
        filters={{ ...defaultFilters, type: "interview" }}
        onFiltersChange={onFiltersChange}
      />,
    );

    await user.click(screen.getByText("Clear all"));

    expect(onFiltersChange).toHaveBeenCalledWith(defaultFilters);
  });
});
