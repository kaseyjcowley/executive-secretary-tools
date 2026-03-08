import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import MessagesPage from "@/app/messages/page";
import * as cardsModule from "@/requests/cards";

vi.mock("@/requests/cards", () => ({
  getAppointmentContacts: vi.fn(),
}));

vi.mock("@/utils/get-messaged-contacts", () => ({
  getMessagedContactIds: vi.fn().mockResolvedValue(new Set()),
}));

vi.mock("@/components/ContactList", () => ({
  ContactList: ({ contacts }: { contacts: Array<{ name: string }> }) => (
    <div data-testid="contact-list">
      {contacts.map((c) => (
        <div key={c.name}>{c.name}</div>
      ))}
    </div>
  ),
}));

describe("MessagesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page title", async () => {
    vi.mocked(cardsModule.getAppointmentContacts).mockResolvedValue([]);

    render(await MessagesPage());

    expect(screen.getByText("Appointment Messages")).toBeInTheDocument();
  });

  it("fetches contacts on load", async () => {
    vi.mocked(cardsModule.getAppointmentContacts).mockResolvedValue([]);

    await MessagesPage();

    expect(cardsModule.getAppointmentContacts).toHaveBeenCalled();
  });

  it("renders contacts when fetched successfully", async () => {
    const contacts = [
      {
        name: "John Doe",
        kind: "interview" as const,
        due: "2024-01-15T14:00:00.000Z",
        idMembers: "member-1",
        assigned: undefined,
      },
      {
        name: "Jane Smith",
        kind: "interview" as const,
        due: "2024-01-15T14:00:00.000Z",
        idMembers: "member-1",
        assigned: undefined,
      },
    ];
    vi.mocked(cardsModule.getAppointmentContacts).mockResolvedValue(
      contacts as never,
    );

    render(await MessagesPage());

    expect(screen.getByTestId("contact-list")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("renders loading state initially", async () => {
    vi.mocked(cardsModule.getAppointmentContacts).mockResolvedValue([]);

    render(await MessagesPage());

    expect(screen.getByText("Appointment Messages")).toBeInTheDocument();
  });

  it("handles calling contacts", async () => {
    const callingContact = {
      name: "John Doe",
      kind: "calling" as const,
      calling: "Ward Missionary",
      stage: "needs_calling_extended" as const,
      due: "2024-01-15T14:00:00.000Z",
      idMembers: "member-1",
      assigned: undefined,
    };
    vi.mocked(cardsModule.getAppointmentContacts).mockResolvedValue([
      callingContact,
    ] as never);

    render(await MessagesPage());

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("handles empty contacts array", async () => {
    vi.mocked(cardsModule.getAppointmentContacts).mockResolvedValue([]);

    render(await MessagesPage());

    expect(screen.getByTestId("contact-list")).toBeInTheDocument();
  });
});
