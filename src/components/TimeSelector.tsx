import { format, parse } from "date-fns";
import { Select } from "@/components/ui/Select";
import { BEFORE_CHURCH_TIMES, AFTER_CHURCH_TIMES } from "@/constants";

interface TimeSelectorProps {
  selectedTime: string;
  onChange: (time: string) => void;
}

export function TimeSelector({ selectedTime, onChange }: TimeSelectorProps) {
  return (
    <form className="w-full md:max-w-[9rem]">
      <Select
        value={selectedTime}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-[120px]"
        required
      >
        <optgroup label="Before church">
          {BEFORE_CHURCH_TIMES.map((time) => (
            <option key={time} value={time}>
              {format(parse(time, "HH:mm", new Date()), "h:mm a")}
            </option>
          ))}
        </optgroup>
        <optgroup label="After church">
          {AFTER_CHURCH_TIMES.map((time) => (
            <option key={time} value={time}>
              {format(parse(time, "HH:mm", new Date()), "h:mm a")}
            </option>
          ))}
        </optgroup>
      </Select>
    </form>
  );
}
