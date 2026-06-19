import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '@/services/leadsService';

export function useLeads() {
  const queryClient = useQueryClient();

  // Query para buscar leads (utilizado no CRM)
  const leadsQuery = useQuery({
    queryKey: ['leads'],
    queryFn: leadsService.getLeads,
  });

  // Mutação para criar novos leads (utilizado na Landing Page)
  const createLeadMutation = useMutation({
    mutationFn: leadsService.createLead,
    onSuccess: () => {
      // Força a revalidação da query de leads
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  return {
    leads: leadsQuery.data || [],
    isLoading: leadsQuery.isLoading,
    error: leadsQuery.error,
    createLead: createLeadMutation.mutateAsync,
    isCreating: createLeadMutation.isPending,
  };
}
