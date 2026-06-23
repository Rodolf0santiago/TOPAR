'use server';

import { createServerClient } from '@/lib/supabase';
import { Visita } from '@/types/database.types';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function getGroupedVisitas() {
  const supabase = createServerClient();

  // Validar se o usuário logado é técnico ou instalador e filtrar por ID
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;
  
  if (!token) {
    throw new Error('Não autorizado: Sessão ausente.');
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    throw new Error('Não autorizado: Sessão inválida.');
  }

  // Obter perfil do banco
  const { data: perfil, error: perfilError } = await supabase
    .from('perfis_usuarios')
    .select('role, empresa_id, status_acesso')
    .eq('id', user.id)
    .single();

  if (perfilError || !perfil) {
    throw new Error('Erro ao carregar perfil do usuário.');
  }

  if (perfil.status_acesso === false) {
    throw new Error('Acesso negado: Seu usuário está bloqueado.');
  }

  const normalizedRole = (perfil.role || '').toLowerCase();
  const isTechnicalUser = normalizedRole === 'tecnico' || normalizedRole === 'instalador';
  const isSuperAdmin = normalizedRole === 'super_admin';
  const userEmpresaId = perfil.empresa_id;

  let query = supabase
    .from('visits')
    .select('*, projects(*, leads(*)), responsaveis_tecnicos(*), empresas(*)');

  // Enforce company isolation
  if (!isSuperAdmin) {
    query = query.eq('empresa_id', userEmpresaId);
  }

  // Aplicar restrição de técnico se for o caso
  if (isTechnicalUser) {
    query = query.eq('tecnico_id', user.id);
  }

  // Buscar perfis para mapear e-mails para nomes completos no agendado_por
  const { data: perfis } = await supabase
    .from('perfis_usuarios')
    .select('nome_completo, email');
  
  const emailToNameMap = new Map<string, string>();
  if (perfis) {
    perfis.forEach(p => {
      emailToNameMap.set(p.email.toLowerCase(), p.nome_completo);
    });
  }

  const { data, error } = await query
    .order('data_visita', { ascending: true })
    .order('horario', { ascending: true });

  if (error) {
    console.error('Erro ao buscar visitas no banco:', error);
    throw new Error(error.message || 'Erro ao carregar cronograma de visitas.');
  }

  const rawVisits = data || [];
  const visits = rawVisits.map((v: any) => {
    let agendadoPorDisplay = v.agendado_por;
    if (v.agendado_por && emailToNameMap.has(v.agendado_por.toLowerCase())) {
      agendadoPorDisplay = emailToNameMap.get(v.agendado_por.toLowerCase());
    }
    return {
      ...v,
      agendado_por: agendadoPorDisplay
    };
  }) as unknown as Visita[];


  // Obter datas corretas no fuso horário do Brasil (America/Sao_Paulo)
  const getBrazilNow = () => {
    const d = new Date();
    const spString = d.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
    return new Date(spString);
  };

  const brNow = getBrazilNow();

  const isVisitAtrasada = (v: Visita, nowBr: Date) => {
    if (v.status_visita !== 'Agendada') return false;
    if (!v.data_visita || !v.horario) return false;
    
    const [y, m, d] = v.data_visita.split('-').map(Number);
    const [hours, minutes] = v.horario.split(':').map(Number);
    
    const visitDate = new Date(y, m - 1, d, hours || 0, minutes || 0);
    return visitDate < nowBr;
  };

  const formatTZ = (d: Date) => {
    const formatted = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
    const [day, month, year] = formatted.split('/');
    return `${year}-${month}-${day}`;
  };

  const hojeStr = formatTZ(brNow);

  const tomorrow = new Date(brNow);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const amanhaStr = formatTZ(tomorrow);

  // IMPORTANTE: atrasadas = status 'Agendada' com data/hora anterior a agora (fuso SP)
  // hoje = visitas do dia de hoje (apenas status 'Agendada' e que ainda vão ocorrer)
  // amanha = visitas de amanhã (apenas status 'Agendada' e que ainda vão ocorrer)
  // proximas = visitas após amanhã (apenas status 'Agendada' e que ainda vão ocorrer)
  const atrasadas = visits.filter(v => v.status_visita === 'Agendada' && isVisitAtrasada(v, brNow));
  const hoje = visits.filter(v => v.data_visita === hojeStr && v.status_visita === 'Agendada' && !isVisitAtrasada(v, brNow));
  const amanha = visits.filter(v => v.data_visita === amanhaStr && v.status_visita === 'Agendada' && !isVisitAtrasada(v, brNow));
  const proximas = visits.filter(v => v.data_visita > amanhaStr && v.status_visita === 'Agendada' && !isVisitAtrasada(v, brNow));

  return {
    hojeStr,
    amanhaStr,
    atrasadas,
    hoje,
    amanha,
    proximas,
    rawVisitas: visits,
  };
}

/**
 * Exclui uma visita técnica pelo ID usando service_role (ignora RLS).
 * Deve ser chamada apenas por administradores/mestres.
 */
