const Fuse = require("fuse.js");
const members = require("../src/data/members.json");

function nameGetFn(obj) {
  const name = (obj && obj.name) || "";
  if (!name.includes(",")) return name;
  const parts = name
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 2) return name;
  const last = parts[0];
  const rest = parts.slice(1).join(" ");
  return `${rest} ${last}`.trim();
}

const fuse = new Fuse(members, {
  keys: [{ name: "name", getFn: nameGetFn }],
  threshold: 0.4,
  includeScore: true,
});

function matchContact(name) {
  if (!fuse || !name || typeof name !== "string") return undefined;
  try {
    console.log("matchContact called for:", name);
    const results = fuse.search(name);
    console.log("results length", results.length);
    results.forEach((r, i) => {
      console.log(
        i,
        "score=",
        r.score,
        "id=",
        r.item.id,
        "name=",
        r.item.name,
        "phone=",
        r.item.phone,
      );
    });
    if (results.length === 0) return undefined;
    const bestMatch = results[0];

    if (
      bestMatch.score !== undefined &&
      bestMatch.score < 0.4 &&
      bestMatch.item.phone
    ) {
      console.log("bestMatch accepted", bestMatch.item.id);
      return bestMatch.item.id;
    }

    // Fallback last-name match
    try {
      const normalize = (s) => s.trim().toLowerCase();
      const inputLast = normalize(
        name.includes(",")
          ? name.split(",")[0]
          : name.split(" ").slice(-1)[0] || name,
      );
      const candidateName = bestMatch.item.name;
      const candidateLast = normalize(
        candidateName.includes(",")
          ? candidateName.split(",")[0]
          : candidateName.split(" ").slice(-1)[0] || candidateName,
      );
      console.log("inputLast", inputLast, "candidateLast", candidateLast);
      if (
        inputLast &&
        candidateLast &&
        inputLast === candidateLast &&
        bestMatch.item.phone
      ) {
        console.log("fallback accepted", bestMatch.item.id);
        return bestMatch.item.id;
      }
    } catch (err) {
      console.error("fallback error", err);
    }

    return undefined;
  } catch (err) {
    console.error("fuse error", err);
    return undefined;
  }
}

const name = process.argv[2] || "Jaxson Held";
console.log("Searching for:", name);
const id = matchContact(name);
console.log("Matched id:", id);
