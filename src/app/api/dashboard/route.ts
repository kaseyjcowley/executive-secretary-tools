import { NextResponse } from "next/server";
import { getQueue } from "@/utils/youth-queue";
import { fetchAllCardsGroupedByMember } from "@/requests/cards";
import { getMessagedContactIds } from "@/utils/get-messaged-contacts";
import { getAppointmentContacts } from "@/requests/cards";

const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    const [contacts, interviews, queue] = await Promise.all([
      getAppointmentContacts(),
      fetchAllCardsGroupedByMember(),
      getQueue(),
    ]);

    const messagedIds = await getMessagedContactIds(
      contacts.map((c) => c.name),
    );
    const messagedSet = messagedIds;

    const totalContacts = contacts.length;
    const messagedCount = messagedSet.size;
    const unmessagedCount = totalContacts - messagedCount;

    const interviewCounts: Record<string, number> = {};
    let totalInterviews = 0;
    Object.entries(interviews).forEach(([memberId, cards]) => {
      interviewCounts[memberId] = cards.length;
      totalInterviews += cards.length;
    });

    const totalYouth = queue.length;
    const scheduledYouth = queue.filter((y) => y.scheduled).length;
    const now = Date.now();
    const overdueYouth = queue.filter(
      (y) => !y.scheduled && now - y.lastSeenAt > SIX_MONTHS_MS,
    ).length;
    const recentlyVisited = queue.filter(
      (y) => !y.scheduled && now - y.lastSeenAt <= SIX_MONTHS_MS,
    ).length;

    return NextResponse.json({
      messages: {
        total: totalContacts,
        messaged: messagedCount,
        unmessaged: unmessagedCount,
      },
      interviews: {
        total: totalInterviews,
        byMember: interviewCounts,
      },
      youth: {
        total: totalYouth,
        scheduled: scheduledYouth,
        overdue: overdueYouth,
        recentlyVisited,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return new NextResponse("Error fetching dashboard data", { status: 500 });
  }
}
