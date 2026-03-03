import members from "@/data/members.json";
import { Select } from "@/components/ui/Select";
import { IconX } from "@/components/ui/Icons";

interface MemberSelectorProps {
  selectedMemberIds: number[];
  onAddMember: () => void;
  onRemoveMember: (index: number) => void;
  onChangeMember: (index: number, memberId: number | undefined) => void;
}

export function MemberSelector({
  selectedMemberIds,
  onAddMember,
  onRemoveMember,
  onChangeMember,
}: MemberSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {selectedMemberIds.map((memberId, index) => (
        <div key={index} className="flex items-center gap-1">
          <Select
            className="md:w-auto md:min-w-[200px]"
            value={memberId === -1 ? "" : memberId?.toString() || ""}
            onChange={(e) =>
              onChangeMember(
                index,
                e.target.value ? parseInt(e.target.value) : undefined,
              )
            }
          >
            <option value="" disabled>
              Select member (or verify fuzzy match)
            </option>
            {members
              .filter(
                (m) => !selectedMemberIds.includes(m.id) || m.id === memberId,
              )
              .map((member) => (
                <option
                  key={`${member.name}-${member.age}-${member.gender}`}
                  value={member.id.toString()}
                >
                  {member.name}
                </option>
              ))}
          </Select>
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
      ))}
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
