export enum Category {
  calling = "calling",
  interview = "interview",
}

export interface Template {
  id: string;
  name: string;
  category: Category;
  content: string;
  variables: string[];
}
