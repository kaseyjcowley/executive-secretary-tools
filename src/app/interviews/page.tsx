import { Suspense } from "react";
import { format } from "date-fns";
import { InterviewsTable } from "@/features/interviews/components/InterviewsTable";
import { BishopricMemberId } from "@/constants";
import {
  CallingTrelloCard,
  fetchAllCardsGroupedByMember,
  InterviewTrelloCard,
} from "@/requests/cards";
import { size } from "@/lib/utils/helpers";
import { IconClock } from "@/components/ui/Icons";
import { ErrorState, Card, Skeleton, EmptyState } from "@/components/ui";
import { getClosestSunday } from "@/utils/dates";

export const dynamic = "force-dynamic";

type InterviewCards = Record<
  string,
  Array<InterviewTrelloCard | CallingTrelloCard>
>;

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <Skeleton className="h-6 w-1/3 mb-6" />
          <div className="space-y-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </Card>
      ))}
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
      <EmptyState
        icon={<IconClock className="w-6 h-6 text-gray-400" />}
        title="No Interviews Scheduled"
        description="There are no interviews scheduled for this week."
      />
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

export default async function Home() {
  const closestSunday = getClosestSunday();

  return (
    <div className="container mx-auto px-0 py-8 max-w-4xl">
      <div className="bg-base-100 border border-base-300 rounded-lg shadow-sm mx-0 -mx-4 md:mx-auto md:px-6 px-4 p-4 md:p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Interviews for Sunday{" "}
          {closestSunday ? format(closestSunday, "MMM do, yyyy") : ""}
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          View and manage interview schedules for Sunday
        </p>
        <Suspense fallback={<LoadingSkeleton />}>
          <InterviewsContent />
        </Suspense>
      </div>
    </div>
  );
}
