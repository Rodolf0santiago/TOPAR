'use client';

import React from 'react';
import Link from 'next/link';
import { useVisitas } from '@/hooks/useVisitas';
import { useLeads } from '@/hooks/useLeads';
import { useProjects } from '@/hooks/useProjects';
import { Lead, Project, Visita } from '@/types/database.types';

// ─── Dados Mock ──────────────────────────────────────────────────────────────

const MOCK_LEADS: Lead[] = [
  { id: 'l1', nome: 'Roberto Mendonça', email: 'roberto@email.com', telefone: '(41) 99999-1111', cidade: 'Curitiba', area_m2: 80, status: 'Qualificado', criado_em: '2026-06-08T14:30:00Z' },
  { id: 'l2', nome: 'Clarice Lispector', email: 'clarice@email.com', telefone: '(41) 99999-2222', cidade: 'Curitiba', area_m2: 45, status: 'Novo', criado_em: '2026-06-11T09:15:00Z' },
  { id: 'l3', nome: 'Julio Cortázar', email: 'julio@email.com', telefone: '(41) 99999-3333', cidade: 'Curitiba', area_m2: 110, status: 'Em Contato', criado_em: '2026-06-14T11:00:00Z' },
  { id: 'l4', nome: 'Gabriel García Márquez', email: 'gabriel@email.com', telefone: '(41) 99999-4444', cidade: 'Curitiba', area_m2: 60, status: 'Novo', criado_em: '2026-06-15T16:20:00Z' },
  { id: 'l5', nome: 'Jorge Luis Borges', email: 'borges@email.com', telefone: '(11) 98888-5555', cidade: 'São Paulo', area_m2: 150, status: 'Perdido', criado_em: '2026-06-05T10:00:00Z' },
  { id: 'l6', nome: 'Machado de Assis', email: 'machado@email.com', telefone: '(21) 97777-6666', cidade: 'Rio de Janeiro', area_m2: 95, status: 'Novo', criado_em: '2026-06-16T18:45:00Z' },
];

const MOCK_PROJECTS: Project[] = [
  { id: 'p1', lead_id: 'l1', status_projeto: 'Instalação', endereco: 'Rua das Palmeiras, 405 - Cond. Royal', valor_total: 12500, criado_em: '2026-06-10T00:00:00Z', leads: MOCK_LEADS[0] },
  { id: 'p2', lead_id: 'l2', status_projeto: 'Preparação', endereco: 'Av. Batel, 1200 - Apto 402', valor_total: 8000, criado_em: '2026-06-12T00:00:00Z', leads: MOCK_LEADS[1] },
  { id: 'p3', lead_id: 'l3', status_projeto: 'Orçamento', endereco: 'Rua Desembargador Motta, 882 - Mercês', valor_total: 15400, criado_em: '2026-06-15T00:00:00Z', leads: MOCK_LEADS[2] },
  { id: 'p4', lead_id: 'l4', status_projeto: 'Teste de Carga', endereco: 'Al. Julia da Costa, 150 - Cabral', valor_total: 9800, criado_em: '2026-06-16T00:00:00Z', leads: MOCK_LEADS[3] },
];

