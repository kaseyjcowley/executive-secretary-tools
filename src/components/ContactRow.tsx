"use client";

import { useState, useEffect } from "react";
import { Contact, MessageType } from "@/types/messages";
import {
  getAvailableMessageTypes,
  loadTemplateContent,
} from "@/utils/template-loader";
import { substituteTemplate } from "@/utils/template-substitution";
import { isSunday, startOfTomorrow } from "date-fns";
import members from "@/data/members.json";
import { matchContact, getPhoneById } from "@/utils/contact-fuzzy-match";

interface Props {
  contact: Contact;
  initialTemplateId?: string;
}

export const ContactRow = ({ contact, initialTemplateId }: Props) => {
  const [selectedTemplateId, setSelectedTemplateId] =
    useState(initialTemplateId);
  const [selectedMemberId, setSelectedMemberId] = useState<number | undefined>();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState("12:30");
  const messageTypes = getAvailableMessageTypes();

  // Fuzzy match and pre-select member on mount
  useEffect(() => {
    const matchedId = matchContact(contact.name);
    setSelectedMemberId(matchedId);
  }, [contact.name]);

  // Look up phone number when member ID changes
  useEffect(() => {
    if (selectedMemberId !== undefined) {
      const phone = getPhoneById(selectedMemberId);
      setPhoneNumber(phone || "---");
    } else {
      setPhoneNumber("---");
    }
  }, [selectedMemberId]);

  // Group message types by category
  const categories: Record<string, MessageType[]> = {
    calling: messageTypes.filter((m) => m.category === "calling"),
    interview: messageTypes.filter((m) => m.category === "interview"),
  };

  // Compute template preview with variable substitution
  const templatePreview = selectedTemplateId
    ? substituteTemplate(loadTemplateContent(selectedTemplateId), {
        name: contact.name,
        appointmentType:
          contact.kind === "calling" ? contact.calling : contact.labels?.name,
        date: isSunday(startOfTomorrow()) ? "tomorrow" : "Sunday",
        // TODO: Remove hard-coded
        "before-or-after-church": "after church",
        time: selectedTime,
      })
    : "";

  return (
    <div className="border border-slate-300 p-4 space-y-3">
      {/* Contact info section */}
      <div className="flex flex-col md:flex-row md:items-center">
        <span className="font-semibold text-slate-900">
          {contact.kind === "calling"
            ? `${contact.name} as ${contact.calling}`
            : contact.name}
        </span>
        {"labels" in contact && contact.labels?.name && (
          <span className="md:ml-2 text-sm text-slate-600">
            {contact.labels.name}
          </span>
        )}
        <select
          className="md:ml-4 p-2 border border-slate-300 rounded text-slate-900 text-sm"
          value={selectedMemberId?.toString() || ""}
          onChange={(e) => setSelectedMemberId(e.target.value ? parseInt(e.target.value) : undefined)}
        >
          <option value="" disabled>
            Select member (or verify fuzzy match)
          </option>
          {members.map((member) => (
            <option key={`${member.name}-${member.age}-${member.gender}`} value={member.id.toString()}>
              {member.name}
            </option>
          ))}
        </select>
        <span className="md:ml-auto text-sm text-slate-700">{phoneNumber}</span>
      </div>

      <div className="flex items-center">
        {/* Template dropdown */}
        <select
          className="w-full md:w-64 p-2 border border-slate-300 rounded text-slate-900"
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

        <form className="max-w-[8rem] mx-auto">
          <label
            htmlFor="time"
            className="block mb-2 text-sm font-medium text-heading text-slate-700"
          >
            Select time:
          </label>
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
            <input
              type="time"
              id="time"
              className="block w-full p-2.5 bg-neutral-secondary-medium border border-default-medium border-slate-700 text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body text-slate-700"
              min="09:00"
              max="18:00"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
            />
          </div>
        </form>
      </div>

      {/* Template preview section */}
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
  );
};
