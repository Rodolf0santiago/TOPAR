import React from 'react';
import LeadForm from '@/components/public/lead-form';
import WhatsAppButton from '@/components/public/whatsapp-button';

import TopArLogo from '@/components/public/topar-logo';

export default function LandingPage() {
  const brands = [
    'Daikin',
    'LG',
    'Midea',
    'Samsung',
    'Carrier',
    'Fujitsu',
    'Elgin',
    'Springer',
    'Gree',
    'Hitachi',
    'Philco'
  ];

  return (
    <div className="min-h-screen bg-[#070D19] text-slate-100 font-sans selection:bg-[#F26522] selection:text-white overflow-x-hidden">
      {/* Background Glows for Rich Aesthetics */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#38BDF8]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#F26522]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-[500px] h-[500px] bg-[#38BDF8]/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Header / Nav */}
      <header className="fixed top-0 left-0 w-full z-40 bg-[#070D19]/80 backdrop-blur-md border-b border-slate-800/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <TopArLogo />
          
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-400">
            <a href="#servicos" className="hover:text-[#F26522] transition-colors">Serviços</a>
            <a href="#diferenciais" className="hover:text-[#F26522] transition-colors">Diferenciais</a>
            <a href="#marcas" className="hover:text-[#F26522] transition-colors">Parceiros</a>
            <a href="/login" className="text-[#38BDF8] hover:text-[#00A3E0] transition-colors font-semibold flex items-center gap-1">
              Acessar CRM ➔
            </a>
          </nav>
          
          <a
            href="#orcamento"
            className="px-5 py-2.5 bg-gradient-to-r from-[#F26522] to-[#FF5E1A] hover:opacity-90 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-[#F26522]/20"
          >
            Orçamento Rápido
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-16 md:pt-48 md:pb-28 flex flex-col items-center justify-center px-6">
        <div className="max-w-4xl text-center space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#F26522]/20 bg-[#F26522]/5 text-[#F26522] text-xs font-semibold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-pulse" />
            Climatização Residencial & Comercial de Alta Performance
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white">
            Ambiente sempre fresco,{' '}
            <span className="bg-gradient-to-r from-[#F26522] via-[#FF5E1A] to-[#38BDF8] bg-clip-text text-transparent">
              conforto de verdade.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Instalação profissional, higienização profunda e manutenção corretiva de ar-condicionado. Protegemos sua saúde e economizamos sua energia.
          </p>

          {/* Badges de Credenciamento Autorizado */}
          <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2">Credenciado Oficial:</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-[#38BDF8]/20 text-[#38BDF8] text-xs font-bold shadow-sm">
              GREE
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-[#F26522]/20 text-[#F26522] text-xs font-bold shadow-sm">
              PHILCO
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-[#38BDF8]/20 text-[#38BDF8] text-xs font-bold shadow-sm">
              HITACHI
            </div>
            <span className="text-xs text-slate-500 font-bold">& mais de 10 marcas</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#orcamento"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#F26522] to-[#FF5E1A] hover:scale-102 text-white font-bold rounded-xl transition-all shadow-xl shadow-[#F26522]/15 text-center"
            >
              Falar com Técnico
            </a>
            <a
              href="#servicos"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800 hover:border-slate-700 font-bold rounded-xl transition-all text-center"
            >
              Conhecer Nossos Serviços
            </a>
          </div>
        </div>
      </section>

      {/* Marcas Afiliadas (Scrolling Marquee Section) */}
      <section id="marcas" className="py-12 bg-slate-900/30 border-y border-slate-800/40 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <p className="text-center text-xs uppercase tracking-[0.25em] text-slate-500 font-bold">
            Instalação e Assistência Técnica das Melhores Marcas
          </p>
        </div>
        
        {/* Infinite Scroll Container */}
        <div className="relative w-full overflow-hidden flex py-2 select-none">
          <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {/* First Set of Brands */}
            {brands.map((brand, idx) => (
              <div
                key={`b1-${idx}`}
                className="flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 px-6 py-3.5 rounded-xl hover:border-[#38BDF8]/40 transition-colors"
              >
                <span className="text-[#38BDF8] text-xl font-bold">❄</span>
                <span className="text-slate-350 font-bold text-lg">{brand}</span>
              </div>
            ))}
            {/* Second Set of Brands for seamless loop */}
            {brands.map((brand, idx) => (
              <div
                key={`b2-${idx}`}
                className="flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 px-6 py-3.5 rounded-xl hover:border-[#38BDF8]/40 transition-colors"
              >
                <span className="text-[#38BDF8] text-xl font-bold">❄</span>
                <span className="text-slate-350 font-bold text-lg">{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção Serviços */}
      <section id="servicos" className="py-24 border-t border-slate-800/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Serviços Especializados de Climatização
            </h2>
            <p className="text-slate-400">
              Contamos com técnicos credenciados e experientes para resolver qualquer demanda residencial ou corporativa.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Serviço 1 */}
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-[#F26522]/30 hover:-translate-y-1 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 bg-[#F26522]/10 rounded-lg flex items-center justify-center text-[#F26522] group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Instalação Profissional</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Dimensionamento correto de carga térmica para garantir o melhor rendimento, economia de energia e preservação da garantia do fabricante.
              </p>
            </div>
            
            {/* Serviço 2 */}
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-[#38BDF8]/30 hover:-translate-y-1 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 bg-[#38BDF8]/10 rounded-lg flex items-center justify-center text-[#38BDF8] group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Limpeza e Higienização</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Limpeza profunda de filtros, serpentinas e turbinas com bactericidas autorizados pela ANVISA, eliminando ácaros, bactérias e odores.
              </p>
            </div>
            
            {/* Serviço 3 */}
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-[#F26522]/30 hover:-translate-y-1 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 bg-[#F26522]/10 rounded-lg flex items-center justify-center text-[#F26522] group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Consertos e Contrato PMOC</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Diagnósticos rápidos, recarga de gás ecológica e elaboração de Contrato PMOC de acordo com as normas da Anvisa para empresas de todos os portes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Diferenciais */}
      <section id="diferenciais" className="py-20 bg-slate-900/20 border-t border-slate-800/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-white">
                Por que escolher a TOP AR Climatização?
              </h2>
              <p className="text-slate-400">
                Nosso compromisso é entregar a melhor experiência de temperatura e saúde para a sua residência ou empresa, sempre de forma transparente e rápida.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-6 h-6 text-[#38BDF8] flex-shrink-0">✓</div>
                  <div>
                    <h4 className="font-bold text-slate-200">Técnicos Autorizados</h4>
                    <p className="text-sm text-slate-400">Trabalho credenciado junto às principais fabricantes para manter sua garantia.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 text-[#38BDF8] flex-shrink-0">✓</div>
                  <div>
                    <h4 className="font-bold text-slate-200">Atendimento Limpo e Rápido</h4>
                    <p className="text-sm text-slate-400">Garantimos a limpeza impecável do seu ambiente no final de cada instalação.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 text-[#38BDF8] flex-shrink-0">✓</div>
                  <div>
                    <h4 className="font-bold text-slate-200">Preço Justo e Facilitado</h4>
                    <p className="text-sm text-slate-400">Orçamentos detalhados, sem surpresas e opções de parcelamento flexíveis.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quadro de Números/Estatísticas */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/60 text-center space-y-2">
                <div className="text-3xl md:text-4xl font-black text-[#F26522]">10+</div>
                <div className="text-xs uppercase text-slate-500 font-bold tracking-wider">Anos de Mercado</div>
              </div>
              <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/60 text-center space-y-2">
                <div className="text-3xl md:text-4xl font-black text-[#38BDF8]">5k+</div>
                <div className="text-xs uppercase text-slate-500 font-bold tracking-wider">Aparelhos Instalados</div>
              </div>
              <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/60 text-center space-y-2">
                <div className="text-3xl md:text-4xl font-black text-[#38BDF8]">100%</div>
                <div className="text-xs uppercase text-slate-500 font-bold tracking-wider">Técnicos Credenciados</div>
              </div>
              <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/60 text-center space-y-2">
                <div className="text-3xl md:text-4xl font-black text-[#F26522]">99%</div>
                <div className="text-xs uppercase text-slate-500 font-bold tracking-wider">Clientes Satisfeitos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Captura / Lead Section */}
      <section id="orcamento" className="py-24 bg-slate-900/40 relative">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
          {/* Informações da Esquerda */}
          <div className="md:col-span-6 space-y-6">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Solicite uma análise técnica ou orçamento gratuito
            </h2>
            <p className="text-slate-450 leading-relaxed text-base">
              Preencha o formulário e receba o contato de um consultor em até 24h. Nosso consultor auxiliará no cálculo correto de BTUs para o seu ambiente.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">Garantia Integrada</h4>
                  <p className="text-sm text-slate-400">Instalação certificada que mantém intacta a garantia oficial do seu aparelho.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[#F26522]/10 border border-[#F26522]/20 text-[#F26522] mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">Dimensionamento sob medida</h4>
                  <p className="text-sm text-slate-400">Ajudamos a dimensionar a potência (BTUs) ideal para a área do seu ambiente.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário à Direita */}
          <div className="md:col-span-6">
            <div className="bg-[#070D19]/90 border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#F26522] via-[#FF5E1A] to-[#38BDF8]" />
              
              <h3 className="text-2xl font-bold text-white mb-2">Simular Orçamento</h3>
              <p className="text-slate-400 text-sm mb-6">Planeje a climatização ideal para o seu imóvel hoje.</p>

              {/* Renderiza o Lead Capture Form Component */}
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-[#040810] py-16">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <TopArLogo />
          
          <div className="flex flex-col items-center md:items-end text-sm text-slate-500 space-y-2">
            <p>© 2026 TOP AR Climatização. Todos os direitos reservados.</p>
            <p>Ar Condicionado - Instalação, Higienização e Assistência Técnica Autorizada.</p>
          </div>
        </div>
      </footer>

      {/* Renderiza o Botão Flutuante do WhatsApp */}
      <WhatsAppButton />
    </div>
  );
}
