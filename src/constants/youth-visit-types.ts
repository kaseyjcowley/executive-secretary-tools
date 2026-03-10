import type { VisitType } from "@/types/youth";

export const YOUTH_VISIT_TYPES: Record<string, VisitType> = {
  "bishop-youth-interview": {
    id: "bishop-youth-interview",
    name: "Bishop Youth Interview",
    automationCode: "BYI",
    description: "Annual bishop interview for youth",
  },
  "counselor-youth-interview": {
    id: "counselor-youth-interview",
    name: "Counselor Youth Interview",
    automationCode: "CYI",
    description: "Annual counselor interview for youth",
  },
  "ysa-interview": {
    id: "ysa-interview",
    name: "YSA Interview",
    automationCode: "YSAI",
    description: "Young single adult interview",
  },
  "temple-recommend-interview": {
    id: "temple-recommend-interview",
    name: "Temple Recommend Interview",
    automationCode: "TRI",
    description: "Temple recommend renewal interview",
  },
  other: {
    id: "other",
    name: "Other",
    automationCode: "",
    description: "General visit (no automation)",
  },
};

export const VISIT_TYPE_OPTIONS = Object.values(YOUTH_VISIT_TYPES);
