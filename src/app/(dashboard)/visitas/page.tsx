'use client';

import React, { useState } from 'react';
import { useVisitas } from '@/hooks/useVisitas';
import AgendaHeader from '@/components/crm/agenda-header';
import AgendaTimeline from '@/components/crm/agenda-timeline';
import ModalPreenchimentoVisita from '@/components/crm/modal-preenchimento-visita';
import { Visita } from '@/types/database.types';

// Dados simulados de fallback (para exibição caso o banco não esteja preenchido)
const MOCK_FALLBACK_VISITAS: Visita[] = [
  {
    id: 'v1',
    project_id: 'p1',
    data_visita: '2026-06-18', // Hoje
    horario: '09:00',
    status_visita: 'Agendada',
    material_usado: ['Cabo Calefator 15W', 'Termostato Wifi Black'],
    valor_gasto: 150.00,
    observacoes: 'Instalação da malha radiante no banheiro da suíte master.',
    criado_em: '2026-06-18T00:00:00Z',
    projects: {
      id: 'p1',
      lead_id: 'l1',
      status_projeto: 'Instalação',
      endereco: 'Rua das Palmeiras, 405 - Cond. Royal - Curitiba',
      valor_total: 12500,
      criado_em: '2026-06-10T00:00:00Z',
      leads: {
        id: 'l1',
        nome: 'Roberto Mendonça',
        email: 'roberto@email.com',
        telefone: '(41) 99999-1111',
        cidade: 'Curitiba',
        area_m2: 80,
        status: 'Qualificado',
        criado_em: '2026-06-08T00:00:00Z'
      }
    }
  },
  {
    id: 'v2',
    project_id: 'p2',
    data_visita: '2026-06-18', // Hoje
    horario: '14:30',
    status_visita: 'Agendada',
    material_usado: [],
    valor_gasto: 0,
    observacoes: 'Teste de carga elétrica e calibração dos sensores de piso.',
    criado_em: '2026-06-18T00:00:00Z',
    projects: {
      id: 'p2',
      lead_id: 'l2',
      status_projeto: 'Instalação',
      endereco: 'Av. Batel, 1200 - Apto 402 - Curitiba',
      valor_total: 8000,
      criado_em: '2026-06-12T00:00:00Z',
      leads: {
        id: 'l2',
        nome: 'Clarice Lispector',
        email: 'clarice@email.com',
        telefone: '(41) 99999-2222',
        cidade: 'Curitiba',
        area_m2: 45,
        status: 'Qualificado',
        criado_em: '2026-06-11T00:00:00Z'
      }
    }
  },
  {
    id: 'v3',
    project_id: 'p3',
    data_visita: '2026-06-19', // Amanhã
    horario: '10:00',
    status_visita: 'Agendada',
    material_usado: [],
    valor_gasto: 0,
    observacoes: 'Preparação do contrapiso e fixação das guias de isolamento.',
    criado_em: '2026-06-18T00:00:00Z',
    projects: {
      id: 'p3',
      lead_id: 'l3',
      status_projeto: 'Orçamento',
      endereco: 'Rua Desembargador Motta, 882 - Mercês',
      valor_total: 15400,
      criado_em: '2026-06-15T00:00:00Z',
      leads: {
        id: 'l3',
        nome: 'Julio Cortázar',
        email: 'julio@email.com',
        telefone: '(41) 99999-3333',
        cidade: 'Curitiba',
        area_m2: 110,
        status: 'Qualificado',
        criado_em: '2026-06-14T00:00:00Z'
      }
    }
  },
  {
    id: 'v4',
    project_id: 'p4',
    data_visita: '2026-06-21', // Próximos dias
    horario: '11:00',
    status_visita: 'Agendada',
    material_usado: [],
    valor_gasto: 0,
    observacoes: 'Medição inicial e entrega técnica do kit de automação.',
    criado_em: '2026-06-18T00:00:00Z',
    projects: {
      id: 'p4',
      lead_id: 'l4',
      status_projeto: 'Orçamento',
      endereco: 'Al. Julia da Costa, 150 - Cabral',
      valor_total: 9800,
      criado_em: '2026-06-16T00:00:00Z',
      leads: {
        id: 'l4',
        nome: 'Gabriel García Márquez',
        email: 'gabriel@email.com',
        telefone: '(41) 99999-4444',
        cidade: 'Curitiba',
        area_m2: 60,
        status: 'Qualificado',
        criado_em: '2026-06-15T00:00:00Z'
      }
    }
  }
];

export default function DashboardVisitas() {
  const { visitas: dbVisitas, isLoading, updateVisita, isUpdating } = useVisitas();
  const [selectedVisita, setSelectedVisita] = useState<Visita | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fallback local caso o banco esteja vazio
  const [localVisitasFallback, setLocalVisitasFallback] = useState<Visita[]>(MOCK_FALLBACK_VISITAS);

  // Decide qual lista de visitas utilizar (banco se houver dados, senão fallback simulado)
  const isDbConfigured = dbVisitas.length > 0;
  const listVisitas = isDbConfigured ? dbVisitas : localVisitasFallback;

  const handleOpenModal = (visita: Visita) => {
    setSelectedVisita(visita);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedVisita(null);
    setIsModalOpen(false);
  };

  const handleSaveReport = async (id: string, updates: Partial<Visita>) => {
    if (isDbConfigured) {
      // Caso o Supabase esteja ativo, executa a mutação
      await updateVisita({ id, updates });
    } else {
      // Caso contrário, atualiza o estado local para manter a interatividade do mockup
      setLocalVisitasFallback((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
      );
    }
  };

  // Cálculos de KPIs baseados na lista atual
  const hojeStr = '2026-06-18';
  const visitasHoje = listVisitas.filter((v) => v.data_visita === hojeStr);
  const totalHoje = visitasHoje.filter((v) => v.status_visita === 'Agendada').length;
  const materiaisPendentesCount = listVisitas.filter((v) => !v.material_usado || v.material_usado.length === 0).length;
  
  const visitasExecutadas = listVisitas.filter((v) => v.status_visita !== 'Agendada').length;
  const taxaConclusao = listVisitas.length > 0 ? Math.round((visitasExecutadas / listVisitas.length) * 100) : 0;

  if (isLoading && isDbConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-slate-400">Carregando cronograma...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Componente KPIs e Cabeçalho */}
        <AgendaHeader
          totalHoje={totalHoje}
          materiaisPendentesCount={materiaisPendentesCount}
          taxaConclusao={taxaConclusao}
        />

        {/* Componente Timeline por Dias */}
        <AgendaTimeline
          visitas={listVisitas}
          onOpenModal={handleOpenModal}
        />

        {/* Componente Modal de Preenchimento Técnico */}
        <ModalPreenchimentoVisita
          isOpen={isModalOpen}
          visita={selectedVisita}
          onClose={handleCloseModal}
          onSave={handleSaveReport}
          isSaving={isUpdating}
        />
      </div>
    </div>
  );
}
