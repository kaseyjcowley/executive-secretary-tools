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
  const [selectedMemberId, setSelectedMemberId] = useState<
    number | undefined
  >();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState("12:00");
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
        <span className="md:ml-auto text-sm text-slate-700">{phoneNumber}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Template dropdown */}
        <select
          className="md:w-64 p-2 border border-slate-300 rounded text-slate-900"
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

        <form className="max-w-[8rem]">
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
              className="block w-full p-2.5 pe-10 bg-neutral-secondary-medium border border-default-medium border-slate-700 text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs text-slate-700"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
            >
              <option value="09:00">09:00</option>
              <option value="09:05">09:05</option>
              <option value="09:10">09:10</option>
              <option value="09:15">09:15</option>
              <option value="09:20">09:20</option>
              <option value="09:25">09:25</option>
              <option value="09:30">09:30</option>
              <option value="09:35">09:35</option>
              <option value="09:40">09:40</option>
              <option value="09:45">09:45</option>
              <option value="09:50">09:50</option>
              <option value="09:55">09:55</option>
              <option value="10:00">10:00</option>
              <option value="10:05">10:05</option>
              <option value="10:10">10:10</option>
              <option value="10:15">10:15</option>
              <option value="10:20">10:20</option>
              <option value="10:25">10:25</option>
              <option value="10:30">10:30</option>
              <option value="10:35">10:35</option>
              <option value="10:40">10:40</option>
              <option value="10:45">10:45</option>
              <option value="10:50">10:50</option>
              <option value="10:55">10:55</option>
              <option value="11:00">11:00</option>
              <option value="11:05">11:05</option>
              <option value="11:10">11:10</option>
              <option value="11:15">11:15</option>
              <option value="11:20">11:20</option>
              <option value="11:25">11:25</option>
              <option value="11:30">11:30</option>
              <option value="11:35">11:35</option>
              <option value="11:40">11:40</option>
              <option value="11:45">11:45</option>
              <option value="11:50">11:50</option>
              <option value="11:55">11:55</option>
              <option value="12:00">12:00</option>
              <option value="12:05">12:05</option>
              <option value="12:10">12:10</option>
              <option value="12:15">12:15</option>
              <option value="12:20">12:20</option>
              <option value="12:25">12:25</option>
              <option value="12:30">12:30</option>
              <option value="12:35">12:35</option>
              <option value="12:40">12:40</option>
              <option value="12:45">12:45</option>
              <option value="12:50">12:50</option>
              <option value="12:55">12:55</option>
              <option value="13:00">13:00</option>
              <option value="13:05">13:05</option>
              <option value="13:10">13:10</option>
              <option value="13:15">13:15</option>
              <option value="13:20">13:20</option>
              <option value="13:25">13:25</option>
              <option value="13:30">13:30</option>
              <option value="13:35">13:35</option>
              <option value="13:40">13:40</option>
              <option value="13:45">13:45</option>
              <option value="13:50">13:50</option>
              <option value="13:55">13:55</option>
              <option value="14:00">14:00</option>
            </select>
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
