'use server';

import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export interface CriarMembroEquipeDados {
  nome_completo: string;
  email: string;
  telefone: string;
  role: 'vendedor' | 'instalador';
}

export interface MembroEquipe {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  role: 'vendedor' | 'instalador';
  status_acesso: boolean;
  created_at: string;
}

/**
 * Valida se o usuário autenticado que está realizando a requisição
 * possui permissões administrativas (mestre ou admin).
 */
async function validarAcessoAdmin(supabaseAdmin: ReturnType<typeof createServerClient>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;

  if (!token) {
    throw new Error('Não autorizado: Sessão ausente.');
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    throw new Error('Não autorizado: Sessão inválida.');
  }

  // 1. Ler empresa_id ativa do JWT (injetada pelo selecionarEmpresa)
  const jwtEmpresaId = user.user_metadata?.empresa_id as string | undefined;
  const jwtRole     = user.user_metadata?.role as string | undefined;

  let profileRole: string | null = jwtRole || null;
  let profileEmpresaId: string | null = jwtEmpresaId || null;
  let profileStatusAcesso: boolean = true;

  if (jwtEmpresaId) {
    // 2. Confirmar role/status via empresa_membros (fonte de verdade para N:N)
    const { data: membro } = await supabaseAdmin
      .from('empresa_membros')
      .select('role, status_acesso')
      .eq('user_id', user.id)
      .eq('empresa_id', jwtEmpresaId)
      .maybeSingle();

    if (membro) {
      profileRole         = membro.role;
      profileStatusAcesso = membro.status_acesso;
    }
  } else {
    // 3. Fallback: perfis_usuarios (compatibilidade com sessões legadas)
    const { data: perfilUsuario, error: perfilError } = await supabaseAdmin
      .from('perfis_usuarios')
      .select('role, empresa_id, status_acesso')
      .eq('id', user.id)
      .single();

    if (perfilError || !perfilUsuario) {
      throw new Error('Acesso negado: Perfil de usuário não encontrado.');
    }
    profileRole         = perfilUsuario.role;
    profileEmpresaId    = perfilUsuario.empresa_id;
    profileStatusAcesso = perfilUsuario.status_acesso;
  }

  if (profileStatusAcesso === false) {
    throw new Error('Acesso negado: Seu usuário está bloqueado.');
  }

  const normalizedRole = (profileRole || '').toLowerCase();
  if (normalizedRole !== 'admin' && normalizedRole !== 'mestre' && normalizedRole !== 'super_admin') {
    throw new Error('Acesso negado: Permissão restrita a administradores e mestres.');
  }

  return { user, empresa_id: profileEmpresaId };
}

/**
 * Server Action segura para criar e provisionar contas de funcionários.
 * Utiliza o cliente com a SERVICE_ROLE_KEY para chamar a API administrativa.
 */
