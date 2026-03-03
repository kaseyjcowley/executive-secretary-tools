import { format, parse } from "date-fns";
import { Select } from "@/components/ui/Select";
import { IconClock } from "@/components/ui/Icons";
import { BEFORE_CHURCH_TIMES, AFTER_CHURCH_TIMES } from "@/constants";

interface TimeSelectorProps {
  selectedTime: string;
  onChange: (time: string) => void;
}

export function TimeSelector({ selectedTime, onChange }: TimeSelectorProps) {
  return (
    <form className="w-full md:max-w-[8rem]">
      <div className="relative">
        <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
          <IconClock className="w-4 h-4 text-body" />
        </div>
        <Select
          id="time"
          className="pe-10"
          value={selectedTime}
          onChange={(e) => onChange(e.target.value)}
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
      </div>
    </form>
  );
}
