export interface AppointmentSummary {
  singular: string;
  pluralSubjects: string;
  pluralOther: string;
}

export const appointmentSummaries: Record<string, AppointmentSummary> = {
  "temple-visit": {
    singular: "your temple recommend expires at the end of this month",
    pluralSubjects: "your temple recommends expire at the end of this month",
    pluralOther: "their temple recommends expire at the end of this month",
  },
  "temple-recommend-renewal": {
    singular: "your temple recommend expires at the end of this month",
    pluralSubjects: "your temple recommends expire at the end of this month",
    pluralOther: "their temple recommends expire at the end of this month",
  },
  "bishop-interview": {
    singular: "you have a bishop interview scheduled",
    pluralSubjects: "you have bishop interviews scheduled",
    pluralOther: "they have bishop interviews scheduled",
  },
  "first-counselor-interview": {
    singular: "you have an interview with the first counselor scheduled",
    pluralSubjects: "you have interviews with the first counselor scheduled",
    pluralOther: "they have interviews with the first counselor scheduled",
  },
  "second-counselor-interview": {
    singular: "you have an interview with the second counselor scheduled",
    pluralSubjects: "you have interviews with the second counselor scheduled",
    pluralOther: "they have interviews with the second counselor scheduled",
  },
  "counselor-youth-interview": {
    singular: "you have a youth interview scheduled",
    pluralSubjects: "you have youth interviews scheduled",
    pluralOther: "they have youth interviews scheduled",
  },
  "bishop-youth-interview": {
    singular: "you have a youth bishop interview scheduled",
    pluralSubjects: "you have youth bishop interviews scheduled",
    pluralOther: "they have youth bishop interviews scheduled",
  },
  "baptismal-interview": {
    singular: "you have a baptismal interview scheduled",
    pluralSubjects: "you have baptismal interviews scheduled",
    pluralOther: "they have baptismal interviews scheduled",
  },
  "extend-calling": {
    singular: "we'd like to discuss extending your calling",
    pluralSubjects: "we'd like to discuss extending your callings",
    pluralOther: "we'd like to discuss extending their callings",
  },
  "setting-apart": {
    singular: "you need to be set apart for your calling",
    pluralSubjects: "you need to be set apart for your callings",
    pluralOther: "they need to be set apart for their callings",
  },
  "interview-reminder": {
    singular: "you have an appointment scheduled",
    pluralSubjects: "you have appointments scheduled",
    pluralOther: "they have appointments scheduled",
  },
  "welfare-meeting": {
    singular: "you have a welfare meeting scheduled",
    pluralSubjects: "you have welfare meetings scheduled",
    pluralOther: "they have welfare meetings scheduled",
  },
  "family-council": {
    singular: "you have a family council scheduled",
    pluralSubjects: "you have family councils scheduled",
    pluralOther: "they have family councils scheduled",
  },
  "follow-up": {
    singular: "we need to follow up on a previous conversation",
    pluralSubjects: "we need to follow up on previous conversations",
    pluralOther: "they need to follow up on previous conversations",
  },
  "tithing-declaration": {
    singular: "it's time for your tithing declaration",
    pluralSubjects: "it's time for your tithing declarations",
    pluralOther: "it's time for their tithing declarations",
  },
};
