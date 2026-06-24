import { supabase } from '@/lib/supabase';
import { ResponsavelTecnico } from '@/types/database.types';

export const responsaveisService = {
  /**
   * Obtém os responsáveis técnicos filtrados pelo empresa_id do usuário logado e role 'tecnico'
   */
  async getResponsaveis(): Promise<ResponsavelTecnico[]> {
    // 1. Recuperar o contexto de autenticação/sessão
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return [];
    }

    const empresaId = session.user.user_metadata?.empresa_id;
    if (!empresaId) {
      return [];
    }

    // 2. Buscar na tabela perfis_usuarios os colaboradores com role 'tecnico' (Técnico Operacional) da mesma empresa
    const { data: perfis, error: perfisError } = await supabase
      .from('perfis_usuarios')
      .select('id, nome_completo, email, role, empresa_id')
      .eq('empresa_id', empresaId)
      .eq('role', 'tecnico');

    if (perfisError) {
      throw new Error(perfisError.message || 'Erro ao buscar perfis de técnicos.');
    }

    if (!perfis || perfis.length === 0) {
      return [];
    }

    // 3. Buscar os telefones correspondentes em responsaveis_tecnicos
    const ids = perfis.map(p => p.id);
    const { data: techs, error: techsError } = await supabase
      .from('responsaveis_tecnicos')
      .select('id, nome, email, telefone, empresa_id')
      .in('id', ids);

    // Fallback: se der erro na busca de telefones, retorna os dados dos perfis mapeados
    if (techsError || !techs) {
      return perfis.map(p => ({
        id: p.id,
        nome: p.nome_completo,
        email: p.email,
        telefone: '',
        empresa_id: p.empresa_id
      }));
    }

    const techsMap = new Map(techs.map(t => [t.id, t]));

    // Retorna a lista final formatada e ordenada
    return perfis.map(p => {
      const tech = techsMap.get(p.id);
      return {
        id: p.id,
        nome: p.nome_completo,
        email: p.email,
        telefone: tech ? tech.telefone : '',
        empresa_id: p.empresa_id
      };
    }).sort((a, b) => a.nome.localeCompare(b.nome));
  },
};
