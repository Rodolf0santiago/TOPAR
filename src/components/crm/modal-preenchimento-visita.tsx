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
      <div onClick={onClose} className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />

      <div className="relative bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-400" />

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-black text-gray-900">Atualizar Visita Técnica</h3>
            <p className="text-xs text-gray-500 mt-1">
              Cliente: <strong className="text-gray-700">{clienteNome}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-600 transition-colors p-1.5 cursor-pointer rounded-xl hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Status do Serviço</label>
            <div className="flex gap-2">
              {(['Agendada', 'Realizada', 'Cancelada'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleFieldChange('status_visita', status)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                    localVisita.status_visita === status
                      ? status === 'Realizada'
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                        : status === 'Cancelada'
                        ? 'bg-rose-500 border-rose-500 text-white shadow-sm shadow-rose-500/30'
                        : 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/30'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Materiais */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Materiais Utilizados</label>
            <div className="flex flex-wrap gap-2 min-h-[36px]">
              {(!localVisita.material_usado || localVisita.material_usado.length === 0) ? (
                <span className="text-xs text-gray-400 italic py-1">Nenhum material adicionado ainda.</span>
              ) : (
                localVisita.material_usado.map((mat, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-xs font-semibold"
                  >
                    {mat}
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(i)}
                      className="text-orange-400 hover:text-rose-500 transition-colors font-black cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))
              )}
            </div>
            <form onSubmit={handleAddMaterial} className="flex gap-2">
              <input
                type="text"
                placeholder="Adicionar material (ex: Cabo Térmico 20W)"
                value={materialInput}
                onChange={(e) => setMaterialInput(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 outline-none transition-all text-sm"
              />
              <button
                type="submit"
                className="bg-gray-100 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 text-gray-600 hover:text-orange-600 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer"
              >
                + Adicionar
              </button>
            </form>
          </div>

          {/* Custos Extras */}
          <div className="space-y-2">
            <label htmlFor="valor_gasto" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Custos Extras / Despesas (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">R$</span>
              <input
                type="number"
                id="valor_gasto"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={localVisita.valor_gasto || ''}
                onChange={(e) => handleFieldChange('valor_gasto', parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl pl-10 pr-4 py-2.5 text-gray-800 outline-none transition-all text-sm font-semibold"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <label htmlFor="observacoes" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Observações de Campo / Relato Técnico
            </label>
            <textarea
              id="observacoes"
              rows={4}
              placeholder="Relato detalhado da execução, ocorrências ou pendências..."
              value={localVisita.observacoes || ''}
              onChange={(e) => handleFieldChange('observacoes', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 outline-none transition-all text-sm resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 rounded-xl font-semibold text-sm transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-black text-sm transition-all shadow-md shadow-orange-500/20 cursor-pointer flex items-center gap-2"
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
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Salvar Relatório
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
