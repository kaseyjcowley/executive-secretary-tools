import { getTemplates } from "@/app/actions/templates";
import { TemplatesPageClient } from "./TemplatesPageClient";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return <TemplatesPageClient initialTemplates={templates} />;
}
