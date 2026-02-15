import { NextResponse } from "next/server";
import {
  fetchInterviewCardsForContacts,
  fetchCallingCardsForContacts,
} from "@/requests/cards/requests";
import { CallingStage } from "@/constants";

export const dynamic = "force-dynamic";

// List IDs for appointment messaging system - configure these directly
const APPOINTMENT_INTERVIEW_LIST_IDS: string[] = ["698142f18c51336104b0ca17"];
const APPOINTMENT_CALLING_LIST_IDS: string[] = ["69814029755d3899bbf4191c"];

export async function GET() {
  try {
    // Fetch interview cards from configured interview lists (no date filtering)
    const interviewCards = await Promise.all(
      APPOINTMENT_INTERVIEW_LIST_IDS.map((listId) =>
        fetchInterviewCardsForContacts(listId),
      ),
    );

    // Fetch calling cards from configured calling lists (no date filtering)
    const callingCards = await Promise.all(
      APPOINTMENT_CALLING_LIST_IDS.map((listId) =>
        fetchCallingCardsForContacts(CallingStage.needsCallingExtended, listId),
      ),
    );

    // Combine both types into a single contacts array
    const contacts = [...interviewCards.flat(), ...callingCards.flat()];

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { contacts: [], error: "Failed to fetch contacts" },
      { status: 500 },
    );
  }
}
