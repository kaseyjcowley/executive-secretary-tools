export * from "./requests";
export * from "./types";

import {
  fetchInterviewCardsForContacts,
  fetchCallingCardsForContacts,
} from "./requests";
import { CallingStage } from "@/constants";
import { matchContact } from "@/utils/contact-fuzzy-match";

const APPOINTMENT_INTERVIEW_LIST_IDS: string[] = ["698142f18c51336104b0ca17"];

export async function getAppointmentContacts() {
  const interviewCards = await Promise.all(
    APPOINTMENT_INTERVIEW_LIST_IDS.map((listId) =>
      fetchInterviewCardsForContacts(listId),
    ),
  );

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

  const contacts = [...interviewCards.flat(), ...callingCards.flat()];

  return contacts.map((contact) => ({
    ...contact,
    memberId: matchContact(contact.name) || undefined,
  }));
}