export async function criarMembroEquipe(dados: CriarMembroEquipeDados): Promise<MembroEquipe> {
  // 1. Validações iniciais de presença de dados
  if (!dados.nome_completo.trim()) {
    throw new Error('O nome completo do funcionário é obrigatório.');
  }
  if (!dados.email.trim()) {
    throw new Error('O e-mail corporativo é obrigatório.');
  }
  if (!dados.telefone.trim()) {
    throw new Error('O número do WhatsApp é obrigatório.');
  }
  if (!dados.role || (dados.role !== 'vendedor' && dados.role !== 'instalador')) {
    throw new Error('Nível de acesso inválido. Escolha "vendedor" ou "instalador".');
  }

  const emailFormatado = dados.email.trim().toLowerCase();
  const nomeFormatado = dados.nome_completo.trim();
  const telefoneFormatado = dados.telefone.trim();
  const roleFormatada = dados.role;

  // 2. Inicializar o cliente com a service role key do servidor
  const supabaseAdmin = createServerClient();

  // 3. Validar se o requisitante tem autorização
  const adminInfo = await validarAcessoAdmin(supabaseAdmin);
  const empresaId = adminInfo.empresa_id;

  // 4. Provisionar o usuário no Supabase Auth usando inviteUserByEmail.
  // Isso dispara o convite por e-mail para que ele defina sua senha sem
  // deslogar o gerente/administrador da sessão atual.
  const { data: authUser, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    emailFormatado,
    {
      data: {
        name: nomeFormatado,
        nome_completo: nomeFormatado,
        role: roleFormatada,
        telefone: telefoneFormatado,
        empresa_id: empresaId,
      },
    }
  );

  if (inviteError) {
    console.error('Erro ao criar convite de usuário no Auth:', inviteError);

    // ── CASO N:N: e-mail já existe globalmente em outra empresa ──────────────
    if (inviteError.message.includes('already exists') || (inviteError as any).status === 422) {
      // Buscar o user_id existente pelo e-mail
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(
        (u) => u.email?.toLowerCase() === emailFormatado
      );

      if (existingUser) {
        // Verificar se já é membro desta empresa
        const { data: membroExistente } = await supabaseAdmin
          .from('empresa_membros')
          .select('user_id')
          .eq('user_id', existingUser.id)
          .eq('empresa_id', empresaId)
          .maybeSingle();

        if (membroExistente) {
          throw new Error('Este e-mail já pertence a esta empresa.');
        }

        // Criar apenas o vínculo N:N — sem duplicar no Auth
        const { error: membroErr } = await supabaseAdmin
          .from('empresa_membros')
          .insert({
            user_id:       existingUser.id,
            empresa_id:    empresaId,
            role:          roleFormatada,
            status_acesso: true,
          });

        if (membroErr) {
          throw new Error('Erro ao vincular usuário existente a esta empresa: ' + membroErr.message);
        }

        // Buscar o perfil existente para retornar ao chamador
        const { data: perfilExistente } = await supabaseAdmin
          .from('perfis_usuarios')
          .select('nome_completo, email, created_at')
          .eq('id', existingUser.id)
          .single();

        return {
          id:           existingUser.id,
          nome_completo: perfilExistente?.nome_completo || existingUser.email || '',
          email:         existingUser.email || emailFormatado,
          telefone:      telefoneFormatado,
          role:          roleFormatada,
          status_acesso: true,
          created_at:    perfilExistente?.created_at || new Date().toISOString(),
        } as MembroEquipe;
      }

      throw new Error('Este e-mail já está cadastrado e não pôde ser localizado.');
    }

    throw new Error(inviteError.message || 'Erro ao criar conta de acesso.');
  }

  if (!authUser.user) {
    throw new Error('Erro ao gerar a conta de acesso para o funcionário.');
  }

  const novoId = authUser.user.id;

  // 5. Inserir dados na tabela pública de perfis.
  // Tentamos primeiro na tabela 'perfis' que é a solicitada originalmente pelo usuário.
  let resultadoSalvo: any = null;
  
  const { data: perfilData, error: perfilError } = await supabaseAdmin
    .from('perfis')
    .insert([
      {
        id: novoId,
        nome: nomeFormatado,
        nome_completo: nomeFormatado,
        telefone: telefoneFormatado,
        role: roleFormatada,
        email: emailFormatado,
        empresa_id: empresaId,
      }
    ])
    .select()
    .single();

  if (perfilError) {
    console.warn('Aviso: Falha ao inserir na tabela perfis, tentando fallback para perfis_usuarios:', perfilError.message);
    
    // Fallback: Tentamos inserir na tabela 'perfis_usuarios'
    // Como 'perfis_usuarios' não possui coluna de telefone na migração IAM, omitimos.
    const { data: perfilUsuarioData, error: perfilUsuarioError } = await supabaseAdmin
      .from('perfis_usuarios')
      .insert([
        {
          id: novoId,
          nome_completo: nomeFormatado,
          email: emailFormatado,
          role: roleFormatada,
          status_acesso: true,
          empresa_id: empresaId,
        }
      ])
      .select()
      .single();

    if (perfilUsuarioError) {
      console.error('Erro ao inserir também na tabela de fallback perfis_usuarios:', perfilUsuarioError);
      
      // Rollback do usuário criado no auth para evitar inconsistências
      try {
        await supabaseAdmin.auth.admin.deleteUser(novoId);
      } catch (delError) {
        console.error('Erro no rollback do usuário auth:', delError);
      }
      throw new Error(perfilUsuarioError.message || 'Falha ao salvar perfil do funcionário no banco de dados.');
    } else {
      resultadoSalvo = {
        id: novoId,
        nome_completo: perfilUsuarioData.nome_completo,
        email: perfilUsuarioData.email,
        telefone: telefoneFormatado, // Preserva o telefone informado no formulário
        role: roleFormatada, // Preserva a role real informada no formulário
        status_acesso: perfilUsuarioData.status_acesso,
        created_at: perfilUsuarioData.created_at,
      };
    }
  } else {
    resultadoSalvo = {
      id: novoId,
      nome_completo: perfilData.nome_completo || perfilData.nome || nomeFormatado,
      email: perfilData.email || emailFormatado,
      telefone: perfilData.telefone || telefoneFormatado,
      role: perfilData.role || roleFormatada,
      status_acesso: perfilData.status_acesso ?? true,
      created_at: perfilData.created_at || new Date().toISOString(),
    };
  }

  // 6. Se for instalador, inserir também na tabela 'responsaveis_tecnicos' para que apareça na agenda
  if (roleFormatada === 'instalador') {
    const { error: rtError } = await supabaseAdmin
      .from('responsaveis_tecnicos')
      .insert({
        id: novoId,
        nome: nomeFormatado,
        telefone: telefoneFormatado,
        email: emailFormatado,
        empresa_id: empresaId,
      });

    if (rtError) {
      console.error('Erro ao inserir em responsaveis_tecnicos no criarMembroEquipe:', rtError);
    }
  }

  // 7. Garantir vínculo em empresa_membros (N:N)
  //    O trigger handle_new_user já deve ter inserido, mas garantimos aqui.
  await supabaseAdmin
    .from('empresa_membros')
    .upsert({
      user_id:       novoId,
      empresa_id:    empresaId,
      role:          roleFormatada,
      status_acesso: true,
    }, { onConflict: 'user_id,empresa_id' });

  return resultadoSalvo as MembroEquipe;
}
