"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Fuse from "fuse.js";
import { Contact } from "@/types/messages";
import { ContactList } from "@/features/messages/components/ContactList";
import {
  ContactFilters,
  filterContacts,
  ContactTypeFilter,
  ContactStatusFilter,
  StageFilter,
} from "@/components/ContactFilters";

interface Props {
  contacts: Contact[];
  suppressedIds: Set<string>;
}

interface FilterState {
  type: ContactTypeFilter;
  status: ContactStatusFilter;
  label: string;
  stage: StageFilter;
  assigned: string;
}

function getInitialFilters(searchParams: URLSearchParams): FilterState {
  return {
    type: (searchParams.get("type") as ContactTypeFilter) || "all",
    status: (searchParams.get("status") as ContactStatusFilter) || "all",
    label: searchParams.get("label") || "",
    stage: (searchParams.get("stage") as StageFilter) || "all",
    assigned: searchParams.get("assigned") || "",
  };
}

export function MessagesPageClient({ contacts, suppressedIds }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState<FilterState>(() =>
    getInitialFilters(searchParams),
  );

  const fuse = useMemo(
    () =>
      new Fuse(contacts, {
        keys: ["name", "calling", "labels.name"],
        threshold: 0.4,
        includeScore: true,
      }),
    [contacts],
  );

  const searchFilteredContacts = useMemo(() => {
    if (!searchQuery.trim()) {
      return contacts;
    }
    const results = fuse.search(searchQuery);
    return results.map((r) => r.item);
  }, [searchQuery, fuse, contacts]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.type !== "all") params.set("type", filters.type);
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.label) params.set("label", filters.label);
    if (filters.stage !== "all") params.set("stage", filters.stage);
    if (filters.assigned) params.set("assigned", filters.assigned);
    if (searchQuery) params.set("q", searchQuery);

    const queryString = params.toString();
    const currentParams = searchParams.toString();

    if (queryString !== currentParams) {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    }
  }, [filters, searchQuery, pathname, router, searchParams]);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const finalFilteredContacts = useMemo(
    () => filterContacts(searchFilteredContacts, filters),
    [searchFilteredContacts, filters],
  );

  const showMessaged = filters.status === "messaged";

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search contacts..."
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg
              className="h-5 w-5 text-gray-400 hover:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      <ContactFilters
        contacts={contacts}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
      <ContactList
        contacts={finalFilteredContacts}
        suppressedIds={suppressedIds}
        showMessaged={showMessaged}
      />
    </div>
  );
}
