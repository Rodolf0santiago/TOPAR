'use server';

import { createServerClient } from '@/lib/supabase';
import { ResponsavelTecnico } from '@/types/database.types';

export async function createResponsavelTecnico(data: {
  nome: string;
  telefone: string;
  email: string;
}): Promise<ResponsavelTecnico> {
  // Validações básicas dos dados recebidos
  if (!data.nome.trim() || !data.telefone.trim() || !data.email.trim()) {
    throw new Error('Todos os campos (Nome, Telefone e E-mail) são obrigatórios.');
  }

  const supabase = createServerClient();

  const { data: result, error } = await supabase
    .from('responsaveis_tecnicos')
    .insert([
      {
        nome: data.nome.trim(),
        telefone: data.telefone.trim(),
        email: data.email.trim(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir responsável técnico no Supabase:', error);
    throw new Error(error.message || 'Falha ao salvar responsável técnico.');
  }

  return result;
}
