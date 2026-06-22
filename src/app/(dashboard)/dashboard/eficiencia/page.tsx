'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTecnicosEficiencia } from '@/app/actions/eficiencia';

export default function EficienciaPage() {
  const { data: relatorio, isLoading, error } = useQuery({
    queryKey: ['tecnicos_eficiencia'],
    queryFn: () => getTecnicosEficiencia(),
    refetchOnWindowFocus: true,
  });

  const AVATAR_COLORS = [
    'from-orange-400 to-amber-500',
    'from-blue-400 to-indigo-500',
    'from-emerald-400 to-teal-500',
    'from-violet-400 to-purple-500',
    'from-rose-400 to-pink-500',
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-gray-400 font-medium">Carregando relatório de eficiência...</span>
        </div>
      </div>
    );
  }

  if (error || !relatorio) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 flex items-center justify-center">
        <div className="bg-white border border-rose-100 rounded-2xl p-8 max-w-md text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-gray-900">Erro ao carregar relatório</h3>
          <p className="text-sm text-gray-500 mt-2">Não foi possível carregar os dados de eficiência no momento.</p>
        </div>
      </div>
    );
  }

  const {
    hojeStr,
    seteDiasAtrasStr,
    globalTotal,
    globalConcluidas,
    globalAtrasadas,
    globalTaxaConclusao,
    desempenho,
  } = relatorio;

  // Formatar datas para exibir no subtítulo
  const formatDateStr = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Relatórios Operacionais
          </span>
          <h1 className="text-3xl font-black tracking-tight mt-2 text-gray-900">Eficiência dos Técnicos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Análise agregada de desempenho no período de{' '}
            <strong className="text-gray-700">{formatDateStr(seteDiasAtrasStr)}</strong> a{' '}
            <strong className="text-gray-700">{formatDateStr(hojeStr)}</strong> (últimos 7 dias).
          </p>
        </div>

        {/* Global Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Card 1: Taxa de Conclusão Global */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden group">
            <div className="absolute inset-y-0 left-0 w-1.5 bg-emerald-500" />
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Eficiência do Time</span>
              <p className="text-3xl font-black text-gray-900 leading-tight">{globalTaxaConclusao}%</p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Taxa de Conclusão Global
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Card 2: Total Concluidas */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden group">
            <div className="absolute inset-y-0 left-0 w-1.5 bg-blue-500" />
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Serviços Concluídos</span>
              <p className="text-3xl font-black text-gray-900 leading-tight">{globalConcluidas}</p>
              <p className="text-[10px] text-gray-400 font-medium">De um total de {globalTotal} visitas</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Card 3: Total Atrasadas */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden group">
            <div className={`absolute inset-y-0 left-0 w-1.5 ${globalAtrasadas > 0 ? 'bg-rose-500' : 'bg-gray-300'}`} />
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Agendamentos Atrasados</span>
              <p className={`text-3xl font-black leading-tight ${globalAtrasadas > 0 ? 'text-rose-600' : 'text-gray-900'}`}>{globalAtrasadas}</p>
              <p className="text-[10px] text-gray-400 font-medium">
                {globalAtrasadas > 0 ? 'Atenção necessária' : 'Tudo em dia'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${globalAtrasadas > 0 ? 'bg-rose-50 text-rose-500 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

        </div>

        {/* Detailed Performance Table */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Desempenho Individual</h2>
              <p className="text-xs text-gray-400 mt-0.5">Ranking e métricas detalhadas dos técnicos do HUBLY PRO</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-4 px-6">Técnico</th>
                  <th className="py-4 px-6 text-center">Visitas Atribuídas</th>
                  <th className="py-4 px-6 text-center">Concluídas</th>
                  <th className="py-4 px-6 text-center">Em Atraso</th>
                  <th className="py-4 px-6">Taxa de Eficiência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {desempenho.map((tec, idx) => {
                  const avatarGradient = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  const initials = tec.nome
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();

                  // Definir cor da barra de eficiência
                  const barColor =
                    tec.taxaConclusao >= 80
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : tec.taxaConclusao >= 50
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-rose-500 to-orange-400';

                  const textProgressColor =
                    tec.taxaConclusao >= 80
                      ? 'text-emerald-600'
                      : tec.taxaConclusao >= 50
                      ? 'text-amber-600'
                      : 'text-rose-600';

                  return (
                    <tr key={tec.tecnicoId} className="hover:bg-gray-50/50 transition-colors group">
                      {/* Perfil */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0`}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                              {tec.nome}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">
                              {tec.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-6 text-center text-sm font-bold text-gray-700">
                        {tec.totalVisitas}
                      </td>

                      {/* Concluidas */}
                      <td className="py-4 px-6 text-center text-sm font-bold text-emerald-600">
                        {tec.totalConcluidas}
                      </td>

                      {/* Em Atraso */}
                      <td className={`py-4 px-6 text-center text-sm font-bold ${tec.totalAtrasadas > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                        {tec.totalAtrasadas}
                      </td>

                      {/* Eficiência */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3 min-w-[150px]">
                          <span className={`text-xs font-black shrink-0 ${textProgressColor}`}>
                            {tec.taxaConclusao}%
                          </span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                              style={{ width: `${tec.taxaConclusao}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
