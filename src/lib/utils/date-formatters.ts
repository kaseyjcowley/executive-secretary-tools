import { format, isSunday, parse, startOfTomorrow } from "date-fns";

export function formatAppointmentDate(): string {
  return isSunday(startOfTomorrow()) ? "tomorrow" : "Sunday";
}

export function formatTimeForDisplay(time24: string): string {
  return format(parse(time24, "HH:mm", new Date()), "h:mm a");
}
