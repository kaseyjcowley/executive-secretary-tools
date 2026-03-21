import { format } from "date-fns";
import Link from "next/link";
import type { Metadata } from "next";

import { Card, CardBody } from "@/components/ui";

import { getQueue } from "@/utils/youth-queue";
import {
  fetchAllCardsGroupedByMember,
  getAppointmentContacts,
} from "@/requests/cards";
import { getMessagedContactIds } from "@/utils/get-messaged-contacts";

const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

async function getDashboardData() {
  const [contacts, interviews, queue] = await Promise.all([
    getAppointmentContacts(),
    fetchAllCardsGroupedByMember(),
    getQueue(),
  ]);

  const messagedIds = await getMessagedContactIds(contacts.map((c) => c.name));
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

  return {
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
  };
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Executive Secretary Tools - Dashboard",
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{getGreeting()}!</h1>
        <p className="text-gray-600 mt-1">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </header>

      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Pending Messages"
            value={data.messages.unmessaged}
            total={data.messages.total}
            icon="📬"
            href="/messages"
            color="primary"
          />
          <StatCard
            title="Interviews"
            value={data.interviews.total}
            icon="📅"
            href="/interviews"
            color="secondary"
          />
          <StatCard
            title="Youth Visits Due"
            value={data.youth.overdue}
            total={data.youth.total}
            icon="👦"
            href="/youth"
            color="warning"
          />
          <StatCard
            title="Scheduled"
            value={data.youth.scheduled}
            icon="📅"
            href="/youth"
            color="success"
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickActionButton href="/messages" label="Send Messages" icon="📬" />
          <QuickActionButton href="/interviews" label="Interviews" icon="📅" />
          <QuickActionButton href="/youth" label="Youth Queue" icon="👦" />
          <QuickActionButton href="/conductors" label="Conductors" icon="🎵" />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Pages</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <NavLink href="/messages" label="Messages" icon="📬" />
          <NavLink href="/interviews" label="Interviews" icon="📅" />
          <NavLink href="/youth" label="Youth" icon="👦" />
          <NavLink href="/conductors" label="Conductors" icon="🎵" />
          <NavLink href="/youth/new" label="New Youth" icon="➕" />
          <NavLink href="/youth/import" label="Import Youth" icon="📥" />
        </div>
      </section>

      <section className="mb-8">
        <Card compact>
          <CardBody>
            <div className="flex items-center justify-between text-sm opacity-60">
              <span>
                Last updated: {format(new Date(data.lastUpdated), "h:mm a")}
              </span>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  total,
  icon,
  href,
  color,
}: {
  title: string;
  value: number;
  total?: number;
  icon: string;
  href: string;
  color: "primary" | "secondary" | "warning" | "success";
}) {
  return (
    <Link href={href} className="h-full">
      <Card
        accentColor={color}
        className="hover:shadow-md transition-shadow cursor-pointer h-full"
      >
        <CardBody className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{icon}</span>
            <span className="font-medium">{title}</span>
          </div>
          <div className="text-3xl font-bold mt-auto">
            {value}
            {total !== undefined && (
              <span className="text-lg font-normal opacity-60">/{total}</span>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

function QuickActionButton({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link href={href}>
      <Card
        compact
        className="hover:shadow-md transition-all cursor-pointer min-h-[100px] flex items-center justify-center"
      >
        <CardBody className="flex flex-col items-center justify-center p-0">
          <span className="text-2xl mb-2">{icon}</span>
          <span className="text-sm font-medium text-center">{label}</span>
        </CardBody>
      </Card>
    </Link>
  );
}

function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link href={href}>
      <Card compact className="hover:shadow-md transition-all cursor-pointer">
        <CardBody className="flex items-center gap-3 p-3">
          <span className="text-xl">{icon}</span>
          <span className="text-sm font-medium">{label}</span>
        </CardBody>
      </Card>
    </Link>
  );
}
