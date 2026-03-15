"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";

interface DashboardData {
  messages: {
    total: number;
    messaged: number;
    unmessaged: number;
  };
  interviews: {
    total: number;
    byMember: Record<string, number>;
  };
  youth: {
    total: number;
    scheduled: number;
    overdue: number;
    recentlyVisited: number;
  };
  lastUpdated: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard");
      }
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError("Failed to load dashboard");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error || "Failed to load dashboard"}</p>
          <button
            onClick={fetchDashboard}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
            color="blue"
          />
          <StatCard
            title="Interviews"
            value={data.interviews.total}
            icon="📅"
            href="/interviews"
            color="purple"
          />
          <StatCard
            title="Youth Visits Due"
            value={data.youth.overdue}
            total={data.youth.total}
            icon="👦"
            href="/youth"
            color="yellow"
          />
          <StatCard
            title="Scheduled"
            value={data.youth.scheduled}
            icon="📅"
            href="/youth"
            color="green"
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Last updated: {format(new Date(data.lastUpdated), "h:mm a")}
            </span>
            <button
              onClick={fetchDashboard}
              className="text-blue-600 hover:text-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
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
  color: "blue" | "purple" | "yellow" | "green";
}) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    purple: "bg-purple-50 border-purple-200",
    yellow: "bg-yellow-50 border-yellow-200",
    green: "bg-green-50 border-green-200",
  };

  const textColorClasses = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    yellow: "text-yellow-600",
    green: "text-green-600",
  };

  return (
    <Link
      href={href}
      className={`block p-4 rounded-lg border ${colorClasses[color]} hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`font-medium ${textColorClasses[color]}`}>
          {title}
        </span>
      </div>
      <div className="text-3xl font-bold text-gray-900">
        {value}
        {total !== undefined && (
          <span className="text-lg font-normal text-gray-500">/{total}</span>
        )}
      </div>
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
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all min-h-[100px]"
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-700 text-center">
        {label}
      </span>
    </Link>
  );
}
