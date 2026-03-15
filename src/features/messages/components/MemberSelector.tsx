import members from "@/data/members.json";
import { TypeAhead, TypeAheadOption } from "@/components/ui/TypeAhead";
import { IconX, IconPlus } from "@/components/ui/Icons";

interface MemberSelectorProps {
  selectedMemberIds: number[];
  onAddMember: () => void;
  onRemoveMember: (index: number) => void;
  onChangeMember: (index: number, memberId: number | undefined) => void;
  maxMembers?: number;
}

interface Member {
  id: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
}

const memberData = members as Member[];

export function MemberSelector({
  selectedMemberIds,
  onAddMember,
  onRemoveMember,
  onChangeMember,
  maxMembers = 2,
}: MemberSelectorProps) {
  const availableMembers = memberData.filter(
    (m) => !selectedMemberIds.includes(m.id) || m.id === selectedMemberIds[0],
  );

  const memberOptions: TypeAheadOption[] = availableMembers.map((member) => ({
    value: member.id.toString(),
    label: member.name,
  }));

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
      {selectedMemberIds.map((memberId, index) => {
        const selectedMember = memberData.find((m) => m.id === memberId);
        const selectedOption = selectedMember
          ? { value: selectedMember.id.toString(), label: selectedMember.name }
          : null;

        return (
          <div key={index} className="flex items-center gap-1">
            <div className="w-full sm:w-auto min-w-[200px]">
              <TypeAhead
                instanceId={`member-select-${index}`}
                options={memberOptions}
                value={selectedOption}
                onChange={(option) =>
                  onChangeMember(
                    index,
                    option ? parseInt(option.value, 10) : undefined,
                  )
                }
                placeholder="Select member"
                menuPlacement="auto"
              />
            </div>
            {index > 0 && (
              <button
                type="button"
                onClick={() => onRemoveMember(index)}
                className="p-2 md:p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200 min-w-[44px] min-h-[44px] md:min-w-auto md:min-h-auto"
                aria-label="Remove member"
              >
                <IconX className="w-5 h-5 md:w-4 md:h-4" />
              </button>
            )}
          </div>
        );
      })}
      {selectedMemberIds.length < maxMembers && (
        <button
          type="button"
          onClick={onAddMember}
          className="self-stretch px-4 py-2 md:px-3 md:py-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-300 hover:border-blue-300 text-base md:text-sm font-medium flex items-center justify-center gap-1.5 transition-all duration-200 min-h-[44px]"
          aria-label="Add another recipient"
        >
          <IconPlus className="w-5 h-5 md:w-4 md:h-4" />
          <span className="md:hidden">Add Member</span>
          <span className="hidden md:inline">Add</span>
        </button>
      )}
    </div>
  );
}
