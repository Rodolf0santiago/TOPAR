import { supabase } from '@/lib/supabase';
import { ResponsavelTecnico } from '@/types/database.types';

export const responsaveisService = {
  /**
   * Obtém todos os responsáveis técnicos cadastrados no Supabase
   */
  async getResponsaveis(): Promise<ResponsavelTecnico[]> {
    const { data, error } = await supabase
      .from('responsaveis_tecnicos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message || 'Erro ao buscar responsáveis técnicos.');
    }
    return data || [];
  },
};
