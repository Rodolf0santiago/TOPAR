'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

// Tipagem do Formulário de Lead
interface LeadFormData {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  area_m2: string;
}

export default function LandingPage() {
  const [formData, setFormData] = useState<LeadFormData>({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    area_m2: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Inserção direta na tabela 'leads' do Supabase
      const { error: supabaseError } = await supabase.from('leads').insert([
        {
          nome: formData.nome,
          email: formData.email || null,
          telefone: formData.telefone,
          cidade: formData.cidade,
          area_m2: formData.area_m2 ? parseFloat(formData.area_m2) : null,
          status: 'Novo',
        },
      ]);

      if (supabaseError) {
        throw new Error(supabaseError.message || 'Falha ao salvar dados no Supabase.');
      }

      setSuccess(true);
      setFormData({ nome: '', email: '', telefone: '', cidade: '', area_m2: '' });
    } catch (err: any) {
      console.error('Erro de envio:', err);
      setError(err.message || 'Erro ao conectar ao banco de dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden">
      {/* Header / Nav */}
      <header className="fixed top-0 left-0 w-full z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              OKKA
            </span>
            <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold px-2 py-0.5 border border-slate-800 rounded bg-slate-900">
              Piso Aquecido
            </span>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-400">
            <a href="#tecnologia" className="hover:text-orange-400 transition-colors">Tecnologia</a>
            <a href="#beneficios" className="hover:text-orange-400 transition-colors">Benefícios</a>
            <a href="#processo" className="hover:text-orange-400 transition-colors">Instalação</a>
          </nav>
          <a
            href="#orcamento"
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-orange-500/20"
          >
            Solicitar Orçamento
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col items-center justify-center px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(226,91,60,0.08)_0%,transparent_60%)] pointer-events-none" />
        
        <div className="max-w-4xl text-center space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            O Futuro da Climatização Residencial
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight md:leading-none">
            Conforto térmico invisível,{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-500 to-rose-600 bg-clip-text text-transparent">
              sofisticação que se sente.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Sistemas de calefação por piso radiante elétrico ou hidráulico de alta performance. Calor uniforme, sustentável e sob medida para o seu lar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#orcamento"
              className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all shadow-xl shadow-orange-500/10 text-center"
            >
              Simular Projeto
            </a>
            <a
              href="#tecnologia"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-850 text-slate-350 border border-slate-800 hover:border-slate-700 font-semibold rounded-xl transition-all text-center"
            >
              Conhecer Tecnologia
            </a>
          </div>
        </div>
      </section>

      {/* Seção Tecnologia */}
      <section id="tecnologia" className="py-20 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold">Tecnologia Inteligente de Aquecimento</h2>
            <p className="text-slate-400">Nossas malhas térmicas e termostatos inteligentes trabalham em conjunto para criar a melhor experiência residencial.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-900 hover:border-orange-500/20 transition-all space-y-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Eficiência Térmica</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Instalação direta sob o acabamento, garantindo que 99% da energia seja convertida em calor radiante.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-900 hover:border-orange-500/20 transition-all space-y-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Controle IoT por App</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Termostatos digitais com Wi-Fi para programação de horários e controle completo por smartphone ou Alexa.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-900 hover:border-orange-500/20 transition-all space-y-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Segurança Avançada</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Dupla isolação contra umidade (grau de proteção IPX7) e malha de aterramento para proteção total de sua família.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Captura / Lead Section */}
      <section id="orcamento" className="py-20 bg-slate-900/40 relative">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
          
          {/* Informações da Esquerda */}
          <div className="md:col-span-6 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Solicite uma análise técnica personalizada
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Descubra a viabilidade e o custo estimado de instalação do piso aquecido para o seu imóvel. Nossa equipe de engenharia avaliará as especificações técnicas da sua obra.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">Dimensionamento Inteligente</h4>
                  <p className="text-sm text-slate-400">Projetos sob medida otimizados para menor consumo de energia.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">Instalação Ágil</h4>
                  <p className="text-sm text-slate-400">Visitas técnicas qualificadas que reduzem em até 30% o tempo de obra.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário à Direita */}
          <div className="md:col-span-6">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
              
              <h3 className="text-xl font-bold text-slate-100 mb-6">Fale com um especialista</h3>

              {success ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-200">Solicitação Enviada!</h4>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto">
                    Agradecemos seu contato. Nossa equipe analisará as dimensões informadas e retornará em até 24 horas úteis.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-6 text-sm text-orange-400 hover:text-orange-300 transition-colors font-medium underline"
                  >
                    Enviar outra solicitação
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label htmlFor="nome" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nome Completo</label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                      placeholder="Ex: João Silva"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 outline-none transition-all text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="telefone" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Telefone / WhatsApp</label>
                      <input
                        type="tel"
                        id="telefone"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        required
                        placeholder="(00) 00000-0000"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-400">E-mail</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="nome@email.com"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="cidade" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cidade / UF</label>
                      <input
                        type="text"
                        id="cidade"
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                        required
                        placeholder="Ex: Curitiba / PR"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="area_m2" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Área estimada (m²)</label>
                      <input
                        type="number"
                        id="area_m2"
                        name="area_m2"
                        value={formData.area_m2}
                        onChange={handleChange}
                        required
                        min="5"
                        placeholder="Ex: 120"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 mt-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-xl shadow-orange-500/15 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      'Solicitar Análise Gratuita'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-center text-sm text-slate-500">
        <p>© 2026 OKKA Piso Aquecido. Todos os direitos reservados. Projetos residenciais de alto padrão.</p>
      </footer>

      {/* Botão Flutuante do WhatsApp */}
      <a
        href="https://wa.me/5541999999999?text=Olá!%20Gostaria%20de%20solicitar%20um%20orçamento%20de%20piso%20aquecido."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group cursor-pointer"
      >
        {/* Efeito de Ondulação/Pulso */}
        <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping group-hover:animate-none scale-105 pointer-events-none" />
        
        {/* Ícone SVG do WhatsApp */}
        <svg className="w-7 h-7 relative z-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