export async function deleteVisitaAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    
    if (!token) {
      return { success: false, error: 'Não autorizado: Sessão ausente.' };
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return { success: false, error: 'Não autorizado: Sessão inválida.' };
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('perfis_usuarios')
      .select('role, empresa_id, status_acesso')
      .eq('id', user.id)
      .single();

    if (perfilError || !perfil) {
      return { success: false, error: 'Erro ao validar permissões do usuário.' };
    }

    if (perfil.status_acesso === false) {
      return { success: false, error: 'Acesso negado: Seu usuário está bloqueado.' };
    }

    const normalizedRole = (perfil.role || '').toLowerCase();
    if (normalizedRole !== 'admin' && normalizedRole !== 'mestre' && normalizedRole !== 'super_admin') {
      return { success: false, error: 'Acesso negado: Permissão restrita a administradores e mestres.' };
    }

    // Validar se a visita pertence à mesma empresa
    const { data: targetVisit, error: visitError } = await supabase
      .from('visits')
      .select('empresa_id')
      .eq('id', id)
      .single();

    if (visitError || !targetVisit) {
      return { success: false, error: 'Visita não encontrada.' };
    }

    if (normalizedRole !== 'super_admin' && targetVisit.empresa_id !== perfil.empresa_id) {
      return { success: false, error: 'Acesso negado: Esta visita pertence a outra organização.' };
    }

    const { error } = await supabase
      .from('visits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir visita:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Exceção ao excluir visita:', err);
    return { success: false, error: err?.message || 'Erro inesperado ao excluir visita.' };
  }
}

export async function criarNovaVisita(formData: FormData): Promise<{ success: boolean; data?: Visita; error?: string }> {
  try {
    const supabase = createServerClient();
    
    // Extração dos dados do FormData
    const projectId = formData.get('project_id') as string;
    const tecnicoId = formData.get('tecnico_id') as string | null;
    const dataVisita = formData.get('data_visita') as string;
    const horario = formData.get('horario') as string;
    const observacoes = formData.get('observacoes') as string || '';
    const pdfFile = formData.get('pdf_proposta') as File | null;

    if (!projectId) {
      return { success: false, error: 'O ID do projeto é obrigatório.' };
    }
    if (!dataVisita) {
      return { success: false, error: 'A data da visita é obrigatória.' };
    }
    if (!horario) {
      return { success: false, error: 'O horário da visita é obrigatório.' };
    }

    let pdfUrl: string | null = null;

    // Se houver arquivo PDF
    if (pdfFile && pdfFile.size > 0) {
      if (!pdfFile.name.toLowerCase().endsWith('.pdf') && pdfFile.type !== 'application/pdf') {
        return { success: false, error: 'Apenas arquivos PDF são permitidos.' };
      }

      // Upload do arquivo para o bucket documentos_crm
      const fileBuffer = Buffer.from(await pdfFile.arrayBuffer());
      const fileExt = 'pdf';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos_crm')
        .upload(fileName, fileBuffer, {
          contentType: 'application/pdf',
          duplex: 'half'
        });

      if (uploadError) {
        console.error('Erro ao subir PDF no Storage:', uploadError);
        return { success: false, error: `Erro no upload da proposta: ${uploadError.message}` };
      }

      // Recuperar URL pública
      const { data: urlData } = supabase.storage
        .from('documentos_crm')
        .getPublicUrl(fileName);

      pdfUrl = urlData.publicUrl;
    }

    let currentUserName: string | null = null;
    let userEmpresaId: string | null = null;
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        // Tentar obter o nome completo do perfil do usuário na tabela perfis_usuarios e empresa_id
        const { data: perfil } = await supabase
          .from('perfis_usuarios')
          .select('nome_completo, empresa_id')
          .eq('id', user.id)
          .single();
        if (perfil) {
          currentUserName = perfil.nome_completo;
          userEmpresaId = perfil.empresa_id;
        }
        if (!currentUserName) {
          currentUserName = user.user_metadata?.name || user.user_metadata?.nome_completo || user.email || 'Usuário';
        }
      }
    }

    if (!userEmpresaId) {
      return { success: false, error: 'Não foi possível associar a visita à sua empresa. Faça login novamente.' };
    }

    // Inserção no banco
    const { data: visitaData, error: dbError } = await supabase
      .from('visits')
      .insert([
        {
          project_id: projectId,
          data_visita: dataVisita,
          horario: horario,
          status_visita: 'Agendada',
          material_usado: [],
          valor_gasto: 0,
          observacoes: observacoes,
          tecnico_id: tecnicoId || null,
          pdf_proposta_url: pdfUrl,
          agendado_por: currentUserName,
          empresa_id: userEmpresaId
        }
      ])
      .select('*, projects(*, leads(*)), responsaveis_tecnicos(*), empresas(*)')
      .single();

    if (dbError) {
      console.error('Erro ao salvar visita no banco:', dbError);
      
      // Rollback manual do arquivo de storage se a inserção no banco falhar
      if (pdfUrl) {
        const fileName = pdfUrl.split('/').pop();
        if (fileName) {
          await supabase.storage.from('documentos_crm').remove([fileName]);
        }
      }
      return { success: false, error: `Erro ao salvar visita no banco: ${dbError.message}` };
    }

    return { success: true, data: visitaData as unknown as Visita };
  } catch (err: any) {
    console.error('Exceção ao criar nova visita:', err);
    return { success: false, error: err?.message || 'Erro inesperado ao criar nova visita.' };
  }
}
