import { Suspense } from "react";
import { MessagesPageClient } from "@/components/MessagesPageClient";
import { sortContactsByLabel } from "@/utils/contact-ordering";
import { getAppointmentContacts } from "@/requests/cards";
import { getMessagedContactIds } from "@/utils/get-messaged-contacts";
import { IconMail } from "@/components/ui/Icons";

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="w-5 h-5 bg-gray-200 rounded mt-1" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-10 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
      <div className="text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconMail className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error Loading Contacts
        </h3>
        <p className="text-gray-600 mb-4">
          Unable to load appointment contacts. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

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
          <ErrorState />
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
        <Suspense fallback={<LoadingSkeleton />}>
          <MessagesPageClient
            contacts={sortedContacts}
            suppressedIds={suppressedIds}
          />
        </Suspense>
      </div>
    </main>
  );
}
