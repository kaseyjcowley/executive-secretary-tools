import { flushRedis } from "../redis";
import { youth, YouthOptions, VisitOptions } from "./youth";
import { templates, TemplateInput } from "./templates";
import { conductors, type Conductor } from "./conductors";
import { contacts } from "./contacts";

export const seed = {
  youth: {
    single: (name: string, options?: YouthOptions) => youth.single(name, options),
    queue: (items: Array<{ name: string; options?: YouthOptions }>) => youth.queue(items),
    withVisits: (name: string, visits: VisitOptions[]) => youth.withVisits(name, visits),
    getById: (id: string) => youth.getById(id),
    getQueue: () => youth.getQueue(),
  },
  
  templates: {
    single: (input: TemplateInput) => templates.single(input),
    list: (inputs: TemplateInput[]) => templates.list(inputs),
    category: (category: "calling" | "interview", inputs: TemplateInput[]) => 
      templates.category(category, inputs),
    getById: (id: string) => templates.getById(id),
    getAll: () => templates.getAll(),
  },
  
  conductors: {
    rotation: (conductorsList: Conductor[]) => conductors.rotation(conductorsList),
    index: (index: number) => conductors.index(index),
    override: (conductor: Conductor, reason: string) => conductors.override(conductor, reason),
    clearOverride: () => conductors.clearOverride(),
    getCurrentIndex: () => conductors.getCurrentIndex(),
    getRotation: () => conductors.getRotation(),
    getOverride: () => conductors.getOverride(),
  },
  
  contacts: {
    messaged: (contactIds: string[]) => contacts.messaged(contactIds),
    unmark: (contactIds: string[]) => contacts.unmark(contactIds),
    isMessaged: (contactId: string) => contacts.isMessaged(contactId),
    getMessaged: () => contacts.getMessaged(),
  },
  
  flush: () => flushRedis(),
};
