import { NextResponse } from "next/server";
import { fetchInterviewCards, fetchCallingCards } from "@/requests/cards/requests";
import { InterviewTrelloCard, CallingTrelloCard } from "@/requests/cards/types";
import { CallingStage } from "@/constants";

export const dynamic = 'force-dynamic';

// List IDs for appointment messaging system - configure these directly
const APPOINTMENT_INTERVIEW_LIST_IDS: string[] = [];
const APPOINTMENT_CALLING_LIST_IDS: string[] = [];

export async function GET() {
  try {
    // Fetch interview cards from configured interview lists
    const interviewCards = await Promise.all(
      APPOINTMENT_INTERVIEW_LIST_IDS.map((listId) => fetchInterviewCards(listId))
    );

    // Fetch calling cards from configured calling lists
    const callingCards = await Promise.all(
      APPOINTMENT_CALLING_LIST_IDS.map((listId) =>
        fetchCallingCards(CallingStage.needsCallingExtended, listId)
      )
    );

    // Combine both types into a single contacts array
    const contacts = [
      ...interviewCards.flat(),
      ...callingCards.flat(),
    ];

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { contacts: [], error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
