'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/types/database.types';

interface ModalAgendamentoVisitaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (visita: {
    project_id: string;
    data_visita: string;
    horario: string;
    status_visita: 'Agendada';
    observacoes: string;
    cliente?: string;
    endereco?: string;
  }) => Promise<void>;
  isSaving: boolean;
}

// Usa sempre a data real do sistema
function getTodayStr() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Formata YYYY-MM-DD → DD/MM/YYYY para exibição
function formatDisplayDate(val: string) {
  if (!val) return '';
  const [y, m, d] = val.split('-');
  return `${d}/${m}/${y}`;
}

// Fallback local de projetos (usado se o banco estiver vazio)
const MOCK_FALLBACK_PROJECTS: Project[] = [
  {
    id: 'p1', lead_id: 'l1', status_projeto: 'Instalação',
    endereco: 'Rua das Palmeiras, 405 - Cond. Royal - Curitiba', valor_total: 12500,
    criado_em: '2026-06-10T00:00:00Z',
    leads: { id: 'l1', nome: 'Roberto Mendonça', email: 'roberto@email.com', telefone: '(41) 99999-1111', cidade: 'Curitiba', area_m2: 80, status: 'Qualificado', criado_em: '2026-06-08T00:00:00Z' }
  },
  {
    id: 'p2', lead_id: 'l2', status_projeto: 'Instalação',
    endereco: 'Av. Batel, 1200 - Apto 402 - Curitiba', valor_total: 8000,
    criado_em: '2026-06-12T00:00:00Z',
    leads: { id: 'l2', nome: 'Clarice Lispector', email: 'clarice@email.com', telefone: '(41) 99999-2222', cidade: 'Curitiba', area_m2: 45, status: 'Qualificado', criado_em: '2026-06-11T00:00:00Z' }
  },
  {
    id: 'p3', lead_id: 'l3', status_projeto: 'Orçamento',
    endereco: 'Rua Desembargador Motta, 882 - Mercês', valor_total: 15400,
    criado_em: '2026-06-15T00:00:00Z',
    leads: { id: 'l3', nome: 'Julio Cortázar', email: 'julio@email.com', telefone: '(41) 99999-3333', cidade: 'Curitiba', area_m2: 110, status: 'Qualificado', criado_em: '2026-06-14T00:00:00Z' }
  },
  {
    id: 'p4', lead_id: 'l4', status_projeto: 'Orçamento',
    endereco: 'Al. Julia da Costa, 150 - Cabral', valor_total: 9800,
    criado_em: '2026-06-16T00:00:00Z',
    leads: { id: 'l4', nome: 'Gabriel García Márquez', email: 'gabriel@email.com', telefone: '(41) 99999-4444', cidade: 'Curitiba', area_m2: 60, status: 'Qualificado', criado_em: '2026-06-15T00:00:00Z' }
  }
];

