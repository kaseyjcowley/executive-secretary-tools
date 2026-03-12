import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimeSelector } from "@/features/messages/components/TimeSelector";

describe("TimeSelector", () => {
  it("should render before church times", () => {
    render(<TimeSelector selectedTime="09:00" onChange={() => {}} />);

    expect(screen.getByText("9:00 AM")).toBeInTheDocument();
    expect(screen.getByText("9:30 AM")).toBeInTheDocument();
    expect(screen.getByText("10:00 AM")).toBeInTheDocument();
  });

  it("should render after church times", () => {
    render(<TimeSelector selectedTime="12:30" onChange={() => {}} />);

    expect(screen.getByText("12:30 PM")).toBeInTheDocument();
    expect(screen.getByText("1:00 PM")).toBeInTheDocument();
    expect(screen.getByText("2:00 PM")).toBeInTheDocument();
  });

  it("should call onChange when time is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeSelector selectedTime="09:00" onChange={onChange} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, ["12:30"]);

    expect(onChange).toHaveBeenCalledWith("12:30");
  });

  it("should have selected value", () => {
    render(<TimeSelector selectedTime="13:00" onChange={() => {}} />);

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("13:00");
  });
});
