import { Suspense } from "react";
import { ContactList } from "@/components/ContactList";
import { sortContactsByLabel } from "@/utils/contact-ordering";
import { getAppointmentContacts } from "@/requests/cards";

export default async function MessagesPage() {
  const contacts = await getAppointmentContacts();

  // Apply ordering server-side before passing to ContactList
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
