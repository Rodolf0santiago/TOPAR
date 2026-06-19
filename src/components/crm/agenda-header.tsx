import React from 'react';

interface AgendaHeaderProps {
  totalHoje: number;
  materiaisPendentesCount: number;
  taxaConclusao: number;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  onAgendarClick: () => void;
}

export default function AgendaHeader({
  totalHoje,
  materiaisPendentesCount,
  taxaConclusao,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onAgendarClick,
}: AgendaHeaderProps) {
  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Painel de Campo
          </span>
          <h1 className="text-3xl font-black tracking-tight mt-2 text-gray-900">Visitas Técnicas</h1>
          <p className="text-sm text-gray-500 mt-1">Controle de ativações de piso radiante e testes de carga.</p>
        </div>
        <button
          onClick={onAgendarClick}
          className="bg-orange-500 hover:bg-orange-600 text-white font-black text-sm px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center gap-2 self-start md:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Agendar Visita
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* KPI 1: Visitas Hoje */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            {totalHoje > 0 && <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />}
          </div>
          <h3 className="text-3xl font-black text-gray-900 mt-3">{totalHoje}</h3>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1">Agendados Hoje</p>
          <p className="text-[10px] text-orange-500 mt-1 font-semibold">Serviços pendentes de ativação</p>
        </div>

        {/* KPI 2: Materiais Pendentes */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 w-fit">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-3xl font-black text-gray-900 mt-3">{materiaisPendentesCount}</h3>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1">Materiais Pendentes</p>
          <p className="text-[10px] text-amber-500 mt-1 font-semibold">Visitas sem relatório de insumos</p>
        </div>

        {/* KPI 3: Taxa de Conclusão */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500 w-fit">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-3xl font-black text-gray-900 mt-3">{taxaConclusao}%</h3>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1">Taxa de Eficiência</p>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
              style={{ width: `${taxaConclusao}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por cliente ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all"
          />
        </div>

        <div className="flex gap-1.5 p-1.5 bg-gray-100 rounded-xl w-full md:w-auto overflow-x-auto">
          {['Todas', 'Agendada', 'Realizada', 'Cancelada'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                statusFilter === status
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
