import React from 'react';

interface AgendaHeaderProps {
  totalHoje: number;
  materiaisPendentesCount: number;
  taxaConclusao: number;
}

export default function AgendaHeader({
  totalHoje,
  materiaisPendentesCount,
  taxaConclusao,
}: AgendaHeaderProps) {
  return (
    <div className="space-y-8">
      {/* Header do Painel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Cronograma de Visitas</h1>
          <p className="text-sm text-slate-400 mt-1">Gestão de campo e registros técnicos em tempo real.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold px-3 py-1.5 border border-slate-800 rounded bg-slate-900">
            Painel Técnico
          </span>
        </div>
      </div>

      {/* Grid de KPIs Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* KPI 1: Visitas Hoje */}
        <div className="bg-slate-900 border border-slate-800/85 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute right-4 top-4 p-2 bg-orange-500/10 text-orange-400 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Serviços Hoje</p>
          <h3 className="text-3xl font-bold text-slate-100 mt-2">{totalHoje}</h3>
          <p className="text-xs text-orange-400 mt-1">Pendentes de execução no dia</p>
        </div>

        {/* KPI 2: Materiais Pendentes */}
        <div className="bg-slate-900 border border-slate-800/85 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute right-4 top-4 p-2 bg-amber-500/10 text-amber-400 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Materiais Pendentes</p>
          <h3 className="text-3xl font-bold text-slate-100 mt-2">{materiaisPendentesCount}</h3>
          <p className="text-xs text-amber-400 mt-1">Visitas sem relatório de materiais</p>
        </div>

        {/* KPI 3: Taxa de Conclusão */}
        <div className="bg-slate-900 border border-slate-800/85 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute right-4 top-4 p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Taxa de Conclusão</p>
          <h3 className="text-3xl font-bold text-slate-100 mt-2">{taxaConclusao}%</h3>
          <p className="text-xs text-emerald-400 mt-1">Proporção de visitas executadas</p>
        </div>
      </div>
    </div>
  );
}
