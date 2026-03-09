"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { getClosestSunday } from "@/utils/dates";
import { IconClock } from "@/components/ui/Icons";

export function InterviewsHeader() {
  const [closestSunday, setClosestSunday] = useState<Date | null>(null);

  useEffect(() => {
    setClosestSunday(getClosestSunday());
  }, []);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <IconClock className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold leading-none tracking-tight text-gray-900">
            Interviews for Sunday{" "}
            {closestSunday ? format(closestSunday, "MMM do, yyyy") : ""}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage interview schedules for Sunday
          </p>
        </div>
      </div>
    </div>
  );
}
