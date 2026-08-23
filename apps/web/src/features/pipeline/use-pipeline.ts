import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/use-auth';

const API_URL = 'http://localhost:8787/api/v1';

export const usePipeline = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const fetchDeals = async () => {
    const res = await fetch(`${API_URL}/deals`, {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch deals');
    const json = await res.json();
    return json.data;
  };

  const updateDealStage = async ({ dealId, stageId }: { dealId: string; stageId: string }) => {
    const res = await fetch(`${API_URL}/deals/${dealId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ stage_id: stageId }),
    });
    if (!res.ok) throw new Error('Failed to update deal stage');
    return res.json();
  };

  const dealsQuery = useQuery({
    queryKey: ['deals'],
    queryFn: fetchDeals,
    enabled: !!session,
  });

  const updateStageMutation = useMutation({
    mutationFn: updateDealStage,
    onMutate: async ({ dealId, stageId }) => {
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ['deals'] });
      const previousDeals = queryClient.getQueryData(['deals']);
      
      queryClient.setQueryData(['deals'], (old: any) => {
        if (!old) return old;
        return old.map((deal: any) => 
          deal.id === dealId ? { ...deal, stage_id: stageId } : deal
        );
      });
      
      return { previousDeals };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['deals'], context?.previousDeals);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });

  return {
    deals: dealsQuery.data || [],
    isLoading: dealsQuery.isLoading,
    error: dealsQuery.error,
    updateStage: updateStageMutation.mutate,
  };
};
