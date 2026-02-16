"use client";

import { useState } from "react";
import { Contact, TemplateVariables } from "@/types/messages";
import {
  getAvailableMessageTypes,
  loadTemplateContent,
  MessageType,
} from "@/utils/template-loader";
import { substituteTemplate } from "@/utils/templates";

interface Props {
  contact: Contact;
  initialTemplateId?: string;
}

export const ContactRow = ({ contact, initialTemplateId }: Props) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId);
  const messageTypes = getAvailableMessageTypes();

  // Group message types by category
  const categories: Record<string, MessageType[]> = {
    calling: messageTypes.filter((m) => m.category === "calling"),
    interview: messageTypes.filter((m) => m.category === "interview"),
    temple: messageTypes.filter((m) => m.category === "temple"),
    welfare: messageTypes.filter((m) => m.category === "welfare"),
    family: messageTypes.filter((m) => m.category === "family"),
    "follow-up": messageTypes.filter((m) => m.category === "follow-up"),
  };

  // Compute template preview with variable substitution
  const templatePreview = selectedTemplateId
    ? substituteTemplate(
        loadTemplateContent(selectedTemplateId),
        {
          name: contact.name,
          appointmentType:
            contact.kind === "calling"
              ? contact.calling
              : contact.labels?.name,
        } as TemplateVariables
      )
    : "";

  return (
    <div className="border border-slate-300 p-4 space-y-3">
      {/* Contact info section */}
      <div className="flex flex-col md:flex-row md:items-center">
        <span className="font-semibold text-slate-900">{contact.name}</span>
        {"labels" in contact && contact.labels?.name && (
          <span className="md:ml-2 text-sm text-slate-600">
            {contact.labels.name}
          </span>
        )}
        <span className="md:ml-auto text-sm text-slate-700">---</span>
      </div>

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
            <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>

      {/* Template preview section */}
      {templatePreview ? (
        <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-800 whitespace-pre-wrap text-sm">
          {templatePreview}
        </div>
      ) : (
        <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-500 italic text-sm">
          Select a template to preview the message
        </div>
      )}
    </div>
  );
};
