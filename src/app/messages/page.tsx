import { Suspense } from "react";
import { Contact } from "@/types/messages";

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

function ContactList({ contacts }: { contacts: Contact[] }) {
  if (!contacts || contacts.length === 0) {
    return <p className="text-slate-900">No contacts found</p>;
  }

  return (
    <div className="space-y-2">
      {contacts.map((contact, index) => {
        const label = "labels" in contact ? contact.labels?.name : null;

        return (
          <div
            key={contact.name || index}
            className={`border border-slate-500 p-4 ${
              index % 2 === 0 ? "bg-slate-50" : "bg-white"
            }`}
          >
            <div className="flex flex-col space-y-1">
              <p className="text-lg font-semibold text-slate-900">
                {contact.name}
              </p>
              {label && (
                <p className="text-sm text-slate-700">
                  Label: {label}
                </p>
              )}
              <p className="text-sm text-slate-600">
                Phone: ---
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
