import { NextResponse } from "next/server";
import { ContactCard } from "@/requests/cards";
import { fetchContactCards } from "@/requests/cards/requests";
import { APPOINTMENT_LIST_IDS } from "@/constants";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const listIds = APPOINTMENT_LIST_IDS;

    if (!listIds || listIds.length === 0) {
      return NextResponse.json({ contacts: [] });
    }

    // Fetch from all configured lists in parallel
    const allContacts = await Promise.all(
      listIds.map((listId) => fetchContactCards(listId))
    );

    return NextResponse.json({
      contacts: allContacts.flat(),
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { contacts: [], error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
