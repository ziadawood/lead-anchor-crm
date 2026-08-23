import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
// Import types from shared package
import type { IDeal, IInteraction, IContact } from '@leadanchor/shared';

// For MVP, we will fetch directly from Supabase DB to bypass the unbuilt API server.
// In production, this would use fetchApi from '../lib/api'.

export function useDeals() {
  return useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*, contact:contacts(*), stage:pipeline_stages(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as IDeal[];
    },
  });
}

export function useInteractions() {
  return useQuery({
    queryKey: ['interactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select('*, contact:contacts(*), deal:deals(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as IInteraction[];
    },
  });
}

export function useContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) throw error;
      return data as IContact[];
    },
  });
}
