'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getMinhasEmpresas, selecionarEmpresa, type MinhaEmpresa } from '@/app/actions/empresa';

const ROLE_LABELS: Record<string, string> = {
  mestre:    'Conta Mestra',
  admin:     'Administrador',
  vendedor:  'Vendedor',
  tecnico:   'Técnico',
  instalador:'Instalador Técnico',
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  mestre: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  admin: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  vendedor: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  tecnico: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  instalador: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  ),
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  ativa:        { label: 'Ativa',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  inadimplente: { label: 'Inadimplente', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelada:    { label: 'Cancelada',    cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function SelecionarEmpresaPage() {
  const router = useRouter();
  const [empresas, setEmpresas]         = useState<MinhaEmpresa[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selecting, setSelecting]       = useState<string | null>(null);
  const [errorMsg, setErrorMsg]         = useState<string | null>(null);
  const [userName, setUserName]         = useState('');

  useEffect(() => {
    async function init() {
      // Verificar se há sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/');
        return;
      }

      const name = session.user.user_metadata?.nome_completo
        || session.user.user_metadata?.name
        || session.user.email
        || 'Usuário';
      setUserName(name);

      // Carregar empresas
      const res = await getMinhasEmpresas();
      if (res.success && res.data) {
        if (res.data.length === 1) {
          // Se só tem 1 empresa, selecionar diretamente e redirecionar
          await handleSelectEmpresa(res.data[0]);
          return;
        }
        setEmpresas(res.data);
      } else {
        setErrorMsg(res.error || 'Não foi possível carregar suas empresas.');
      }
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelectEmpresa(empresa: MinhaEmpresa) {
    setSelecting(empresa.empresa_id);
    setErrorMsg(null);

    try {
      const res = await selecionarEmpresa(empresa.empresa_id);
      if (!res.success) {
        setErrorMsg(res.error || 'Erro ao selecionar empresa.');
        setSelecting(null);
        return;
      }

      // Atualizar o JWT com as novas claims (empresa_id + role)
      await supabase.auth.refreshSession();

      const role = empresa.role;
      const targetRoute =
        role === 'mestre' || role === 'admin' ? '/dashboard/mestre' :
        role === 'vendedor' || role === 'tecnico' ? '/dashboard/vendedor' :
        '/dashboard/instalador';

      router.push(targetRoute);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado.');
      setSelecting(null);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax; Secure';
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0a4ee4]/20 border-t-[#0a4ee4] rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-semibold">Carregando suas empresas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBFA] text-[#0B0F19] font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Gradiente de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(10,78,228,0.06)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[radial-gradient(circle,rgba(245,158,11,0.06)_0%,transparent_70%)]" />
      </div>

      <div className="relative w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <img src="/logo-hubly.png" alt="HUBLY PRO" className="h-16 w-auto object-contain" />
          </div>

          <div className="inline-flex items-center gap-2 bg-[#0a4ee4]/8 border border-[#0a4ee4]/20 rounded-full px-4 py-1.5 mb-4">
            <div className="w-2 h-2 bg-[#0a4ee4] rounded-full animate-pulse" />
            <span className="text-xs font-bold text-[#0a4ee4] tracking-wide">SESSÃO ATIVA</span>
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-1">Olá, {userName.split(' ')[0]}!</h1>
          <p className="text-sm text-gray-500">
            Você pertence a <span className="font-bold text-gray-700">{empresas.length} empresas</span>.
            Escolha com qual deseja trabalhar agora.
          </p>
        </div>

        {/* Mensagem de erro */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Cards de Empresa */}
        <div className="space-y-3">
          {empresas.map((emp) => {
            const isCanceled  = emp.status_assinatura === 'cancelada';
            const isSelecting = selecting === emp.empresa_id;
            const badge       = STATUS_BADGE[emp.status_assinatura] ?? STATUS_BADGE.ativa;
            const roleIcon    = ROLE_ICONS[emp.role] ?? ROLE_ICONS.tecnico;
            const roleLabel   = ROLE_LABELS[emp.role] ?? emp.role;
            const initial     = emp.nome_fantasia.charAt(0).toUpperCase();

            return (
              <button
                key={emp.empresa_id}
                id={`empresa-card-${emp.empresa_id}`}
                onClick={() => !isCanceled && handleSelectEmpresa(emp)}
                disabled={!!selecting || isCanceled}
                className={`
                  w-full text-left group relative overflow-hidden
                  bg-white border rounded-2xl p-5 transition-all duration-200
                  ${isCanceled
                    ? 'border-gray-200 opacity-50 cursor-not-allowed'
                    : isSelecting
                    ? 'border-[#0a4ee4] shadow-lg shadow-[#0a4ee4]/10 scale-[1.01]'
                    : 'border-gray-200 hover:border-[#0a4ee4]/50 hover:shadow-md hover:shadow-[#0a4ee4]/8 hover:-translate-y-0.5 cursor-pointer'
                  }
                `}
              >
                {/* Linha de destaque no topo ao selecionar */}
                {isSelecting && (
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#0a4ee4] to-amber-500" />
                )}

                <div className="flex items-center gap-4">
                  {/* Avatar da empresa */}
                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0
                    ${isSelecting
                      ? 'bg-[#0a4ee4] text-white'
                      : 'bg-gradient-to-br from-[#0a4ee4]/10 to-amber-500/10 text-[#0a4ee4] group-hover:from-[#0a4ee4]/20 group-hover:to-amber-500/20'
                    }
                    transition-all duration-200
                  `}>
                    {isSelecting
                      ? <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      : initial
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-sm font-black text-gray-900 truncate">{emp.nome_fantasia}</h2>
                      <span className={`shrink-0 inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Role */}
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <span className="text-[#0a4ee4]/60">{roleIcon}</span>
                      <span className="text-xs font-semibold">{roleLabel}</span>
                    </div>
                  </div>

                  {/* Seta */}
                  {!isSelecting && !isCanceled && (
                    <svg
                      className="w-5 h-5 text-gray-300 group-hover:text-[#0a4ee4] group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  {isCanceled && (
                    <span className="text-[10px] font-bold text-rose-400 shrink-0">Sem acesso</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-[10px] text-gray-400 font-medium">
            Não é você?{' '}
            <button
              onClick={handleSignOut}
              className="text-[#0a4ee4] font-bold hover:underline cursor-pointer"
            >
              Sair da conta
            </button>
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-gray-400 font-medium">Conexão segura</span>
          </div>
        </div>
      </div>
    </div>
  );
}
