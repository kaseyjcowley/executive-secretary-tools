export * from "./requests";
export * from "./types";

import {
  fetchInterviewCardsForContacts,
  fetchCallingCardsForContacts,
} from "./requests";
import { CallingStage, TRELLO_LIST_IDS } from "@/constants";
import { matchContact } from "@/utils/contact-fuzzy-match";

export async function getAppointmentContacts() {
  const interviewCards = await Promise.all(
    TRELLO_LIST_IDS.APPOINTMENT_INTERVIEWS.map((listId) =>
      fetchInterviewCardsForContacts(listId),
    ),
  );

  const callingCards = await Promise.all([
    fetchCallingCardsForContacts(
      CallingStage.needsCallingExtended,
      TRELLO_LIST_IDS.CALLINGS_NEEDS_EXTENSION,
    ),
    fetchCallingCardsForContacts(
      CallingStage.needsSettingApart,
      TRELLO_LIST_IDS.CALLINGS_NEEDS_SETTING_APART,
    ),
  ]);

  const contacts = [...interviewCards.flat(), ...callingCards.flat()];

  return contacts.map((contact) => ({
    ...contact,
    memberId: matchContact(contact.name) || undefined,
  }));
}
