import members from "@/data/members.json";
import { TypeAhead, TypeAheadOption } from "@/components/ui/TypeAhead";
import { IconX } from "@/components/ui/Icons";

interface MemberSelectorProps {
  selectedMemberIds: number[];
  onAddMember: () => void;
  onRemoveMember: (index: number) => void;
  onChangeMember: (index: number, memberId: number | undefined) => void;
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
}: MemberSelectorProps) {
  const availableMembers = memberData.filter(
    (m) => !selectedMemberIds.includes(m.id) || m.id === selectedMemberIds[0],
  );

  const memberOptions: TypeAheadOption[] = availableMembers.map((member) => ({
    value: member.id.toString(),
    label: member.name,
  }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {selectedMemberIds.map((memberId, index) => {
        const selectedMember = memberData.find((m) => m.id === memberId);
        const selectedOption = selectedMember
          ? { value: selectedMember.id.toString(), label: selectedMember.name }
          : null;

        return (
          <div key={index} className="flex items-center gap-1">
            <div className="w-full md:w-auto md:min-w-[200px]">
              <TypeAhead
                options={memberOptions}
                value={selectedOption}
                onChange={(option) =>
                  onChangeMember(
                    index,
                    option ? parseInt(option.value, 10) : undefined,
                  )
                }
                placeholder="Select member (or verify fuzzy match)"
                menuPlacement="auto"
              />
            </div>
            {index > 0 && (
              <button
                type="button"
                onClick={() => onRemoveMember(index)}
                className="text-slate-500 hover:text-red-600 p-0.5"
                aria-label="Remove member"
              >
                <IconX />
              </button>
            )}
          </div>
        );
      })}
      {selectedMemberIds.length < 2 && (
        <button
          type="button"
          onClick={onAddMember}
          className="self-stretch px-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded border border-slate-300 text-lg leading-none flex items-center justify-center"
          aria-label="Add another recipient"
        >
          +
        </button>
      )}
    </div>
  );
}
