'use server';

import { createServerClient } from '@/lib/supabase';
import { Visita } from '@/types/database.types';

export async function getGroupedVisitas() {
  const supabase = createServerClient();

  // Buscar todas as visitas incluindo joins necessários
  const { data, error } = await supabase
    .from('visits')
    .select('*, projects(*, leads(*)), responsaveis_tecnicos(*)')
    .order('data_visita', { ascending: true })
    .order('horario', { ascending: true });

  if (error) {
    console.error('Erro ao buscar visitas no banco:', error);
    throw new Error(error.message || 'Erro ao carregar cronograma de visitas.');
  }

  const visits = (data || []) as unknown as Visita[];

  // Obter datas corretas no fuso horário do Brasil (America/Sao_Paulo)
  const now = new Date();
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

  const hojeStr = formatTZ(now);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const amanhaStr = formatTZ(tomorrow);

  // Agrupamento baseado nas datas do servidor (evitando fuso horário cliente)
  const atrasadas = visits.filter(v => v.data_visita < hojeStr && v.status_visita === 'Agendada');
  const hoje = visits.filter(v => v.data_visita === hojeStr);
  const amanha = visits.filter(v => v.data_visita === amanhaStr);
  const proximas = visits.filter(v => v.data_visita > amanhaStr);

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
