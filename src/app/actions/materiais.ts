'use server';

import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export interface MaterialPredefinido {
  id: string;
  nome: string;
  criado_em?: string;
  tipo_servico?: string | null;
}

const FALLBACK_MATERIALS: MaterialPredefinido[] = [
  { id: 'm1', nome: 'Cabo Calefator 15W/m' },
  { id: 'm2', nome: 'Cabo Calefator 20W/m' },
  { id: 'm3', nome: 'Termostato Wifi Black' },
  { id: 'm4', nome: 'Termostato Wifi White' },
  { id: 'm5', nome: 'Termostato Digital Programável' },
  { id: 'm6', nome: 'Isolamento Térmico (Refletivo)' },
  { id: 'm7', nome: 'Sensor de Piso NTC' },
  { id: 'm8', nome: 'Malha Metálica de Fixação' },
  { id: 'm9', nome: 'Fita de Fixação Adesiva' },
];

/**
 * Busca todos os materiais pré-definidos do banco.
 * Caso a tabela não exista (migração pendente), retorna o fallback estático.
 */
export async function getMateriaisPredefinidos(tipoServico?: string): Promise<MaterialPredefinido[]> {
  try {
    const supabase = createServerClient();
    
    // Obter o token do usuário logado e buscar seu empresa_id
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    let empresaId = '00000000-0000-0000-0000-000000000000';
    let isSuperAdmin = false;

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: perfil } = await supabase
          .from('perfis_usuarios')
          .select('role, empresa_id')
          .eq('id', user.id)
          .single();
        if (perfil) {
          empresaId = perfil.empresa_id || empresaId;
          isSuperAdmin = perfil.role === 'super_admin';
        }
      }
    }

    let query = supabase
      .from('materiais_predefinidos')
      .select('*');

    if (!isSuperAdmin) {
      query = query.or(`empresa_id.eq.${empresaId},empresa_id.eq.00000000-0000-0000-0000-000000000000`);
    }

    const { data, error } = await query.order('nome', { ascending: true });

    if (error) {
      console.warn('Erro ao carregar materiais do banco, usando fallback:', error.message);
      if (tipoServico && tipoServico !== 'Aquecimento de piso') {
        return [];
      }
      return FALLBACK_MATERIALS;
    }

    let result = (data || []) as MaterialPredefinido[];
    if (tipoServico) {
      result = result.filter(m => !m.tipo_servico || m.tipo_servico === tipoServico);
    }
    return result;
  } catch (err) {
    console.warn('Erro ao conectar ao banco para buscar materiais, usando fallback:', err);
    return FALLBACK_MATERIALS;
  }
}

/**
 * Adiciona um novo material pré-definido no banco.
 */
