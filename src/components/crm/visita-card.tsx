import React from 'react';
import { Visita } from '@/types/database.types';

interface VisitaCardProps {
  visita: Visita;
  onOpenModal: (visita: Visita) => void;
  showDate?: boolean;
}

export default function VisitaCard({ visita, onOpenModal, showDate = false }: VisitaCardProps) {
  // Puxar dados aninhados se existirem, caso contrário usar fallback dos dados simulados
  const clienteNome = visita.projects?.leads?.nome || visita.cliente;
  const endereco = visita.projects?.endereco || visita.endereco;

  return (
    <div
      onClick={() => onOpenModal(visita)}
      className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-5 rounded-xl cursor-pointer transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-950 text-orange-400 border border-orange-500/20">
            {showDate ? `${visita.data_visita.split('-').reverse().slice(0, 2).join('/')} - ` : ''}
            {visita.horario.substring(0, 5)}
          </span>
          <h4 className="font-bold text-slate-100 group-hover:text-orange-400 transition-colors">
            {clienteNome}
          </h4>
        </div>
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {endereco}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            visita.status_visita === 'Realizada'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : visita.status_visita === 'Cancelada'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}
        >
          {visita.status_visita}
        </span>
        <svg
          className="w-5 h-5 text-slate-600 group-hover:text-slate-350 transition-colors hidden md:block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
