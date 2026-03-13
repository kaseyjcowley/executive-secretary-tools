import { Suspense } from "react";
import { ContactList } from "@/features/messages/components/ContactList";
import { sortContactsByLabel } from "@/features/messages/utils/contact-ordering";
import { getAppointmentContacts } from "@/requests/cards";
import { getMessagedContactIds } from "@/utils/get-messaged-contacts";
import { IconMail } from "@/components/ui/Icons";
import { MessagesLoadingSkeleton } from "@/features/messages/components/MessagesLoadingSkeleton";
import { MessagesErrorState } from "@/features/messages/components/MessagesErrorState";

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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IconMail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold leading-none tracking-tight text-gray-900">
                  Appointment Messages
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Manage and send appointment notifications to members
                </p>
              </div>
            </div>
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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IconMail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold leading-none tracking-tight text-gray-900">
                Appointment Messages
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage and send appointment notifications to members
              </p>
            </div>
          </div>
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
