import { Suspense } from "react";
import { InterviewsTable } from "@/components/InterviewsTable";
import { InterviewsHeader } from "@/components/InterviewsHeader";
import { BishopricMemberId } from "@/constants";
import {
  CallingTrelloCard,
  fetchAllCardsGroupedByMember,
  InterviewTrelloCard,
} from "@/requests/cards";
import { size } from "@/utils/helpers";
import { IconClock } from "@/components/ui/Icons";

type InterviewCards = Record<
  string,
  Array<InterviewTrelloCard | CallingTrelloCard>
>;

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
        >
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
          <div className="space-y-3">
            <div className="h-12 bg-gray-100 rounded" />
            <div className="h-12 bg-gray-100 rounded" />
            <div className="h-12 bg-gray-100 rounded" />
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

async function InterviewsContent() {
  let interviews: InterviewCards;
  try {
    interviews = await fetchAllCardsGroupedByMember();
  } catch (error) {
    console.error("Failed to fetch interviews:", error);
    return <ErrorState />;
  }

  const hasInterviews = size(interviews) > 0;

  if (!hasInterviews) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconClock className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Interviews Scheduled
          </h3>
          <p className="text-gray-600">
            There are no interviews scheduled for this week.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.values(BishopricMemberId)
        .filter((memberId) => interviews[memberId]?.length > 0)
        .map((memberId) => (
          <InterviewsTable
            key={memberId}
            memberId={memberId}
            interviews={interviews[memberId]}
          />
        ))}
      {interviews.unassigned?.length > 0 && (
        <InterviewsTable
          memberId="unassigned"
          interviews={interviews.unassigned}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-8">
        <InterviewsHeader />
        <Suspense fallback={<LoadingSkeleton />}>
          <InterviewsContent />
        </Suspense>
      </div>
    </main>
  );
}
