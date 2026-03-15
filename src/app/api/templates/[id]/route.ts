import { NextResponse } from "next/server";
import {
  getTemplate,
  saveTemplate,
  deleteTemplate,
  extractVariables,
} from "@/utils/template-loader";
import { Template } from "@/types/messages";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const template = await getTemplate(id);

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error fetching template:", error);
    return new NextResponse("Error fetching template", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: Partial<Template> = await request.json();

    const existing = await getTemplate(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    const template: Template = {
      id,
      name: body.name ?? existing.name,
      category: body.category ?? existing.category,
      content: body.content ?? existing.content,
      variables: body.content
        ? extractVariables(body.content)
        : existing.variables,
    };

    await saveTemplate(template);

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error updating template:", error);
    return new NextResponse("Error updating template", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const existing = await getTemplate(id);

    if (!existing) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    await deleteTemplate(id);

    return NextResponse.json({ message: "Template deleted" });
  } catch (error) {
    console.error("Error deleting template:", error);
    return new NextResponse("Error deleting template", { status: 500 });
  }
}
