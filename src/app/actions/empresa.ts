'use server';

import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export interface MinhaEmpresa {
  empresa_id: string;
  nome_fantasia: string;
  role: 'admin' | 'instalador' | 'tecnico' | 'mestre' | 'vendedor';
  status_acesso: boolean;
  status_assinatura: string;
}

/**
 * Retorna todas as empresas às quais o usuário autenticado pertence.
 * Usado na tela de seleção de empresa após o login.
 */
export async function getMinhasEmpresas(): Promise<{
  success: boolean;
  data?: MinhaEmpresa[];
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    if (!token) {
      return { success: false, error: 'Sessão não encontrada.' };
    }

    const supabaseAdmin = createServerClient();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return { success: false, error: 'Sessão inválida.' };
    }

    // Busca via RPC (função SQL SECURITY DEFINER — sem RLS recursivo)
    const { data, error } = await supabaseAdmin.rpc('get_user_empresas', {
      p_user_id: user.id,
    });

    if (error) {
      console.error('[getMinhasEmpresas] Erro no RPC:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: (data ?? []) as MinhaEmpresa[] };
  } catch (err: any) {
    console.error('[getMinhasEmpresas] Erro inesperado:', err);
    return { success: false, error: err.message || 'Erro inesperado.' };
  }
}

/**
 * Valida que o usuário pertence à empresa solicitada e injeta empresa_id + role
 * nos metadados do JWT via Auth Admin. O cliente deve chamar refreshSession()
 * após esta ação para obter o novo token com as claims atualizadas.
 *
 * Esta é a peça central do fluxo de seleção de empresa:
 *   login → getMinhasEmpresas → (se > 1) tela de seleção → selecionarEmpresa → dashboard
 */
export async function selecionarEmpresa(empresaId: string): Promise<{
  success: boolean;
  role?: string;
  nome_fantasia?: string;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    if (!token) {
      return { success: false, error: 'Sessão não encontrada.' };
    }

    const supabaseAdmin = createServerClient();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return { success: false, error: 'Sessão inválida.' };
    }

    // 1. Verificar se o usuário realmente pertence a esta empresa e está ativo
    const { data: membro, error: membroError } = await supabaseAdmin
      .from('empresa_membros')
      .select('role, status_acesso, empresas(id, nome_fantasia, status_assinatura)')
      .eq('user_id', user.id)
      .eq('empresa_id', empresaId)
      .single();

    if (membroError || !membro) {
      return { success: false, error: 'Você não tem acesso a esta empresa.' };
    }

    if (!membro.status_acesso) {
      return { success: false, error: 'Seu acesso a esta empresa está bloqueado.' };
    }

    const empresa = membro.empresas as any;
    if (empresa?.status_assinatura === 'cancelada') {
      return { success: false, error: 'Esta empresa está com a assinatura cancelada.' };
    }

    // 2. Injetar empresa_id e role no user_metadata do Auth
    //    Isso atualiza o JWT na próxima vez que o cliente chamar refreshSession()
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        empresa_id: empresaId,
        role: membro.role,
        status_acesso: membro.status_acesso,
        // Preserva nome já existente no metadata
        name: user.user_metadata?.name || user.user_metadata?.nome_completo,
        nome_completo: user.user_metadata?.nome_completo || user.user_metadata?.name,
      },
    });

    if (updateError) {
      console.error('[selecionarEmpresa] Erro ao atualizar metadata do Auth:', updateError);
      return { success: false, error: 'Erro ao ativar a empresa selecionada.' };
    }

    return {
      success: true,
      role: membro.role,
      nome_fantasia: empresa?.nome_fantasia,
    };
  } catch (err: any) {
    console.error('[selecionarEmpresa] Erro inesperado:', err);
    return { success: false, error: err.message || 'Erro inesperado.' };
  }
}
