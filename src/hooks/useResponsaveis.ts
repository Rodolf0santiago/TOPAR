import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { responsaveisService } from '@/services/responsaveisService';
import { createResponsavelTecnico } from '@/app/actions/responsaveis';

export function useResponsaveis() {
  const queryClient = useQueryClient();

  // Query para obter os responsáveis técnicos
  const responsaveisQuery = useQuery({
    queryKey: ['responsaveis_tecnicos'],
    queryFn: responsaveisService.getResponsaveis,
  });

  // Mutação para criar um novo responsável técnico chamando a Server Action
  const createResponsavelMutation = useMutation({
    mutationFn: createResponsavelTecnico,
    onSuccess: () => {
      // Revalida o cache e atualiza a listagem na UI automaticamente
      queryClient.invalidateQueries({ queryKey: ['responsaveis_tecnicos'] });
    },
  });

  return {
    responsaveis: responsaveisQuery.data || [],
    isLoading: responsaveisQuery.isLoading,
    error: responsaveisQuery.error,
    createResponsavel: createResponsavelMutation.mutateAsync,
    isCreating: createResponsavelMutation.isPending,
  };
}
