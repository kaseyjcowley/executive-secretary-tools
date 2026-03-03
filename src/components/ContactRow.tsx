"use client";

import { useMemo, useState } from "react";
import members from "@/data/members.json";
import { Contact, MessageType } from "@/types/messages";
import { useMemberSelection } from "@/hooks/useMemberSelection";
import {
  getAvailableMessageTypes,
  loadTemplateContent,
} from "@/utils/template-loader";
import { substituteTemplate } from "@/utils/template-substitution";
import { formatMemberDisplayNames } from "@/utils/format-member-display";
import { getBeforeOrAfterChurch } from "@/utils/time-utils";
import { format, isSunday, parse, startOfTomorrow } from "date-fns";
import { ContactInfo, ContactLabels } from "@/components/ContactInfo";
import { MemberSelector } from "@/components/MemberSelector";
import { TemplateSelector } from "@/components/TemplateSelector";
import { TimeSelector } from "@/components/TimeSelector";
import { MessagePreview } from "@/components/MessagePreview";

interface Props {
  contact: Contact;
  initialTemplateId?: string;
}

export const ContactRow = ({ contact, initialTemplateId }: Props) => {
  const [selectedTemplateId, setSelectedTemplateId] =
    useState(initialTemplateId);
  const [selectedTime, setSelectedTime] = useState("12:30");
  const { selectedMemberIds, addMember, removeMember, changeMember } =
    useMemberSelection(contact.name);
  const messageTypes = getAvailableMessageTypes();

  const categories: Record<string, MessageType[]> = useMemo(
    () => ({
      calling: messageTypes.filter((m) => m.category === "calling"),
      interview: messageTypes.filter((m) => m.category === "interview"),
    }),
    [messageTypes],
  );

  const selectedMembers = useMemo(
    () => members.filter((m) => selectedMemberIds.includes(m.id)),
    [selectedMemberIds],
  );

  const displayNames = useMemo(
    () => formatMemberDisplayNames(selectedMembers),
    [selectedMembers],
  );

  const nameVariable = displayNames.join(" & ");

  const phoneNumbers = useMemo(() => {
    return selectedMembers.map((m) => m.phone).filter((p): p is string => !!p);
  }, [selectedMembers]);

  const beforeOrAfterChurch = getBeforeOrAfterChurch(selectedTime);

  const templatePreview = selectedTemplateId
    ? substituteTemplate(loadTemplateContent(selectedTemplateId), {
        name: nameVariable,
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
        <div className="space-y-3 w-full">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <ContactInfo contact={contact} />
            <ContactLabels contact={contact} />
            <MemberSelector
              selectedMemberIds={selectedMemberIds}
              onAddMember={addMember}
              onRemoveMember={removeMember}
              onChangeMember={changeMember}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full">
            <TemplateSelector
              selectedTemplateId={selectedTemplateId}
              onChange={setSelectedTemplateId}
              categories={categories}
            />
            <TimeSelector
              selectedTime={selectedTime}
              onChange={setSelectedTime}
            />
          </div>
        </div>

        <MessagePreview
          templatePreview={templatePreview}
          phoneNumbers={phoneNumbers}
        />
      </div>
    </div>
  );
};
