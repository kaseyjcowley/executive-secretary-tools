import { parse, isBefore } from "date-fns";
import { CHURCH_END_TIME } from "@/constants";

export function getBeforeOrAfterChurch(
  selectedTime: string,
  churchEndTime: string = CHURCH_END_TIME,
): "before church" | "after church" {
  const endTimeDate = parse(churchEndTime, "HH:mm", new Date());
  const selectedTimeDate = parse(selectedTime, "HH:mm", new Date());
  return isBefore(selectedTimeDate, endTimeDate)
    ? "before church"
    : "after church";
}
