"use client";

import { useState } from "react";
import { format } from "date-fns";
import { getClosestSunday } from "@/utils/dates";

export function InterviewsHeader() {
  const [closestSunday] = useState<Date | null>(() => getClosestSunday());

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
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