const MOCK_VISITAS: Visita[] = [
  { id: 'v1', project_id: 'p1', data_visita: '2026-06-18', horario: '09:00', status_visita: 'Agendada', material_usado: ['Cabo Calefator 15W'], valor_gasto: 150, observacoes: 'Instalação da malha radiante - suíte master.', criado_em: '2026-06-18T00:00:00Z', projects: { ...MOCK_PROJECTS[0], leads: MOCK_LEADS[0] } },
  { id: 'v2', project_id: 'p2', data_visita: '2026-06-18', horario: '14:30', status_visita: 'Agendada', material_usado: [], valor_gasto: 0, observacoes: 'Teste de carga elétrica e calibração dos sensores.', criado_em: '2026-06-18T00:00:00Z', projects: { ...MOCK_PROJECTS[1], leads: MOCK_LEADS[1] } },
  { id: 'v3', project_id: 'p3', data_visita: '2026-06-19', horario: '10:00', status_visita: 'Agendada', material_usado: [], valor_gasto: 0, observacoes: 'Preparação do contrapiso.', criado_em: '2026-06-18T00:00:00Z', projects: { ...MOCK_PROJECTS[2], leads: MOCK_LEADS[2] } },
  { id: 'v4', project_id: 'p4', data_visita: '2026-06-21', horario: '11:00', status_visita: 'Agendada', material_usado: [], valor_gasto: 0, observacoes: 'Medição inicial e entrega técnica.', criado_em: '2026-06-18T00:00:00Z', projects: { ...MOCK_PROJECTS[3], leads: MOCK_LEADS[3] } },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string) {
  const parts = dateStr.split('-');
  return `${parts[2]}/${parts[1]}`;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function DashboardHome() {
  const { visitas: dbVisitas } = useVisitas();
  const { leads: dbLeads } = useLeads();
  const { projects: dbProjects } = useProjects();

  const leads = dbLeads.length > 0 ? dbLeads : MOCK_LEADS;
  const projects = dbProjects.length > 0 ? dbProjects : MOCK_PROJECTS;
  const visitas = dbVisitas.length > 0 ? dbVisitas : MOCK_VISITAS;

  // KPIs
  const hojeStr = '2026-06-18';
  const totalLeads = leads.length;
  const leadsNovos = leads.filter((l) => l.status === 'Novo').length;
  const emAndamento = projects.filter((p) =>
    ['Preparação', 'Instalação', 'Teste de Carga'].includes(p.status_projeto)
  ).length;
  const faturamento = projects.reduce((acc, p) => acc + p.valor_total, 0);
  const visitasHoje = visitas.filter((v) => v.data_visita === hojeStr && v.status_visita === 'Agendada').length;
  const taxaConclusao = visitas.length > 0
    ? Math.round((visitas.filter((v) => v.status_visita === 'Realizada').length / visitas.length) * 100)
    : 0;

  // Próximas visitas ordenadas por data/horário
  const proximasVisitas = [...visitas]
    .sort((a, b) => `${a.data_visita}${a.horario}`.localeCompare(`${b.data_visita}${b.horario}`))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Visão Geral
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-slate-100">
              Central OKKA
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Resumo operacional de piso radiante — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">Sistema Ativo</span>
          </div>
        </div>

        {/* ── KPI Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Leads */}
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
            <div className="absolute right-0 top-0 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              {leadsNovos > 0 && (
                <span className="text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/20 px-1.5 py-0.5 rounded-full">
                  +{leadsNovos} novos
                </span>
              )}
            </div>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-3">{totalLeads}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Total de Leads</p>
          </div>

          {/* Projetos em Andamento */}
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300">
            <div className="absolute right-0 top-0 w-20 h-20 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl w-fit">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-3">{emAndamento}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Obras em Andamento</p>
          </div>

          {/* Faturamento */}
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
            <div className="absolute right-0 top-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl w-fit">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-amber-400 mt-3 leading-tight">{formatCurrency(faturamento)}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Faturamento Total</p>
          </div>

          {/* Visitas Hoje */}
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              {visitasHoje > 0 && (
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              )}
            </div>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-3">{visitasHoje}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Visitas Hoje</p>
          </div>
        </div>

        {/* ── Conteúdo Principal (2 colunas) ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Próximas Visitas ─────────────────────────────────── */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-100">Próximas Visitas</h2>
                <p className="text-[10px] text-slate-500 mt-0.5">Agenda técnica dos próximos dias</p>
              </div>
              <Link
                href="/visitas"
                className="text-[10px] font-bold text-orange-400 hover:text-orange-300 transition-colors border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 px-2.5 py-1 rounded-lg"
              >
                Ver Tudo →
              </Link>
            </div>
            <div className="divide-y divide-slate-800/60">
              {proximasVisitas.length === 0 ? (
                <p className="p-6 text-sm text-slate-500 italic">Nenhuma visita agendada.</p>
              ) : (
                proximasVisitas.map((v) => {
                  const nome = v.projects?.leads?.nome || v.cliente || '—';
                  const endereco = v.projects?.endereco || v.endereco || '—';
                  const isHoje = v.data_visita === hojeStr;
                  return (
                    <div key={v.id} className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors">
                      {/* Badge de data/hora */}
                      <div className="shrink-0 text-center min-w-[48px]">
                        <span className={`text-[10px] font-extrabold block rounded px-1.5 py-0.5 ${isHoje ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800 text-slate-400'}`}>
                          {isHoje ? 'HOJE' : formatDate(v.data_visita)}
                        </span>
                        <span className="text-xs font-mono text-slate-300 mt-1 block">{v.horario.substring(0, 5)}</span>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-100 truncate">{nome}</p>
                        <p className="text-[10px] text-slate-500 truncate">{endereco}</p>
                      </div>
                      {/* Status */}
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        v.status_visita === 'Realizada'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : v.status_visita === 'Cancelada'
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {v.status_visita}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Coluna Direita: Atalhos + Mini Stats ───────────────── */}
          <div className="flex flex-col gap-5">

            {/* Atalhos Rápidos */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-100 mb-4">Acessos Rápidos</h2>
              <div className="space-y-2.5">
                <Link href="/leads" className="flex items-center gap-3 p-3 bg-slate-950/80 border border-slate-800 hover:border-blue-500/30 rounded-xl transition-all group">
                  <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-200">Gestão de Leads</p>
                    <p className="text-[9px] text-slate-500">{leadsNovos} novos aguardando</p>
                  </div>
                  <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link href="/projetos" className="flex items-center gap-3 p-3 bg-slate-950/80 border border-slate-800 hover:border-orange-500/30 rounded-xl transition-all group">
                  <div className="p-1.5 bg-orange-500/10 text-orange-400 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-200">Kanban de Projetos</p>
                    <p className="text-[9px] text-slate-500">{emAndamento} obras em andamento</p>
                  </div>
                  <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link href="/visitas" className="flex items-center gap-3 p-3 bg-slate-950/80 border border-slate-800 hover:border-emerald-500/30 rounded-xl transition-all group">
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-200">Visitas Técnicas</p>
                    <p className="text-[9px] text-slate-500">{visitasHoje} visitas hoje</p>
                  </div>
                  <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Mini Stats de Eficiência */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-100">Eficiência do Time</h2>

              {/* Barra de progresso: Taxa de Conclusão */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Taxa de Conclusão</span>
                  <span className="text-xs font-extrabold text-emerald-400">{taxaConclusao}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${taxaConclusao}%` }}
                  />
                </div>
              </div>

              {/* Distribuição de status dos leads */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Pipeline de Leads</span>
                {(['Novo', 'Em Contato', 'Qualificado', 'Perdido'] as const).map((s) => {
                  const count = leads.filter((l) => l.status === s).length;
                  const pct = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
                  const colors: Record<string, string> = { Novo: 'bg-blue-500', 'Em Contato': 'bg-amber-500', Qualificado: 'bg-emerald-500', Perdido: 'bg-rose-500' };
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 w-20 shrink-0">{s}</span>
                      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[s]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 w-4 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