export async function criarMaterialPredefinido(nome: string, tipoServico?: string): Promise<{ success: boolean; data?: MaterialPredefinido; error?: string }> {
  try {
    if (!nome || !nome.trim()) {
      return { success: false, error: 'O nome do material é obrigatório.' };
    }
    const supabase = createServerClient();

    // Obter o token do usuário logado e buscar seu empresa_id
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    if (!token) {
      return { success: false, error: 'Não autorizado: Sessão ausente.' };
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return { success: false, error: 'Não autorizado: Sessão inválida.' };
    }

    const { data: perfil } = await supabase
      .from('perfis_usuarios')
      .select('role, empresa_id, status_acesso')
      .eq('id', user.id)
      .single();

    if (!perfil) {
      return { success: false, error: 'Perfil do usuário não encontrado.' };
    }

    if (perfil.status_acesso === false) {
      return { success: false, error: 'Seu usuário está bloqueado.' };
    }

    if (perfil.role !== 'admin' && perfil.role !== 'mestre' && perfil.role !== 'super_admin') {
      return { success: false, error: 'Acesso negado: Permissão restrita a administradores.' };
    }

    const { data, error } = await supabase
      .from('materiais_predefinidos')
      .insert([{ 
        nome: nome.trim(), 
        tipo_servico: tipoServico || null,
        empresa_id: perfil.empresa_id
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar material:', error);
      return { success: false, error: error.message || 'Erro ao criar material.' };
    }

    return { success: true, data: data as MaterialPredefinido };
  } catch (err) {
    console.error('Erro inesperado ao criar material:', err);
    return { success: false, error: (err as Error).message || 'Erro inesperado ao criar material.' };
  }
}

/**
 * Atualiza o nome de um material pré-definido.
 */
export async function atualizarMaterialPredefinido(id: string, nome: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id || !nome || !nome.trim()) {
      return { success: false, error: 'ID e novo nome são obrigatórios.' };
    }
    const supabase = createServerClient();

    // Obter o token do usuário logado e buscar seu empresa_id
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    if (!token) {
      return { success: false, error: 'Não autorizado: Sessão ausente.' };
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return { success: false, error: 'Não autorizado: Sessão inválida.' };
    }

    const { data: perfil } = await supabase
      .from('perfis_usuarios')
      .select('role, empresa_id, status_acesso')
      .eq('id', user.id)
      .single();

    if (!perfil) {
      return { success: false, error: 'Perfil do usuário não encontrado.' };
    }

    if (perfil.status_acesso === false) {
      return { success: false, error: 'Seu usuário está bloqueado.' };
    }

    if (perfil.role !== 'admin' && perfil.role !== 'mestre' && perfil.role !== 'super_admin') {
      return { success: false, error: 'Acesso negado: Permissão restrita a administradores.' };
    }

    // Validar se o material pertence à mesma empresa
    const { data: targetMaterial, error: materialError } = await supabase
      .from('materiais_predefinidos')
      .select('empresa_id')
      .eq('id', id)
      .single();

    if (materialError || !targetMaterial) {
      return { success: false, error: 'Material não encontrado.' };
    }

    if (perfil.role !== 'super_admin' && targetMaterial.empresa_id !== perfil.empresa_id) {
      return { success: false, error: 'Acesso negado: Este material pertence a outra organização.' };
    }

    const { error } = await supabase
      .from('materiais_predefinidos')
      .update({ nome: nome.trim() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar material:', error);
      return { success: false, error: error.message || 'Erro ao atualizar material.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Erro inesperado ao atualizar material:', err);
    return { success: false, error: (err as Error).message || 'Erro inesperado ao atualizar material.' };
  }
}

/**
 * Exclui um material pré-definido do banco de dados.
 */
export async function deletarMaterialPredefinido(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) {
      return { success: false, error: 'O ID do material é obrigatório.' };
    }
    const supabase = createServerClient();

    // Obter o token do usuário logado e buscar seu empresa_id
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    if (!token) {
      return { success: false, error: 'Não autorizado: Sessão ausente.' };
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return { success: false, error: 'Não autorizado: Sessão inválida.' };
    }

    const { data: perfil } = await supabase
      .from('perfis_usuarios')
      .select('role, empresa_id, status_acesso')
      .eq('id', user.id)
      .single();

    if (!perfil) {
      return { success: false, error: 'Perfil do usuário não encontrado.' };
    }

    if (perfil.status_acesso === false) {
      return { success: false, error: 'Seu usuário está bloqueado.' };
    }

    if (perfil.role !== 'admin' && perfil.role !== 'mestre' && perfil.role !== 'super_admin') {
      return { success: false, error: 'Acesso negado: Permissão restrita a administradores.' };
    }

    // Validar se o material pertence à mesma empresa
    const { data: targetMaterial, error: materialError } = await supabase
      .from('materiais_predefinidos')
      .select('empresa_id')
      .eq('id', id)
      .single();

    if (materialError || !targetMaterial) {
      return { success: false, error: 'Material não encontrado.' };
    }

    if (perfil.role !== 'super_admin' && targetMaterial.empresa_id !== perfil.empresa_id) {
      return { success: false, error: 'Acesso negado: Este material pertence a outra organização.' };
    }

    const { error } = await supabase
      .from('materiais_predefinidos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar material:', error);
      return { success: false, error: error.message || 'Erro ao deletar material.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Erro inesperado ao deletar material:', err);
    return { success: false, error: (err as Error).message || 'Erro inesperado ao deletar material.' };
  }
}
