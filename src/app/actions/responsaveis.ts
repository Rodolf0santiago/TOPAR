'use server';

import { createServerClient } from '@/lib/supabase';
import { ResponsavelTecnico } from '@/types/database.types';

export async function createResponsavelTecnico(
  data: {
    nome: string;
    telefone: string;
    email: string;
  },
  token?: string
): Promise<ResponsavelTecnico> {
  // 1. Validações básicas dos dados recebidos
  if (!data.nome.trim() || !data.telefone.trim() || !data.email.trim()) {
    throw new Error('Todos os campos (Nome, Telefone e E-mail) são obrigatórios.');
  }

  const supabaseAdmin = createServerClient();

  // 2. Se um token foi fornecido, validamos a identidade e a role de admin do chamador
  if (token) {
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Não autorizado: Sessão inválida ou expirada.');
    }

    // Verificar se a role é 'admin' na tabela profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      throw new Error('Acesso negado: Apenas administradores podem cadastrar responsáveis técnicos.');
    }
  }

  // 3. Criar o usuário no auth.users usando a API de Admin
  const defaultPassword = 'OkkaTeam2026!';
  
  const { data: authUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email.trim(),
    password: defaultPassword,
    email_confirm: true,
    user_metadata: {
      name: data.nome.trim(),
      role: 'tecnico',
    },
  });

  if (createUserError) {
    console.error('Erro ao criar usuário no auth.users:', createUserError);
    if (createUserError.message.includes('already exists') || createUserError.status === 422) {
      throw new Error('Este e-mail já está cadastrado no sistema.');
    }
    throw new Error(createUserError.message || 'Erro ao criar usuário de acesso.');
  }

  if (!authUser.user) {
    throw new Error('Erro ao gerar usuário de acesso.');
  }

  // 4. Inserir dados na tabela responsaveis_tecnicos com o ID retornado
  const { data: result, error: insertError } = await supabaseAdmin
    .from('responsaveis_tecnicos')
    .insert([
      {
        id: authUser.user.id,
        nome: data.nome.trim(),
        telefone: data.telefone.trim(),
        email: data.email.trim(),
      },
    ])
    .select()
    .single();

  if (insertError) {
    console.error('Erro ao inserir responsável técnico:', insertError);
    // Rollback do usuário criado se a inserção na tabela pública falhar
    try {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    } catch (deleteError) {
      console.error('Erro ao fazer rollback do usuário:', deleteError);
    }
    throw new Error(insertError.message || 'Falha ao salvar responsável técnico no banco de dados.');
  }

  return result;
}
