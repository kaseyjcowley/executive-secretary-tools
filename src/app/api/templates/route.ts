import { NextResponse } from "next/server";
import {
  getAllTemplates,
  saveTemplate,
  extractVariables,
} from "@/utils/template-loader";
import { Template } from "@/types/messages";
import { Category } from "@/types/messages";

export async function GET() {
  try {
    const templates = await getAllTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return new NextResponse("Error fetching templates", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: Partial<Template> = await request.json();

    if (!body.name || !body.content) {
      return NextResponse.json(
        { error: "Name and content are required" },
        { status: 400 },
      );
    }

    const id = body.id || body.name.toLowerCase().replace(/\s+/g, "-");

    const template: Template = {
      id,
      name: body.name,
      category: body.category || Category.interview,
      content: body.content,
      variables: extractVariables(body.content),
    };

    await saveTemplate(template);

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error creating template:", error);
    return new NextResponse("Error creating template", { status: 500 });
  }
}
