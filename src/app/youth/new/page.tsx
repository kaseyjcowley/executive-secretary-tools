"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, Button } from "@/components/ui";
import { createYouthAction } from "@/actions/youth";

export default function NewYouthPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setIsSubmitting(true);

    try {
      await createYouthAction(name.trim());
      toast.success(`${name.trim()} added to queue`);
      router.push("/youth");
    } catch (error) {
      toast.error("Failed to add youth");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-0 py-8 max-w-md">
      <Card className="mx-0 -mx-4 md:mx-auto md:px-6 px-4 p-4 md:p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Add Youth</h2>
          <p className="mt-1 text-sm text-gray-600">
            Add a new youth to the visitation queue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name *
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              placeholder="e.g., Amara Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
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
              disabled={isSubmitting || !name.trim()}
              loading={isSubmitting}
              className="flex-1"
            >
              Add Youth
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
