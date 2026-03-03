"use client";

import { useEffect, useMemo, useState } from "react";
import members from "@/data/members.json";
import { Contact, MessageType } from "@/types/messages";
import { matchContact } from "@/utils/contact-fuzzy-match";
import {
  getAvailableMessageTypes,
  loadTemplateContent,
} from "@/utils/template-loader";
import { substituteTemplate } from "@/utils/template-substitution";
import { format, isSunday, isBefore, parse, startOfTomorrow } from "date-fns";

interface Props {
  contact: Contact;
  initialTemplateId?: string;
}

export const ContactRow = ({ contact, initialTemplateId }: Props) => {
  const [selectedTemplateId, setSelectedTemplateId] =
    useState(initialTemplateId);
  const [selectedMemberId, setSelectedMemberId] = useState<
    number | undefined
  >();
  const [selectedTime, setSelectedTime] = useState("12:00");
  const messageTypes = getAvailableMessageTypes();

  // Fuzzy match and pre-select member on mount
  useEffect(() => {
    const matchedId = matchContact(contact.name);
    setSelectedMemberId(matchedId);
  }, [contact.name]);

  // Group message types by category
  const categories: Record<string, MessageType[]> = {
    calling: messageTypes.filter((m) => m.category === "calling"),
    interview: messageTypes.filter((m) => m.category === "interview"),
  };

  const selectedMember = useMemo(
    () => members.find((m) => m.id === selectedMemberId),
    [selectedMemberId],
  );
  const prefix =
    selectedMember?.gender === "M"
      ? "Brother"
      : selectedMember?.gender === "F"
        ? "Sister"
        : "";
  const lastName = contact.name.split(" ").slice(-1)[0];
  const displayName = prefix ? `${prefix} ${lastName}` : contact.name;

  // Compute template preview with variable substitution
  const churchEndTime = parse("12:30", "HH:mm", new Date());
  const selectedTimeDate = parse(selectedTime, "HH:mm", new Date());
  const beforeOrAfterChurch = isBefore(selectedTimeDate, churchEndTime)
    ? "before church"
    : "after church";

  const templatePreview = selectedTemplateId
    ? substituteTemplate(loadTemplateContent(selectedTemplateId), {
        name: displayName,
        appointmentType:
          contact.kind === "calling" ? contact.calling : contact.labels?.name,
        date: isSunday(startOfTomorrow()) ? "tomorrow" : "Sunday",
        "before-or-after-church": beforeOrAfterChurch,
        time: format(parse(selectedTime, "HH:mm", new Date()), "h:mm a"),
      })
    : "";

  return (
    <div className="border border-slate-300 p-4 overflow-hidden">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Left column: form fields */}
        <div className="space-y-3 w-full">
          {/* Contact info section */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <span className="font-semibold text-slate-900 break-words">
              {contact.kind === "calling"
                ? `${contact.name} as ${contact.calling}`
                : contact.name}
            </span>
            {"labels" in contact && contact.labels?.name && (
              <span className="text-sm text-slate-600">
                {contact.labels.name}
              </span>
            )}
            <select
              className="w-full md:w-auto md:min-w-[200px] p-2 border border-slate-300 rounded text-slate-900 text-sm"
              value={selectedMemberId?.toString() || ""}
              onChange={(e) =>
                setSelectedMemberId(
                  e.target.value ? parseInt(e.target.value) : undefined,
                )
              }
            >
              <option value="" disabled>
                Select member (or verify fuzzy match)
              </option>
              {members.map((member) => (
                <option
                  key={`${member.name}-${member.age}-${member.gender}`}
                  value={member.id.toString()}
                >
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full">
            {/* Template dropdown */}
            <select
              className="w-full md:w-64 p-2 border border-slate-300 rounded text-slate-900 text-sm"
              value={selectedTemplateId || ""}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
            >
              <option value="" disabled>
                Select message type
              </option>

              {Object.entries(categories).map(([category, types]) => {
                if (types.length === 0) return null;
                return (
                  <optgroup
                    key={category}
                    label={category.charAt(0).toUpperCase() + category.slice(1)}
                  >
                    {types.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>

            <form className="w-full md:max-w-[8rem]">
              <div className="relative">
                <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-body"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <select
                  id="time"
                  className="block w-full p-2.5 pe-10 border border-slate-300 text-sm rounded focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                >
                  <optgroup label="Before church">
                    <option value="09:00">9:00 am</option>
                    <option value="09:05">9:05 am</option>
                    <option value="09:10">9:10 am</option>
                    <option value="09:15">9:15 am</option>
                    <option value="09:20">9:20 am</option>
                    <option value="09:25">9:25 am</option>
                    <option value="09:30">9:30 am</option>
                    <option value="09:35">9:35 am</option>
                    <option value="09:40">9:40 am</option>
                    <option value="09:45">9:45 am</option>
                    <option value="09:50">9:50 am</option>
                    <option value="09:55">9:55 am</option>
                    <option value="10:00">10:00 am</option>
                    <option value="10:05">10:05 am</option>
                    <option value="10:10">10:10 am</option>
                    <option value="10:15">10:15 am</option>
                    <option value="10:20">10:20 am</option>
                    <option value="10:25">10:25 am</option>
                  </optgroup>
                  <optgroup label="After church">
                    <option value="12:30">12:30 pm</option>
                    <option value="12:35">12:35 pm</option>
                    <option value="12:40">12:40 pm</option>
                    <option value="12:45">12:45 pm</option>
                    <option value="12:50">12:50 pm</option>
                    <option value="12:55">12:55 pm</option>
                    <option value="13:00">1:00 pm</option>
                    <option value="13:05">1:05 pm</option>
                    <option value="13:10">1:10 pm</option>
                    <option value="13:15">1:15 pm</option>
                    <option value="13:20">1:20 pm</option>
                    <option value="13:25">1:25 pm</option>
                    <option value="13:30">1:30 pm</option>
                    <option value="13:35">1:35 pm</option>
                    <option value="13:40">1:40 pm</option>
                    <option value="13:45">1:45 pm</option>
                    <option value="13:50">1:50 pm</option>
                    <option value="13:55">1:55 pm</option>
                    <option value="14:00">2:00 pm</option>
                  </optgroup>
                </select>
              </div>
            </form>
          </div>
        </div>

        {/* Right column: template preview */}
        <div className="w-full md:w-[30rem] md:flex-shrink-0">
          {templatePreview ? (
            <div
              className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-800 whitespace-pre-wrap text-sm"
              dangerouslySetInnerHTML={{
                __html: templatePreview.replace(/\\n/g, "<br />"),
              }}
            />
          ) : (
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-500 italic text-sm">
              Select a template to preview the message
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
