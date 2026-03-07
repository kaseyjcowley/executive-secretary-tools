import { Suspense } from "react";
import { ContactList } from "@/components/ContactList";
import { sortContactsByLabel } from "@/utils/contact-ordering";
import { getAppointmentContacts } from "@/requests/cards";

export default async function MessagesPage() {
  let contacts;
  try {
    contacts = await getAppointmentContacts();
  } catch (error) {
    console.error("Failed to fetch appointment contacts:", error);
    return (
      <main className="p-2 md:p-24 flex flex-col space-y-10 overflow-x-hidden">
        <h1 className="text-3xl font-bold leading-none tracking-tight text-gray-900">
          Appointment Messages
        </h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
          <p className="font-semibold">Error Loading Contacts</p>
          <p className="text-sm mt-1">
            Unable to load appointment contacts. Please try again later.
          </p>
        </div>
      </main>
    );
  }

  const sortedContacts = sortContactsByLabel(contacts);

  return (
    <main className="p-2 md:p-24 flex flex-col space-y-10 overflow-x-hidden">
      <h1 className="text-3xl font-bold leading-none tracking-tight text-gray-900">
        Appointment Messages
      </h1>
      <Suspense
        fallback={<p className="text-slate-900">Loading contacts...</p>}
      >
        <ContactList contacts={sortedContacts} />
      </Suspense>
    </main>
  );
}
