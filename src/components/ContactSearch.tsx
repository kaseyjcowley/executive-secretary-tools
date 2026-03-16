"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Fuse from "fuse.js";
import { Contact } from "@/types/messages";

interface Props {
  contacts: Contact[];
  onSearchChange: (filteredContacts: Contact[]) => void;
}

export function ContactSearch({ contacts, onSearchChange }: Props) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(contacts, {
        keys: ["name", "calling", "labels.name"],
        threshold: 0.4,
        includeScore: true,
      }),
    [contacts],
  );

  useEffect(() => {
    if (!query.trim()) {
      onSearchChange(contacts);
    } else {
      const results = fuse.search(query);
      const filtered = results.map((r) => r.item);
      onSearchChange(filtered);
    }
  }, [query, fuse, contacts, onSearchChange]);

  const handleClear = useCallback(() => {
    setQuery("");
  }, []);

  return (
    <form onSubmit={(e) => e.preventDefault()} className="relative">
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
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search contacts..."
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
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
    </form>
  );
}
