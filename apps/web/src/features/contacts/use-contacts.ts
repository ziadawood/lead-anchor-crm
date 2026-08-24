import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/use-auth';

const API_URL = (import.meta.env.VITE_API_URL || 'https://leadanchor-api.ziadawood.workers.dev/api/v1');

export const useContacts = () => {
  const { session } = useAuth();

  const fetchContacts = async () => {
    const res = await fetch(`${API_URL}/contacts`, {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch contacts');
    const json = await res.json();
    return json.data;
  };

  const contactsQuery = useQuery({
    queryKey: ['contacts'],
    queryFn: fetchContacts,
    enabled: !!session,
  });

  return {
    contacts: contactsQuery.data || [],
    isLoading: contactsQuery.isLoading,
    error: contactsQuery.error,
  };
};

export const useContactProfile = (contactId: string | undefined) => {
  const { session } = useAuth();

  const fetchContact = async () => {
    if (!contactId) return null;
    const res = await fetch(`${API_URL}/contacts/${contactId}`, {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch contact');
    const json = await res.json();
    return json.data;
  };

  const profileQuery = useQuery({
    queryKey: ['contact', contactId],
    queryFn: fetchContact,
    enabled: !!session && !!contactId,
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
  };
};
