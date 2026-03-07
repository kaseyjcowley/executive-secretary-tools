export interface AppointmentSummary {
  singular: string;
  pluralRecipients: string;
  pluralSubjects: string;
  listFormat: string;
}

export const appointmentSummaries: Record<string, AppointmentSummary> = {
  "temple-visit": {
    singular: "your temple recommend expires at the end of this month",
    pluralRecipients: "your temple recommends expire at the end of this month",
    pluralSubjects: "their temple recommends expire at the end of this month",
    listFormat: "temple recommend renewal",
  },
  "temple-recommend-renewal": {
    singular: "your temple recommend expires at the end of this month",
    pluralRecipients: "your temple recommends expire at the end of this month",
    pluralSubjects: "their temple recommends expire at the end of this month",
    listFormat: "temple recommend renewal",
  },
  "bishop-interview": {
    singular: "you have a bishop interview scheduled",
    pluralRecipients: "you have bishop interviews scheduled",
    pluralSubjects: "they have bishop interviews scheduled",
    listFormat: "bishop interview",
  },
  "first-counselor-interview": {
    singular: "you have an interview with the first counselor scheduled",
    pluralRecipients: "you have interviews with the first counselor scheduled",
    pluralSubjects: "they have interviews with the first counselor scheduled",
    listFormat: "first counselor interview",
  },
  "second-counselor-interview": {
    singular: "you have an interview with the second counselor scheduled",
    pluralRecipients: "you have interviews with the second counselor scheduled",
    pluralSubjects: "they have interviews with the second counselor scheduled",
    listFormat: "second counselor interview",
  },
  "counselor-youth-interview": {
    singular: "you have a youth interview scheduled",
    pluralRecipients: "you have youth interviews scheduled",
    pluralSubjects: "they have youth interviews scheduled",
    listFormat: "youth interview",
  },
  "bishop-youth-interview": {
    singular: "you have a youth bishop interview scheduled",
    pluralRecipients: "you have youth bishop interviews scheduled",
    pluralSubjects: "they have youth bishop interviews scheduled",
    listFormat: "youth bishop interview",
  },
  "baptismal-interview": {
    singular: "you have a baptismal interview scheduled",
    pluralRecipients: "you have baptismal interviews scheduled",
    pluralSubjects: "they have baptismal interviews scheduled",
    listFormat: "baptismal interview",
  },
  "extend-calling": {
    singular: "we'd like to discuss extending your calling",
    pluralRecipients: "we'd like to discuss extending your callings",
    pluralSubjects: "we'd like to discuss extending their callings",
    listFormat: "calling extension",
  },
  "setting-apart": {
    singular: "you need to be set apart for your calling",
    pluralRecipients: "you need to be set apart for your callings",
    pluralSubjects: "they need to be set apart for their callings",
    listFormat: "setting apart",
  },
  "interview-reminder": {
    singular: "you have an appointment scheduled",
    pluralRecipients: "you have appointments scheduled",
    pluralSubjects: "they have appointments scheduled",
    listFormat: "appointment",
  },
  "welfare-meeting": {
    singular: "you have a welfare meeting scheduled",
    pluralRecipients: "you have welfare meetings scheduled",
    pluralSubjects: "they have welfare meetings scheduled",
    listFormat: "welfare meeting",
  },
  "family-council": {
    singular: "you have a family council scheduled",
    pluralRecipients: "you have family councils scheduled",
    pluralSubjects: "they have family councils scheduled",
    listFormat: "family council",
  },
  "follow-up": {
    singular: "we need to follow up on a previous conversation",
    pluralRecipients: "we need to follow up on previous conversations",
    pluralSubjects: "they need to follow up on previous conversations",
    listFormat: "follow-up",
  },
  "tithing-declaration": {
    singular: "it's time for your tithing declaration",
    pluralRecipients: "it's time for your tithing declarations",
    pluralSubjects: "it's time for their tithing declarations",
    listFormat: "tithing declaration",
  },
};
