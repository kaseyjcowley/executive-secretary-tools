"use client";

import { Button } from "@/components/ui";
import { IconMail } from "@/components/ui/Icons";

export function MessagesErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <IconMail className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Error Loading Contacts
      </h3>
      <p className="text-gray-600 mb-4">
        Unable to load appointment contacts. Please try again later.
      </p>
      <Button onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  );
}
