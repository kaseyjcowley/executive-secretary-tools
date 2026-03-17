"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
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
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Import Youth</h2>
        <p className="mt-2 text-sm text-gray-600">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-64 resize-none text-slate-700"
            placeholder="Amara Johnson&#10;Marcus Chen&#10;Taylor Williams"
            value={namesText}
            onChange={(e) => setNamesText(e.target.value)}
            disabled={isSubmitting}
          />
          <p className="text-sm text-gray-500 mt-1">Enter one name per line</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting || !namesText.trim()}
          >
            {isSubmitting ? "Importing..." : "Import"}
          </button>
        </div>
      </form>
    </div>
  );
}
