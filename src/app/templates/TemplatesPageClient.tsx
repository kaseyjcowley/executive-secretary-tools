"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Card, Button, Input, Textarea, Radio } from "@/components/ui";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { Template } from "@/types/messages";
import { Category } from "@/types/messages";
import {
  createTemplate,
  updateTemplate,
  removeTemplate,
} from "@/app/actions/templates";

interface Props {
  initialTemplates: Template[];
}

export function TemplatesPageClient({ initialTemplates }: Props) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    templateId: string | null;
    templateName: string;
  }>({ isOpen: false, templateId: null, templateName: "" });

  const [formData, setFormData] = useState({
    name: "",
    category: Category.interview as Category,
    content: "",
  });

  const [previewData, setPreviewData] = useState<Record<string, string>>({});

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      content: template.content,
    });
    const initialPreview: Record<string, string> = {};
    template.variables.forEach((v) => {
      initialPreview[v] = getSampleValue(v);
    });
    setPreviewData(initialPreview);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({ name: "", category: Category.interview, content: "" });
    setPreviewData({});
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.content) {
      toast.error("Name and content are required");
      return;
    }

    try {
      let result;
      if (editingTemplate) {
        result = await updateTemplate(editingTemplate.id, formData);
      } else {
        result = await createTemplate(formData);
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(editingTemplate ? "Template updated" : "Template created");
      setEditingTemplate(null);
      setIsCreating(false);
      startTransition(async () => {
        const { getTemplates } = await import("@/app/actions/templates");
        const data = await getTemplates();
        setTemplates(data);
      });
    } catch (error) {
      toast.error("Failed to save template");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.templateId) return;

    try {
      const result = await removeTemplate(deleteModal.templateId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Template deleted");
      setDeleteModal({ isOpen: false, templateId: null, templateName: "" });
      startTransition(async () => {
        const { getTemplates } = await import("@/app/actions/templates");
        const data = await getTemplates();
        setTemplates(data);
      });
    } catch (error) {
      toast.error("Failed to delete template");
      console.error(error);
    }
  };

  const getSampleValue = (variable: string): string => {
    const samples: Record<string, string> = {
      recipients: "John and Jane",
      withWhom: "Bishop Ryan",
      time: "12:30 PM",
      date: "Sunday",
      subjects: "Tom and Sally",
    };
    return samples[variable] || `[${variable}]`;
  };

  const getPreview = () => {
    let content = formData.content;
    Object.entries(previewData).forEach(([key, value]) => {
      content = content.replace(new RegExp(`\\{${key}\\}`, "g"), value);
      content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    });
    return content;
  };

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const callingTemplates = filteredTemplates.filter(
    (t) => t.category === Category.calling,
  );
  const interviewTemplates = filteredTemplates.filter(
    (t) => t.category === Category.interview,
  );

  return (
    <div className="container mx-auto px-0 py-8 max-w-4xl">
      <div className="bg-base-100 border border-base-300 rounded-lg shadow-sm mx-0 -mx-4 md:mx-auto md:px-6 px-4 p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Message Templates
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage message templates for interviews and callings
          </p>
        </div>

        {!editingTemplate && !isCreating && (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button variant="primary" onClick={handleCreate}>
                + New Template
              </Button>
            </div>

            {callingTemplates.length > 0 && (
              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Calling
                </h3>
                <div className="space-y-2">
                  {callingTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onEdit={() => handleEdit(template)}
                      onDelete={() =>
                        setDeleteModal({
                          isOpen: true,
                          templateId: template.id,
                          templateName: template.name,
                        })
                      }
                    />
                  ))}
                </div>
              </section>
            )}

            {interviewTemplates.length > 0 && (
              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Interview
                </h3>
                <div className="space-y-2">
                  {interviewTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onEdit={() => handleEdit(template)}
                      onDelete={() =>
                        setDeleteModal({
                          isOpen: true,
                          templateId: template.id,
                          templateName: template.name,
                        })
                      }
                    />
                  ))}
                </div>
              </section>
            )}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No templates found.
              </div>
            )}
          </>
        )}

        {(editingTemplate || isCreating) && (
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {editingTemplate
                ? `Edit Template: ${editingTemplate.name}`
                : "New Template"}
            </h3>

            <div className="mb-4">
              <Input
                label="Name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Baptismal Interview"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="flex gap-4">
                <Radio
                  name="category"
                  checked={formData.category === Category.interview}
                  onChange={() =>
                    setFormData({ ...formData, category: Category.interview })
                  }
                  label="Interview"
                />
                <Radio
                  name="category"
                  checked={formData.category === Category.calling}
                  onChange={() =>
                    setFormData({ ...formData, category: Category.calling })
                  }
                  label="Calling"
                />
              </div>
            </div>

            <div className="mb-4">
              <Textarea
                label="Template Content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={6}
                mono
                placeholder='TEMPLATE: "Hello {recipients}, are you available..."'
              />
            </div>

            {formData.content && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview Variables
                </label>
                <div className="flex flex-wrap gap-4">
                  {extractVariablesFromContent(formData.content).map(
                    (variable) => (
                      <div key={variable} className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">
                          {variable}:
                        </label>
                        <input
                          type="text"
                          value={previewData[variable] || ""}
                          onChange={(e) =>
                            setPreviewData({
                              ...previewData,
                              [variable]: e.target.value,
                            })
                          }
                          placeholder={getSampleValue(variable)}
                          className="px-2 py-1 border border-base-300 rounded text-sm w-32 bg-base-100"
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {formData.content && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preview
                </label>
                <div className="p-4 bg-base-200 rounded-md border">
                  {getPreview()}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={isPending}
                variant="primary"
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setEditingTemplate(null);
                  setIsCreating(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, templateId: null, templateName: "" })
        }
        title="Delete Template"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete{" "}
          <strong>{deleteModal.templateName}</strong>?
        </p>
        <ModalActions>
          <Button
            variant="ghost"
            type="button"
            onClick={() =>
              setDeleteModal({
                isOpen: false,
                templateId: null,
                templateName: "",
              })
            }
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </ModalActions>
      </Modal>
    </div>
  );
}

function TemplateCard({
  template,
  onEdit,
  onDelete,
}: {
  template: Template;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <div className="font-medium text-gray-900">{template.name}</div>
        <div className="text-sm text-gray-500">
          {template.variables.length > 0
            ? `Variables: ${template.variables.join(", ")}`
            : "No variables"}
        </div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="danger" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </Card>
  );
}

function extractVariablesFromContent(content: string): string[] {
  const singleVarRegex = /\{(\w+)\}/g;
  const doubleVarRegex = /\{\{(\w+)\}\}/g;

  const variables = new Set<string>();
  let match;

  while ((match = singleVarRegex.exec(content)) !== null) {
    variables.add(match[1]);
  }
  while ((match = doubleVarRegex.exec(content)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}
