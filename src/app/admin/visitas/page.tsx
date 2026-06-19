'use client';

import React, { useState } from 'react';

// Tipagem de uma Visita Técnica
interface Visita {
  id: string;
  cliente: string;
  endereco: string;
  data: string;
  horario: string;
  status: 'Agendada' | 'Realizada' | 'Cancelada';
  material_usado: string[];
  valor_gasto: number;
  observacoes: string;
}

export default function DashboardVisitas() {
  // Dados simulados iniciais da agenda do técnico
  const [visitas, setVisitas] = useState<Visita[]>([
    {
      id: 'v1',
      cliente: 'Roberto Mendonça',
      endereco: 'Rua das Palmeiras, 405 - Cond. Royal - Curitiba',
      data: '2026-06-18', // Hoje
      horario: '09:00',
      status: 'Agendada',
      material_usado: ['Cabo Calefator 15W', 'Termostato Wifi Black'],
      valor_gasto: 150.00,
      observacoes: 'Instalação da malha radiante no banheiro da suíte master.'
    },
    {
      id: 'v2',
      cliente: 'Clarice Lispector',
      endereco: 'Av. Batel, 1200 - Apto 402 - Curitiba',
      data: '2026-06-18', // Hoje
      horario: '14:30',
      status: 'Agendada',
      material_usado: [],
      valor_gasto: 0,
      observacoes: 'Teste de carga elétrica e calibração dos sensores de piso.'
    },
    {
      id: 'v3',
      cliente: 'Julio Cortázar',
      endereco: 'Rua Desembargador Motta, 882 - Mercês',
      data: '2026-06-19', // Amanhã
      horario: '10:00',
      status: 'Agendada',
      material_usado: [],
      valor_gasto: 0,
      observacoes: 'Preparação do contrapiso e fixação das guias de isolamento.'
    },
    {
      id: 'v4',
      cliente: 'Gabriel García Márquez',
      endereco: 'Al. Julia da Costa, 150 - Cabral',
      data: '2026-06-21', // Próximos dias
      horario: '11:00',
      status: 'Agendada',
      material_usado: [],
      valor_gasto: 0,
      observacoes: 'Medição inicial e entrega técnica do kit de automação.'
    }
  ]);

  const [selectedVisita, setSelectedVisita] = useState<Visita | null>(null);
  const [materialInput, setMaterialInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Manipulação do modal
  const handleOpenModal = (visita: Visita) => {
    setSelectedVisita({ ...visita });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedVisita(null);
    setMaterialInput('');
    setIsModalOpen(false);
  };

  // Alteração de campos no formulário do modal
  const handleFieldChange = (field: keyof Visita, value: any) => {
    if (!selectedVisita) return;
    setSelectedVisita((prev) => prev ? { ...prev, [field]: value } : null);
  };

  // Adicionar tags de materiais
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisita || !materialInput.trim()) return;
    const novosMateriais = [...selectedVisita.material_usado, materialInput.trim()];
    handleFieldChange('material_usado', novosMateriais);
    setMaterialInput('');
  };

  const handleRemoveMaterial = (indexToRemove: number) => {
    if (!selectedVisita) return;
    const novosMateriais = selectedVisita.material_usado.filter((_, i) => i !== indexToRemove);
    handleFieldChange('material_usado', novosMateriais);
  };

  // Salvar edições da visita de volta na lista simulada (representando a mutation)
  const handleSaveVisita = () => {
    if (!selectedVisita) return;
    setVisitas((prev) =>
      prev.map((v) => (v.id === selectedVisita.id ? selectedVisita : v))
    );
    handleCloseModal();
  };

  // Filtragem e agrupamento de visitas por data (Hoje: 2026-06-18)
  const hojeStr = '2026-06-18';
  const amanhaStr = '2026-06-19';

  const visitasHoje = visitas.filter((v) => v.data === hojeStr);
  const visitasAmanha = visitas.filter((v) => v.data === amanhaStr);
  const visitasOutras = visitas.filter((v) => v.data !== hojeStr && v.data !== amanhaStr);

  // Cálculos de KPIs simples baseados na lista
  const totalHoje = visitasHoje.filter(v => v.status === 'Agendada').length;
  const materiaisPendentesCount = visitas.filter(v => v.material_usado.length === 0).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Header do Painel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        
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

        {/* KPI 3: Status Geral */}
        <div className="bg-slate-900 border border-slate-800/85 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute right-4 top-4 p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Taxa de Conclusão</p>
          <h3 className="text-3xl font-bold text-slate-100 mt-2">
            {visitas.length > 0 ? Math.round(((visitas.length - visitas.filter(v => v.status === 'Agendada').length) / visitas.length) * 100) : 0}%
          </h3>
          <p className="text-xs text-emerald-400 mt-1">Proporção de visitas executadas</p>
        </div>
      </div>

      {/* Agenda - Visualização em Linha do Tempo por Dia */}
      <div className="space-y-10">
        
        {/* HOJE */}
        <div>
          <div className="flex items-center gap-3 mb-4 border-b border-slate-900 pb-2">
            <h2 className="text-lg font-bold text-orange-400">Hoje</h2>
            <span className="text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
              {visitasHoje.length} agendamentos
            </span>
          </div>

          <div className="grid gap-4">
            {visitasHoje.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma visita agendada para hoje.</p>
            ) : (
              visitasHoje.map((v) => (
                <div
                  key={v.id}
                  onClick={() => handleOpenModal(v)}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-5 rounded-xl cursor-pointer transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-950 text-orange-400 border border-orange-500/20">
                        {v.horario}
                      </span>
                      <h4 className="font-bold text-slate-100 group-hover:text-orange-400 transition-colors">
                        {v.cliente}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {v.endereco}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      v.status === 'Realizada' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : v.status === 'Cancelada' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {v.status}
                    </span>
                    <svg className="w-5 h-5 text-slate-600 group-hover:text-slate-350 transition-colors hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AMANHÃ */}
        <div>
          <div className="flex items-center gap-3 mb-4 border-b border-slate-900 pb-2">
            <h2 className="text-lg font-bold text-slate-300">Amanhã</h2>
            <span className="text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
              {visitasAmanha.length} agendamentos
            </span>
          </div>

          <div className="grid gap-4">
            {visitasAmanha.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma visita agendada para amanhã.</p>
            ) : (
              visitasAmanha.map((v) => (
                <div
                  key={v.id}
                  onClick={() => handleOpenModal(v)}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 p-5 rounded-xl cursor-pointer transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-950 text-slate-400 border border-slate-800">
                        {v.horario}
                      </span>
                      <h4 className="font-bold text-slate-100 group-hover:text-orange-400 transition-colors">
                        {v.cliente}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {v.endereco}
                    </p>
                  </div>
                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      v.status === 'Realizada' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : v.status === 'Cancelada' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PRÓXIMOS DIAS */}
        <div>
          <div className="flex items-center gap-3 mb-4 border-b border-slate-900 pb-2">
            <h2 className="text-lg font-bold text-slate-400">Próximos Dias</h2>
          </div>

          <div className="grid gap-4">
            {visitasOutras.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma outra visita programada.</p>
            ) : (
              visitasOutras.map((v) => (
                <div
                  key={v.id}
                  onClick={() => handleOpenModal(v)}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 p-5 rounded-xl cursor-pointer transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-950 text-slate-500 border border-slate-800">
                        {v.data.split('-').reverse().slice(0, 2).join('/')} - {v.horario}
                      </span>
                      <h4 className="font-bold text-slate-100 group-hover:text-orange-400 transition-colors">
                        {v.cliente}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {v.endereco}
                    </p>
                  </div>
                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      v.status === 'Realizada' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : v.status === 'Cancelada' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Interativo de Detalhes da Visita (Preenchimento pelo Técnico) */}
      {isModalOpen && selectedVisita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Overlay Escuro */}
          <div onClick={handleCloseModal} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

          {/* Conteúdo do Modal */}
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
            
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-100">Atualizar Visita Técnica</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedVisita.cliente}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-500 hover:text-slate-350 transition-colors p-1 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body Modal / Formulário */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Status da Visita */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status do Serviço</label>
                <div className="flex gap-3">
                  {(['Agendada', 'Realizada', 'Cancelada'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleFieldChange('status', status)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                        selectedVisita.status === status
                          ? status === 'Realizada'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/5'
                            : status === 'Cancelada'
                            ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-md shadow-rose-500/5'
                            : 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md shadow-amber-500/5'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Materiais Usados (Tags) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Materiais Utilizados</label>
                
                {/* Lista de tags atuais */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedVisita.material_usado.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">Nenhum material adicionado ainda.</span>
                  ) : (
                    selectedVisita.material_usado.map((mat, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-md text-xs font-medium"
                      >
                        {mat}
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterial(i)}
                          className="text-slate-500 hover:text-rose-400 transition-colors ml-1 font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Input para adicionar material */}
                <form onSubmit={handleAddMaterial} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar material (ex: Cabo Térmico 20W)"
                    value={materialInput}
                    onChange={(e) => setMaterialInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-3 py-2 text-slate-200 outline-none transition-all text-sm"
                  />
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 px-4 rounded-lg font-medium text-sm transition-colors cursor-pointer"
                  >
                    Adicionar
                  </button>
                </form>
              </div>

              {/* Custos Extras / Valores */}
              <div className="space-y-2">
                <label htmlFor="valor_gasto" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Custos Extras / Despesas Adicionais (R$)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-500">R$</span>
                  <input
                    type="number"
                    id="valor_gasto"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={selectedVisita.valor_gasto || ''}
                    onChange={(e) => handleFieldChange('valor_gasto', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <label htmlFor="observacoes" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Observações de Campo / Relato Técnico</label>
                <textarea
                  id="observacoes"
                  rows={4}
                  placeholder="Relato detalhado da execução da visita, ocorrências ou pendências..."
                  value={selectedVisita.observacoes}
                  onChange={(e) => handleFieldChange('observacoes', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 outline-none transition-all text-sm resize-none"
                />
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-250 rounded-lg font-semibold text-sm transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveVisita}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-orange-500/10 cursor-pointer"
              >
                Salvar Relatório
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
