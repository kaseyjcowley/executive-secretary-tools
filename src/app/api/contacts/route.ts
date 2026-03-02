import { NextResponse } from "next/server";
import {
  fetchInterviewCardsForContacts,
  fetchCallingCardsForContacts,
} from "@/requests/cards/requests";
import { CallingStage } from "@/constants";
import { matchContact } from "@/utils/contact-fuzzy-match";

export const dynamic = "force-dynamic";

// List IDs for appointment messaging system - configure these directly
const APPOINTMENT_INTERVIEW_LIST_IDS: string[] = ["698142f18c51336104b0ca17"];

export async function GET() {
  try {
    // Fetch interview cards from configured interview lists (no date filtering)
    const interviewCards = await Promise.all(
      APPOINTMENT_INTERVIEW_LIST_IDS.map((listId) =>
        fetchInterviewCardsForContacts(listId),
      ),
    );

    // Fetch calling cards from configured calling lists (no date filtering)
    const callingCards = await Promise.all([
      fetchCallingCardsForContacts(
        CallingStage.needsCallingExtended,
        "69814029755d3899bbf4191c",
      ),
      fetchCallingCardsForContacts(
        CallingStage.needsSettingApart,
        "5f62bc2052e58c7dc5740b4f",
      ),
    ]);

    // Combine both types into a single contacts array
    const contacts = [...interviewCards.flat(), ...callingCards.flat()];

    // Enrich contacts with member IDs from fuzzy-matched directory entries
    const enrichedContacts = contacts.map(contact => ({
      ...contact,
      memberId: matchContact(contact.name) || undefined,
    }));

    return NextResponse.json({ contacts: enrichedContacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { contacts: [], error: "Failed to fetch contacts" },
      { status: 500 },
    );
  }
}
