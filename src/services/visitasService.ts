import { supabase } from '@/lib/supabase';
import { Visita } from '@/types/database.types';

export const visitasService = {
  /**
   * Obtém a lista completa de visitas técnicas, incluindo os dados do projeto e do lead associado
   */
  async getVisitas(): Promise<Visita[]> {
    const { data, error } = await supabase
      .from('visits')
      .select('*, projects(*, leads(*))')
      .order('data_visita', { ascending: true })
      .order('horario', { ascending: true });

    if (error) {
      throw new Error(error.message || 'Erro ao carregar cronograma de visitas.');
    }

    // Como o Supabase retorna joins na tipagem de objetos aninhados,
    // mapeamos o resultado para corresponder à nossa interface Visita
    return (data || []) as unknown as Visita[];
  },

  /**
   * Atualiza as informações de uma visita técnica (relato do técnico no campo)
   */
  async updateVisita(id: string, updates: Partial<Visita>): Promise<Visita> {
    const { data, error } = await supabase
      .from('visits')
      .update({
        status_visita: updates.status_visita,
        material_usado: updates.material_usado,
        valor_gasto: updates.valor_gasto,
        observacoes: updates.observacoes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Erro ao salvar relatório da visita.');
    }
    return data as Visita;
  },
};
