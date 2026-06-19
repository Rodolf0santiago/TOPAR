'use client';

import React, { useState } from 'react';
import { useResponsaveis } from '@/hooks/useResponsaveis';
import { ResponsavelTecnico } from '@/types/database.types';

const MOCK_FALLBACK_TECNICOS: ResponsavelTecnico[] = [
  { id: 't1', nome: 'Carlos Eduardo Silva', telefone: '(41) 98888-1234', email: 'carlos.silva@hublypro.com.br', created_at: '2026-06-18T10:00:00Z' },
  { id: 't2', nome: 'Fernanda Lima Souza', telefone: '(41) 97777-5678', email: 'fernanda.lima@hublypro.com.br', created_at: '2026-06-19T08:00:00Z' },
  { id: 't3', nome: 'Rodrigo Medeiros', telefone: '(11) 99111-2233', email: 'rodrigo.medeiros@hublypro.com.br', created_at: '2026-06-17T15:30:00Z' },
];

const AVATAR_COLORS = [
  'from-orange-400 to-amber-500',
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-violet-400 to-purple-500',
  'from-rose-400 to-pink-500',
];

export default function ResponsaveisTecnicosPage() {
  const {
    responsaveis: dbResponsaveis,
    isLoading,
    createResponsavel,
    isCreating,
    deleteResponsavel,
    isDeleting,
  } = useResponsaveis();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [localFallback, setLocalFallback] = useState<ResponsavelTecnico[]>(MOCK_FALLBACK_TECNICOS);
  const isDbConfigured = dbResponsaveis.length > 0;
  
  // Instant Loading: renderiza os dados reais do banco se existirem, caso contrário mostra o fallback (mesmo enquanto carrega)
  const listResponsaveis = isDbConfigured ? dbResponsaveis : localFallback;

  const [searchTerm, setSearchTerm] = useState('');
  const filteredResponsaveis = listResponsaveis.filter(
    (t) =>
      t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.telefone.includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!nome.trim() || !telefone.trim() || !email.trim()) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    try {
      if (isDbConfigured) {
        await createResponsavel({ nome, telefone, email });
      } else {
        const newTecnico: ResponsavelTecnico = {
          id: `local-${Date.now()}`,
          nome: nome.trim(),
          telefone: telefone.trim(),
          email: email.trim(),
          created_at: new Date().toISOString(),
        };
        setLocalFallback((prev) => [newTecnico, ...prev]);
      }
      setSuccessMsg('Responsável técnico cadastrado com sucesso!');
      setNome('');
      setTelefone('');
      setEmail('');
    } catch (err: unknown) {
      console.error('Erro ao cadastrar:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado ao salvar os dados.';
      setErrorMsg(errorMessage);
    }
  };

  const handleDelete = async (id: string, tecnicoNome: string) => {
    if (window.confirm(`Deseja realmente excluir o técnico ${tecnicoNome}? Esta ação é irreversível.`)) {
      try {
        if (isDbConfigured) {
          await deleteResponsavel(id);
        } else {
          setLocalFallback((prev) => prev.filter((t) => t.id !== id));
        }
        setSuccessMsg('Responsável técnico excluído com sucesso!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err: unknown) {
        console.error('Erro ao excluir:', err);
        setErrorMsg(err instanceof Error ? err.message : 'Falha ao excluir responsável técnico.');
        setTimeout(() => setErrorMsg(''), 5000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-7">

        {/* Header */}
        <div>
          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Equipe
          </span>
          <h1 className="text-3xl font-black tracking-tight mt-2 text-gray-900">Responsáveis Técnicos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie os profissionais habilitados para instalações de piso aquecido.
          </p>
        </div>

        {/* Stats Rápidos */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{listResponsaveis.length}</p>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Técnicos Ativos</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700">Equipe Operacional</span>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-spin" />
              <span className="text-xs font-bold text-orange-700">Sincronizando com Supabase...</span>
            </div>
          )}
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

          {/* Formulário de Cadastro */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden sticky top-6">
              <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-400" />
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  Cadastrar Técnico
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="nome" className="text-xs font-bold uppercase tracking-wider text-gray-500">Nome Completo</label>
                  <input
                    type="text"
                    id="nome"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="telefone" className="text-xs font-bold uppercase tracking-wider text-gray-500">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    id="telefone"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="Ex: (41) 99999-9999"
                    className="w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-500">E-mail Profissional</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: joao@email.com"
                    className="w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all"
                  />
                </div>

                {successMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {successMsg}
                  </div>
                )}
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-black text-sm transition-all shadow-md shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {isCreating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    <>
                      Cadastrar Técnico
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Listagem de Técnicos em Formato de Tabela */}
          <div className="lg:col-span-2 space-y-5">

            {/* Barra de Busca */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Filtrar por nome, e-mail ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all"
                />
              </div>
            </div>

            {/* Tabela de Técnicos */}
            {filteredResponsaveis.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-14 text-center shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm font-medium">Nenhum técnico encontrado.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <th className="py-4 px-6">Técnico</th>
                        <th className="py-4 px-6">Contato</th>
                        <th className="py-4 px-6">Cadastro</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredResponsaveis.map((tecnico, idx) => {
                        const avatarGradient = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                        const initials = tecnico.nome
                          .split(' ')
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase();
                        
                        const isLocalUser = tecnico.id.startsWith('local-');

                        return (
                          <tr key={tecnico.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0`}>
                                  {initials}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                    {tecnico.nome}
                                  </p>
                                  <span className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider mt-0.5 inline-block">
                                    Técnico Credenciado
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="space-y-0.5">
                                <p className="text-sm text-gray-700 font-semibold flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {tecnico.telefone}
                                </p>
                                <p className="text-xs text-gray-400 font-medium truncate flex items-center gap-1.5" title={tecnico.email}>
                                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  {tecnico.email}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-xs text-gray-500 font-medium">
                                {new Date(tecnico.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Ativo
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => handleDelete(tecnico.id, tecnico.nome)}
                                disabled={isDeleting}
                                title="Excluir Técnico"
                                className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center disabled:opacity-40"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
