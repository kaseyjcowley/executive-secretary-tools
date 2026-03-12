import { useState, useEffect } from "react";
import { Contact } from "@/types/messages";
import { getAppointmentContacts } from "@/requests/cards";
import { sortContactsByLabel } from "@/utils/contact-ordering";

interface UseContactsReturn {
  contacts: Contact[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useContacts(): UseContactsReturn {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContacts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAppointmentContacts();
      const sorted = sortContactsByLabel(data);
      setContacts(sorted);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch contacts"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return { contacts, isLoading, error, refetch: fetchContacts };
}
