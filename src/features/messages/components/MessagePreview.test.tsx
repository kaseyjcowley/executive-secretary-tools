import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessagePreview } from "@/features/messages/components/MessagePreview";

describe("MessagePreview", () => {
  it("should show loading spinner when isLoading is true", () => {
    render(
      <MessagePreview
        templatePreview=""
        phoneNumbers={["555-0001"]}
        isLoading={true}
      />,
    );

    expect(screen.getByText(/Generating message/i)).toBeInTheDocument();
  });

  it("should show message when templatePreview has content", () => {
    render(
      <MessagePreview
        templatePreview="Hello, this is a test message"
        phoneNumbers={["555-0001"]}
        isLoading={false}
      />,
    );

    expect(
      screen.getByText("Hello, this is a test message"),
    ).toBeInTheDocument();
  });

  it("should show placeholder when no message and not loading", () => {
    render(
      <MessagePreview
        templatePreview=""
        phoneNumbers={["555-0001"]}
        isLoading={false}
      />,
    );

    expect(
      screen.getByText("Click Generate Message to preview"),
    ).toBeInTheDocument();
  });

  it("should show placeholder for not ready when isReady is false", () => {
    render(
      <MessagePreview
        templatePreview=""
        phoneNumbers={[]}
        isReady={false}
        isLoading={false}
      />,
    );

    expect(
      screen.getByText("Fill in all required fields to preview the message"),
    ).toBeInTheDocument();
  });

  it("should render SMS link with correct href when phoneNumbers exist", () => {
    render(
      <MessagePreview
        templatePreview="Test message"
        phoneNumbers={["555-0001", "555-0002"]}
        isLoading={false}
      />,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "sms:555-0001,555-0002?body=Test%20message",
    );
  });

  it("should not render SMS link when no phoneNumbers", () => {
    render(
      <MessagePreview
        templatePreview="Test message"
        phoneNumbers={[]}
        isLoading={false}
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
