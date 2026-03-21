"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, Button } from "@/components/ui";
import { importYouthAction } from "@/actions/youth-visits";

export default function ImportYouthPage() {
  const router = useRouter();
  const [namesText, setNamesText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();

    const names = namesText
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) {
      toast.error("Please enter at least one name");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await importYouthAction(names);
      toast.success(`Imported ${data.imported} youth`);
      router.push("/youth");
    } catch (error) {
      toast.error("Failed to import youth");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-0 py-8 max-w-md">
      <Card className="mx-0 -mx-4 md:mx-auto md:px-6 px-4 p-4 md:p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Import Youth</h2>
          <p className="mt-1 text-sm text-gray-600">
            Import multiple youth at once from a list of names
          </p>
        </div>

        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label
              htmlFor="names"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Names (one per line)
            </label>
            <textarea
              id="names"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 resize-none text-slate-700"
              placeholder="Amara Johnson&#10;Marcus Chen&#10;Taylor Williams"
              value={namesText}
              onChange={(e) => setNamesText(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter one name per line
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting || !namesText.trim()}
              loading={isSubmitting}
              className="flex-1"
            >
              Import
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
