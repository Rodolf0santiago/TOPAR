'use server';

import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

const FALLBACK_SERVICES = [
  'Aquecimento de piso',
  'Instalação Sistemas Solares',
  'Limpeza de placas Solares',
  'Carregamento Veicular'
];

export async function getTiposServico(): Promise<string[]> {
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

    let query = supabase.from('tipos_servico').select('nome');
    if (!isSuperAdmin) {
      query = query.or(`empresa_id.eq.${empresaId},empresa_id.eq.00000000-0000-0000-0000-000000000000`);
    }

    const { data, error } = await query.order('nome', { ascending: true });

    if (error) {
      console.warn('Erro ao carregar tipos de serviço do banco, usando fallback:', error.message);
      return FALLBACK_SERVICES;
    }

    if (!data) {
      return FALLBACK_SERVICES;
    }

    return data.map((d: any) => d.nome);
  } catch (err) {
    console.warn('Erro ao conectar ao banco para buscar tipos de serviço, usando fallback:', err);
    return FALLBACK_SERVICES;
  }
}

export async function criarTipoServico(nome: string): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    if (!nome || !nome.trim()) {
      return { success: false, error: 'O nome do serviço é obrigatório.' };
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
      .from('tipos_servico')
      .insert([{ nome: nome.trim(), empresa_id: perfil.empresa_id }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar tipo de serviço:', error);
      return { success: false, error: error.message || 'Erro ao criar tipo de serviço.' };
    }

    return { success: true, data: data.nome };
  } catch (err) {
    console.error('Erro inesperado ao criar tipo de serviço:', err);
    return { success: false, error: (err as Error).message || 'Erro inesperado ao criar tipo de serviço.' };
  }
}

export async function deletarTipoServico(nome: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!nome || !nome.trim()) {
      return { success: false, error: 'O nome do serviço é obrigatório.' };
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

    // 1. Deletar da tabela tipos_servico garantindo isolamento da empresa
    let query = supabase
      .from('tipos_servico')
      .delete()
      .eq('nome', nome.trim());

    if (perfil.role !== 'super_admin') {
      query = query.eq('empresa_id', perfil.empresa_id);
    }

    const { error: errorServico } = await query;

    if (errorServico) {
      console.error('Erro ao deletar tipo de serviço:', errorServico);
      return { success: false, error: errorServico.message || 'Erro ao deletar tipo de serviço.' };
    }

    // 2. Deletar materiais predefinidos associados a este tipo de serviço e empresa
    let queryMateriais = supabase
      .from('materiais_predefinidos')
      .delete()
      .eq('tipo_servico', nome.trim());

    if (perfil.role !== 'super_admin') {
      queryMateriais = queryMateriais.eq('empresa_id', perfil.empresa_id);
    }

    const { error: errorMateriais } = await queryMateriais;

    if (errorMateriais) {
      console.warn('Aviso: Erro ao deletar materiais vinculados ao serviço:', errorMateriais.message);
    }

    return { success: true };
  } catch (err) {
    console.error('Erro inesperado ao deletar tipo de serviço:', err);
    return { success: false, error: (err as Error).message || 'Erro inesperado ao deletar tipo de serviço.' };
  }
}
