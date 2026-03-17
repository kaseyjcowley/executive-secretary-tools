import { Suspense } from "react";
import { ContactList } from "@/features/messages/components/ContactList";
import { sortContactsByLabel } from "@/features/messages/utils/contact-ordering";
import { getAppointmentContacts } from "@/requests/cards";
import { getMessagedContactIds } from "@/utils/get-messaged-contacts";
import { MessagesLoadingSkeleton } from "@/features/messages/components/MessagesLoadingSkeleton";
import { MessagesErrorState } from "@/features/messages/components/MessagesErrorState";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  let contacts;
  try {
    contacts = await getAppointmentContacts();
  } catch (error) {
    console.error("Failed to fetch appointment contacts:", error);
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Appointment Messages
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage and send appointment notifications to members
            </p>
          </div>
          <MessagesErrorState />
        </div>
      </main>
    );
  }

  const sortedContacts = sortContactsByLabel(contacts);
  const contactNames = sortedContacts.map((c) => c.name);
  const suppressedIds = await getMessagedContactIds(contactNames);

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Appointment Messages
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage and send appointment notifications to members
          </p>
        </div>
        <Suspense fallback={<MessagesLoadingSkeleton />}>
          <ContactList
            contacts={sortedContacts}
            suppressedIds={suppressedIds}
          />
        </Suspense>
      </div>
    </main>
  );
}