export default function ModalAgendamentoVisita({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: ModalAgendamentoVisitaProps) {
  const { projects: dbProjects, isLoading: isLoadingProjects } = useProjects();

  const [projectId, setProjectId] = useState('');
  const [dataVisita, setDataVisita] = useState(getTodayStr);
  const [horario, setHorario] = useState('09:00');
  const [observacoes, setObservacoes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Refs para acionar o picker nativo diretamente
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const projects = dbProjects.length > 0 ? dbProjects : MOCK_FALLBACK_PROJECTS;

  // Reseta o formulário ao abrir
  useEffect(() => {
    if (isOpen) {
      setProjectId(projects.length > 0 ? projects[0].id : '');
      setDataVisita(getTodayStr());
      setHorario('09:00');
      setObservacoes('');
      setErrorMessage('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setErrorMessage('Por favor, selecione um projeto.');
      return;
    }
    if (!dataVisita) {
      setErrorMessage('Por favor, selecione a data da visita.');
      return;
    }
    if (!horario) {
      setErrorMessage('Por favor, informe o horário da visita.');
      return;
    }

    const selectedProj = projects.find((p) => p.id === projectId);
    if (!selectedProj) return;

    try {
      await onSave({
        project_id: projectId,
        data_visita: dataVisita,
        horario: horario,
        status_visita: 'Agendada',
        observacoes: observacoes,
        cliente: selectedProj.leads?.nome || 'Cliente Desconhecido',
        endereco: selectedProj.endereco || 'Endereço não informado',
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao agendar visita.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Barra laranja no topo */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-slate-100">Agendar Nova Visita Técnica</h3>
            <p className="text-xs text-slate-400 mt-1">Selecione o projeto, data e horário da visita.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors p-1 cursor-pointer rounded-lg hover:bg-slate-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">

            {/* Mensagem de erro */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errorMessage}
              </div>
            )}

            {/* Projeto / Cliente */}
            <div className="space-y-2">
              <label htmlFor="project_id" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Projeto / Cliente
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                </svg>
                <select
                  id="project_id"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl pl-9 pr-4 py-3 text-slate-100 outline-none transition-all text-sm cursor-pointer appearance-none"
                >
                  {isLoadingProjects && dbProjects.length === 0 ? (
                    <option value="">Carregando projetos...</option>
                  ) : projects.length === 0 ? (
                    <option value="">Nenhum projeto ativo disponível</option>
                  ) : (
                    projects.map((proj) => (
                      <option key={proj.id} value={proj.id} className="bg-slate-800 text-slate-100">
                        {proj.leads?.nome || 'Cliente Sem Nome'} — {proj.endereco.length > 38 ? `${proj.endereco.substring(0, 38)}...` : proj.endereco}
                      </option>
                    ))
                  )}
                </select>
                <svg className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Grid: Data + Horário */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* DATA com botão de calendário explícito */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Data da Visita
                </label>
                {/* Campo de texto visível para o usuário */}
                <div
                  className="relative flex items-center bg-slate-800 border border-slate-700 hover:border-slate-600 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 rounded-xl transition-all overflow-hidden cursor-pointer"
                  onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
                >
                  <svg className="w-4 h-4 text-slate-400 ml-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="flex-1 pl-2 py-3 text-sm text-slate-100 select-none">
                    {dataVisita ? formatDisplayDate(dataVisita) : 'Selecionar data'}
                  </span>
                  {/* Input invisível mas funcional – o click no div acima o ativa */}
                  <input
                    ref={dateInputRef}
                    type="date"
                    id="data_visita"
                    value={dataVisita}
                    onChange={(e) => setDataVisita(e.target.value)}
                    required
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    style={{ colorScheme: 'dark' }}
                  />
                  <div className="px-3 py-3 bg-orange-500/10 border-l border-slate-700 text-orange-400 shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* HORÁRIO com botão de relógio */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Horário
                </label>
                <div
                  className="relative flex items-center bg-slate-800 border border-slate-700 hover:border-slate-600 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 rounded-xl transition-all overflow-hidden cursor-pointer"
                  onClick={() => timeInputRef.current?.showPicker?.() || timeInputRef.current?.focus()}
                >
                  <svg className="w-4 h-4 text-slate-400 ml-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="flex-1 pl-2 py-3 text-sm text-slate-100 font-mono select-none">
                    {horario || '09:00'}
                  </span>
                  {/* Input invisível mas funcional */}
                  <input
                    ref={timeInputRef}
                    type="time"
                    id="horario"
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    required
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    style={{ colorScheme: 'dark' }}
                  />
                  <div className="px-3 py-3 bg-orange-500/10 border-l border-slate-700 text-orange-400 shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Horários rápidos */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Atalhos de Horário
              </label>
              <div className="flex flex-wrap gap-2">
                {['07:00', '08:00', '09:00', '10:00', '13:00', '14:00', '15:00', '16:00'].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHorario(h)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      horario === h
                        ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <label htmlFor="modal_observacoes" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Instruções de Campo / Observações Iniciais
              </label>
              <textarea
                id="modal_observacoes"
                rows={3}
                placeholder="Descreva o que precisa ser feito nesta visita..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 outline-none transition-all text-sm resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-slate-100 rounded-xl font-semibold text-sm transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || !projectId || !dataVisita || !horario}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 cursor-pointer flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Agendando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  Confirmar Agendamento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
