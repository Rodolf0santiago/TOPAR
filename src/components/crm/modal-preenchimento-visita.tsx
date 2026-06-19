import React, { useState, useEffect } from 'react';
import { Visita } from '@/types/database.types';

interface ModalPreenchimentoVisitaProps {
  isOpen: boolean;
  visita: Visita | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Visita>) => Promise<void>;
  isSaving: boolean;
}

export default function ModalPreenchimentoVisita({
  isOpen,
  visita,
  onClose,
  onSave,
  isSaving,
}: ModalPreenchimentoVisitaProps) {
  const [localVisita, setLocalVisita] = useState<Visita | null>(null);
  const [materialInput, setMaterialInput] = useState('');

  // Sincroniza o estado local sempre que a visita selecionada mudar
  useEffect(() => {
    if (visita) {
      setLocalVisita({ ...visita });
    } else {
      setLocalVisita(null);
    }
  }, [visita]);

  if (!isOpen || !localVisita) return null;

  const handleFieldChange = (field: keyof Visita, value: any) => {
    setLocalVisita((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialInput.trim()) return;
    const novosMateriais = [...(localVisita.material_usado || []), materialInput.trim()];
    handleFieldChange('material_usado', novosMateriais);
    setMaterialInput('');
  };

  const handleRemoveMaterial = (indexToRemove: number) => {
    const novosMateriais = (localVisita.material_usado || []).filter((_, i) => i !== indexToRemove);
    handleFieldChange('material_usado', novosMateriais);
  };

  const handleSave = async () => {
    try {
      await onSave(localVisita.id, {
        status_visita: localVisita.status_visita,
        material_usado: localVisita.material_usado,
        valor_gasto: localVisita.valor_gasto,
        observacoes: localVisita.observacoes,
      });
      onClose();
    } catch (err) {
      console.error('Falha ao salvar relatório da visita:', err);
    }
  };

  const clienteNome = localVisita.projects?.leads?.nome || localVisita.cliente;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Escuro */}
      <div onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

      {/* Conteúdo do Modal */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />

        {/* Header Modal */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-slate-100">Atualizar Visita Técnica</h3>
            <p className="text-xs text-slate-400 mt-1">{clienteNome}</p>
          </div>
          <button
            onClick={onClose}
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
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Status do Serviço
            </label>
            <div className="flex gap-3">
              {(['Agendada', 'Realizada', 'Cancelada'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleFieldChange('status_visita', status)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                    localVisita.status_visita === status
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
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Materiais Utilizados
            </label>

            {/* Lista de tags atuais */}
            <div className="flex flex-wrap gap-2 mb-3">
              {(!localVisita.material_usado || localVisita.material_usado.length === 0) ? (
                <span className="text-xs text-slate-500 italic">Nenhum material adicionado ainda.</span>
              ) : (
                localVisita.material_usado.map((mat, i) => (
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
            <label htmlFor="valor_gasto" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Custos Extras / Despesas Adicionais (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-500">R$</span>
              <input
                type="number"
                id="valor_gasto"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={localVisita.valor_gasto || ''}
                onChange={(e) => handleFieldChange('valor_gasto', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <label htmlFor="observacoes" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Observações de Campo / Relato Técnico
            </label>
            <textarea
              id="observacoes"
              rows={4}
              placeholder="Relato detalhado da execução da visita, ocorrências ou pendências..."
              value={localVisita.observacoes || ''}
              onChange={(e) => handleFieldChange('observacoes', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-650 outline-none transition-all text-sm resize-none"
            />
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-250 rounded-lg font-semibold text-sm transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-orange-500/10 cursor-pointer flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Salvando...
              </>
            ) : (
              'Salvar Relatório'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
