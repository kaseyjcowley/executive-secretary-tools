export interface Member {
  id: number;
  name: string;
  age: number;
  gender: "M" | "F" | string;
  phone: string;
}

export function formatMemberDisplayNames(members: Member[]): string[] {
  if (members.length === 0) return [];

  const lastNames = members.map((m) => m.name.split(",")[0]);
  const allSameLastName =
    lastNames.length > 1 && lastNames.every((ln) => ln === lastNames[0]);

  if (allSameLastName) {
    const sortedMembers = [...members].sort((a, b) => {
      if (a.gender === "M" && b.gender !== "M") return -1;
      if (a.gender !== "M" && b.gender === "M") return 1;
      return 0;
    });
    const prefix = sortedMembers
      .map((m) =>
        m.gender === "M" ? "Brother" : m.gender === "F" ? "Sister" : "",
      )
      .filter(Boolean)
      .join(" & ");
    return prefix ? [`${prefix} ${lastNames[0]}`] : members.map((m) => m.name);
  }

  return members.map((member) => {
    const prefix =
      member.gender === "M" ? "Brother" : member.gender === "F" ? "Sister" : "";
    const lastName = member.name.split(",")[0];
    return prefix ? `${prefix} ${lastName}` : member.name;
  });
}
