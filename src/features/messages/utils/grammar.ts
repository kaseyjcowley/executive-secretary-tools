export function formatNameList(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  const allButLast = names.slice(0, -1).join(", ");
  return `${allButLast}, and ${names[names.length - 1]}`;
}

export function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}

export function getPossessiveForm(name: string): string {
  if (!name) return "";
  if (name.endsWith("s")) return `${name}'`;
  return `${name}'s`;
}

export function getPluralPossessiveForm(name: string): string {
  if (!name) return "";
  return `${name}'s`;
}

export function getPossessiveForNameList(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return getPossessiveForm(names[0]);

  const allButLast = names.slice(0, -1);
  const lastName = names[names.length - 1];

  let formattedLast: string;
  if (names.length >= 3) {
    formattedLast = getPluralPossessiveForm(lastName);
  } else {
    formattedLast = getPossessiveForm(lastName);
  }

  if (names.length === 2) {
    return `${allButLast[0]} and ${formattedLast}`;
  }

  const allButLastFormatted = allButLast.join(", ");
  return `${allButLastFormatted}, and ${formattedLast}`;
}

export function getPossessive(name: string): string {
  if (!name) return "";
  if (name.endsWith("s")) return `${name}'`;
  return `${name}'s`;
}

export function pluralize(word: string, count: number): string {
  if (count === 1) return word;
  if (word.endsWith("s") || word.endsWith("sh") || word.endsWith("ch")) {
    return `${word}es`;
  }
  return `${word}s`;
}

export function getPronoun(isRecipient: boolean, count: number): string {
  return isRecipient ? "your" : "their";
}

export function conjugateVerb(verb: string, count: number): string {
  if (count === 1) {
    if (
      verb.endsWith("s") ||
      verb.endsWith("sh") ||
      verb.endsWith("ch") ||
      verb.endsWith("x") ||
      verb.endsWith("z")
    ) {
      return `${verb}es`;
    }
    if (
      verb.endsWith("y") &&
      !["a", "e", "i", "o", "u"].includes(verb[verb.length - 2])
    ) {
      return `${verb.slice(0, -1)}ies`;
    }
    if (verb === "have") return "has";
    return `${verb}s`;
  }
  return verb;
}
