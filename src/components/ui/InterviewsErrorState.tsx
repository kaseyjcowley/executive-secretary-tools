"use client";

import { IconClock } from "@/components/ui/Icons";

export function ErrorState() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
      <div className="text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconClock className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error Loading Interviews
        </h3>
        <p className="text-gray-600 mb-4">
          Unable to load interviews. Please try again later.
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
