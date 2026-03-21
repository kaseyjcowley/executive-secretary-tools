import { Suspense } from "react";
import { ErrorState } from "@/components/ui";
import { ContactList } from "@/features/messages/components/ContactList";
import { sortContactsByLabel } from "@/features/messages/utils/contact-ordering";
import { getAppointmentContacts } from "@/requests/cards";
import { getMessagedContactIds } from "@/utils/get-messaged-contacts";
import { MessagesLoadingSkeleton } from "@/features/messages/components/MessagesLoadingSkeleton";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  let contacts;
  try {
    contacts = await getAppointmentContacts();
  } catch (error) {
    console.error("Failed to fetch appointment contacts:", error);
    return (
      <div className="container mx-auto px-0 py-8 max-w-4xl">
        <div className="bg-base-100 border border-base-300 rounded-lg shadow-sm mx-0 -mx-4 md:mx-auto md:px-6 px-4 p-4 md:p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Appointment Messages
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Manage and send appointment notifications to members
          </p>
          <ErrorState
            title="Error Loading Contacts"
            description="Unable to load appointment contacts. Please try again later."
          />
        </div>
      </div>
    );
  }

  const sortedContacts = sortContactsByLabel(contacts);
  const contactNames = sortedContacts.map((c) => c.name);
  const suppressedIds = await getMessagedContactIds(contactNames);

  return (
    <div className="container mx-auto px-0 py-8 max-w-4xl">
      <div className="bg-base-100 border border-base-300 rounded-lg shadow-sm mx-0 -mx-4 md:mx-auto md:px-6 px-4 p-4 md:p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Appointment Messages
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Manage and send appointment notifications to members
        </p>
        <Suspense fallback={<MessagesLoadingSkeleton />}>
          <ContactList
            contacts={sortedContacts}
            suppressedIds={suppressedIds}
          />
        </Suspense>
      </div>
    </div>
  );
}
