import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MergeToolbar } from "@/components/MergeToolbar";

describe("MergeToolbar", () => {
  const defaultProps = {
    selectedCount: 0,
    onMerge: vi.fn(),
    onClearSelection: vi.fn(),
    onMarkAsMessaged: vi.fn(),
  };

  it("does not render when no contacts are selected", () => {
    render(<MergeToolbar {...defaultProps} selectedCount={0} />);
    expect(screen.queryByText("selected")).not.toBeInTheDocument();
  });

  it("renders when contacts are selected", () => {
    render(<MergeToolbar {...defaultProps} selectedCount={3} />);
    expect(screen.getByText("3 contacts selected")).toBeInTheDocument();
  });

  it("displays singular 'contact' when only one is selected", () => {
    render(<MergeToolbar {...defaultProps} selectedCount={1} />);
    expect(screen.getByText("1 contact selected")).toBeInTheDocument();
  });

  it("displays plural 'contacts' when multiple are selected", () => {
    render(<MergeToolbar {...defaultProps} selectedCount={2} />);
    expect(screen.getByText("2 contacts selected")).toBeInTheDocument();
  });

  it("merge button is disabled when fewer than 2 contacts selected", () => {
    render(<MergeToolbar {...defaultProps} selectedCount={1} />);
    const mergeButton = screen.getByRole("button", { name: /merge/i });
    expect(mergeButton).toBeDisabled();
  });

  it("merge button is enabled when 2 or more contacts selected", () => {
    render(<MergeToolbar {...defaultProps} selectedCount={2} />);
    const mergeButton = screen.getByRole("button", { name: /merge/i });
    expect(mergeButton).toBeEnabled();
  });

  it("merge button is enabled when more than 2 contacts selected", () => {
    render(<MergeToolbar {...defaultProps} selectedCount={5} />);
    const mergeButton = screen.getByRole("button", { name: /merge/i });
    expect(mergeButton).toBeEnabled();
  });

  it("clear selection button is disabled when no contacts selected", () => {
    render(<MergeToolbar {...defaultProps} selectedCount={0} />);
    const clearButton = screen.getByRole("button", { name: /clear/i });
    expect(clearButton).toBeDisabled();
  });

  it("clear selection button is enabled when contacts are selected", () => {
    render(<MergeToolbar {...defaultProps} selectedCount={3} />);
    const clearButton = screen.getByRole("button", { name: /clear/i });
    expect(clearButton).toBeEnabled();
  });

  it("calls onMerge when merge button is clicked", async () => {
    const user = userEvent.setup();
    const onMerge = vi.fn();
    render(
      <MergeToolbar {...defaultProps} selectedCount={3} onMerge={onMerge} />,
    );

    const mergeButton = screen.getByRole("button", { name: /merge/i });
    await user.click(mergeButton);

    expect(onMerge).toHaveBeenCalledTimes(1);
  });

  it("calls onClearSelection when clear button is clicked", async () => {
    const user = userEvent.setup();
    const onClearSelection = vi.fn();
    render(
      <MergeToolbar
        {...defaultProps}
        selectedCount={3}
        onClearSelection={onClearSelection}
      />,
    );

    const clearButton = screen.getByRole("button", { name: /clear/i });
    await user.click(clearButton);

    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });

  it("does not call onMerge when merge button is disabled", async () => {
    const user = userEvent.setup();
    const onMerge = vi.fn();
    render(
      <MergeToolbar {...defaultProps} selectedCount={1} onMerge={onMerge} />,
    );

    const mergeButton = screen.getByRole("button", { name: /merge/i });
    await user.click(mergeButton);

    expect(onMerge).not.toHaveBeenCalled();
  });
});
