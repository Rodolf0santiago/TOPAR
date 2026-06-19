import React from 'react';
import { Visita } from '@/types/database.types';
import VisitaCard from './visita-card';

interface AgendaTimelineProps {
  visitas: Visita[];
  onOpenModal: (visita: Visita) => void;
}

function SectionHeader({ title, count, isToday = false }: { title: string; count: number; isToday?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-1 h-5 rounded-full ${isToday ? 'bg-orange-500' : 'bg-gray-300'}`} />
      <h2 className={`text-base font-black ${isToday ? 'text-orange-600' : 'text-gray-600'}`}>{title}</h2>
      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
        isToday
          ? 'bg-orange-50 border-orange-200 text-orange-600'
          : 'bg-gray-100 border-gray-200 text-gray-500'
      }`}>
        {count} {count === 1 ? 'agendamento' : 'agendamentos'}
      </span>
    </div>
  );
}

export default function AgendaTimeline({ visitas, onOpenModal }: AgendaTimelineProps) {
  const hojeStr = '2026-06-18';
  const amanhaStr = '2026-06-19';

  const visitasHoje = visitas.filter((v) => v.data_visita === hojeStr);
  const visitasAmanha = visitas.filter((v) => v.data_visita === amanhaStr);
  const visitasOutras = visitas.filter((v) => v.data_visita !== hojeStr && v.data_visita !== amanhaStr);

  return (
    <div className="space-y-10">
      {/* HOJE */}
      <div>
        <SectionHeader title="Hoje" count={visitasHoje.length} isToday />
        <div className="grid gap-3">
          {visitasHoje.length === 0 ? (
            <p className="text-sm text-gray-400 italic bg-white border border-gray-100 rounded-xl px-5 py-4 text-center">
              Nenhuma visita agendada para hoje.
            </p>
          ) : (
            visitasHoje.map((v) => <VisitaCard key={v.id} visita={v} onOpenModal={onOpenModal} />)
          )}
        </div>
      </div>

      {/* AMANHÃ */}
      <div>
        <SectionHeader title="Amanhã" count={visitasAmanha.length} />
        <div className="grid gap-3">
          {visitasAmanha.length === 0 ? (
            <p className="text-sm text-gray-400 italic bg-white border border-gray-100 rounded-xl px-5 py-4 text-center">
              Nenhuma visita agendada para amanhã.
            </p>
          ) : (
            visitasAmanha.map((v) => <VisitaCard key={v.id} visita={v} onOpenModal={onOpenModal} />)
          )}
        </div>
      </div>

      {/* PRÓXIMOS DIAS */}
      <div>
        <SectionHeader title="Próximos Dias" count={visitasOutras.length} />
        <div className="grid gap-3">
          {visitasOutras.length === 0 ? (
            <p className="text-sm text-gray-400 italic bg-white border border-gray-100 rounded-xl px-5 py-4 text-center">
              Nenhuma outra visita programada.
            </p>
          ) : (
            visitasOutras.map((v) => <VisitaCard key={v.id} visita={v} onOpenModal={onOpenModal} showDate />)
          )}
        </div>
      </div>
    </div>
  );
}
