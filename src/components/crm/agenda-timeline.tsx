import React from 'react';
import { Visita } from '@/types/database.types';
import VisitaCard from './visita-card';

interface AgendaTimelineProps {
  visitas: Visita[];
  onOpenModal: (visita: Visita) => void;
}

export default function AgendaTimeline({ visitas, onOpenModal }: AgendaTimelineProps) {
  // Datas de referência com base na data do sistema (2026-06-18)
  const hojeStr = '2026-06-18';
  const amanhaStr = '2026-06-19';

  const visitasHoje = visitas.filter((v) => v.data_visita === hojeStr);
  const visitasAmanha = visitas.filter((v) => v.data_visita === amanhaStr);
  const visitasOutras = visitas.filter((v) => v.data_visita !== hojeStr && v.data_visita !== amanhaStr);

  return (
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
            <p className="text-sm text-slate-500 italic">Nenhuma visita agendada para hoje.</p>
          ) : (
            visitasHoje.map((v) => (
              <VisitaCard key={v.id} visita={v} onOpenModal={onOpenModal} />
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
            <p className="text-sm text-slate-500 italic">Nenhuma visita agendada para amanhã.</p>
          ) : (
            visitasAmanha.map((v) => (
              <VisitaCard key={v.id} visita={v} onOpenModal={onOpenModal} />
            ))
          )}
        </div>
      </div>

      {/* PRÓXIMOS DIAS */}
      <div>
        <div className="flex items-center gap-3 mb-4 border-b border-slate-900 pb-2">
          <h2 className="text-lg font-bold text-slate-400">Próximos Dias</h2>
          <span className="text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
            {visitasOutras.length} agendamentos
          </span>
        </div>

        <div className="grid gap-4">
          {visitasOutras.length === 0 ? (
            <p className="text-sm text-slate-500 italic">Nenhuma outra visita programada.</p>
          ) : (
            visitasOutras.map((v) => (
              <VisitaCard key={v.id} visita={v} onOpenModal={onOpenModal} showDate />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
