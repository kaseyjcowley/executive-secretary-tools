"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Template } from "@/types/messages";
import { Category } from "@/types/messages";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: Category.interview as Category,
    content: "",
  });

  const [previewData, setPreviewData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates");
      const data = await response.json();
      setTemplates(data.templates);
    } catch (error) {
      toast.error("Failed to load templates");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
      const url = editingTemplate
        ? `/api/templates/${editingTemplate.id}`
        : "/api/templates";
      const method = editingTemplate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save template");
      }

      toast.success(editingTemplate ? "Template updated" : "Template created");
      setEditingTemplate(null);
      setIsCreating(false);
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to save template");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      toast.success("Template deleted");
      fetchTemplates();
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Message Templates
      </h1>

      {!editingTemplate && !isCreating && (
        <>
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + New Template
            </button>
          </div>

          {callingTemplates.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Calling
              </h2>
              <div className="space-y-2">
                {callingTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onEdit={() => handleEdit(template)}
                    onDelete={() => handleDelete(template.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {interviewTemplates.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Interview
              </h2>
              <div className="space-y-2">
                {interviewTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onEdit={() => handleEdit(template)}
                    onDelete={() => handleDelete(template.id)}
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
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingTemplate
              ? `Edit Template: ${editingTemplate.name}`
              : "New Template"}
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Baptismal Interview"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  checked={formData.category === Category.interview}
                  onChange={() =>
                    setFormData({ ...formData, category: Category.interview })
                  }
                />
                <span>Interview</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  checked={formData.category === Category.calling}
                  onChange={() =>
                    setFormData({ ...formData, category: Category.calling })
                  }
                />
                <span>Calling</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
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
                        className="px-2 py-1 border border-gray-300 rounded text-sm w-32"
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
              <div className="p-4 bg-gray-50 rounded-md border">
                {getPreview()}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditingTemplate(null);
                setIsCreating(false);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
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
    <div className="bg-white rounded-lg p-4 shadow border flex justify-between items-center">
      <div>
        <div className="font-medium text-gray-900">{template.name}</div>
        <div className="text-sm text-gray-500">
          {template.variables.length > 0
            ? `Variables: ${template.variables.join(", ")}`
            : "No variables"}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
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
