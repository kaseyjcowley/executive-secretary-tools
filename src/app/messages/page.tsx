import { Suspense } from "react";
import { ContactList } from "@/components/ContactList";

export default async function MessagesPage() {
  const contactsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/contacts`,
    { cache: "no-store" }
  );

  const { contacts } = await contactsResponse.json();

  return (
    <main className="p-2 md:p-24 flex flex-col space-y-10">
      <h1 className="text-3xl font-bold leading-none tracking-tight text-gray-900">
        Appointment Messages
      </h1>
      <Suspense fallback={<p className="text-slate-900">Loading contacts...</p>}>
        <ContactList contacts={contacts} />
      </Suspense>
    </main>
  );
}
