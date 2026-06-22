'use client';

import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { useResponsaveis } from '@/hooks/useResponsaveis';
import { criarNovaVisita } from '@/app/actions/visitas';

const schema = z.object({
  project_id: z.string().min(1, 'Por favor, selecione o projeto.'),
  tecnico_id: z.string().nullable().optional(),
  data_visita: z.string().min(1, 'A data da visita é obrigatória.'),
  horario: z.string().min(1, 'O horário da visita é obrigatório.'),
  observacoes: z.string().optional(),
  pdf_proposta: z.any()
    .optional()
    .nullable()
    .refine((file) => {
      if (!file) return true;
      return file instanceof File;
    }, 'Arquivo inválido.')
    .refine((file) => {
      if (!file) return true;
      return file.size <= 5 * 1024 * 1024;
    }, 'A proposta em PDF deve ter no máximo 5MB.')
    .refine((file) => {
      if (!file) return true;
      return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    }, 'Apenas arquivos PDF são permitidos.')
});

type FormData = z.infer<typeof schema>;

function formatDisplayDate(val: string) {
  if (!val) return '';
  const [y, m, d] = val.split('-');
  return `${d}/${m}/${y}`;
}

export default function NovaVisitaPage() {
  const router = useRouter();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const { responsaveis } = useResponsaveis();
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      project_id: '',
      tecnico_id: '',
      data_visita: '',
      horario: '09:00',
      observacoes: '',
      pdf_proposta: null
    }
  });

  const pdfProposta = watch('pdf_proposta') as File | null;

  // react-dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setValue('pdf_proposta', acceptedFiles[0], { shouldValidate: true });
      }
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();
      formData.append('project_id', data.project_id);
      formData.append('data_visita', data.data_visita);
      formData.append('horario', data.horario);
      if (data.tecnico_id) {
        formData.append('tecnico_id', data.tecnico_id);
      }
      if (data.observacoes) {
        formData.append('observacoes', data.observacoes);
      }
      if (data.pdf_proposta) {
        formData.append('pdf_proposta', data.pdf_proposta);
      }

      const res = await criarNovaVisita(formData);

      if (res.success) {
        showToast('Visita técnica e proposta salvas com sucesso!', 'success');
        setTimeout(() => {
          router.push('/visitas');
        }, 1500);
      } else {
        showToast(res.error || 'Erro ao salvar a visita.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Ocorreu um erro ao processar sua solicitação.', 'error');
    }
  };

  const activeProjects = useMemo(() => {
    return (projects || []).filter((p) => !!p.leads);
  }, [projects]);

  const labelClass = "text-xs font-bold uppercase tracking-wider text-gray-500";
  const inputClass = "w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 outline-none transition-all text-sm";
  const selectClass = "w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-gray-800 outline-none transition-all text-sm cursor-pointer appearance-none";

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 to-amber-500" />
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-100">
          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Agendamento
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-2.5">Agendar Visita com Proposta</h1>
          <p className="text-xs text-gray-400 mt-1">
            Preencha os detalhes do cronograma técnico e anexe a proposta comercial em PDF.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
          {/* Seção 1: Seleção de Cliente/Projeto */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
              <span className="w-1.5 h-3 bg-orange-500 rounded-full" />
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">1. Cliente & Responsável</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Projeto Select */}
              <div className="space-y-1.5">
                <label htmlFor="project_id" className={labelClass}>Projeto / Cliente *</label>
                <div className="relative">
                  <Controller
                    name="project_id"
                    control={control}
                    render={({ field }) => (
                      <select
                        id="project_id"
                        {...field}
                        className={selectClass}
                      >
                        <option value="">Selecione um projeto ativo</option>
                        {isLoadingProjects ? (
                          <option disabled>Carregando projetos...</option>
                        ) : (
                          activeProjects.map((proj) => {
                            const end = proj.endereco || '';
                            return (
                              <option key={proj.id} value={proj.id}>
                                {proj.leads?.nome || 'Cliente Sem Nome'} — {end.length > 30 ? `${end.substring(0, 30)}...` : end}
                              </option>
                            );
                          })
                        )}
                      </select>
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.project_id && (
                  <p className="text-xs text-rose-500 font-bold">{errors.project_id.message}</p>
                )}
              </div>

              {/* Técnico Responsável */}
              <div className="space-y-1.5">
                <label htmlFor="tecnico_id" className={labelClass}>Técnico Responsável</label>
                <div className="relative">
                  <Controller
                    name="tecnico_id"
                    control={control}
                    render={({ field }) => (
                      <select
                        id="tecnico_id"
                        {...field}
                        value={field.value || ''}
                        className={selectClass}
                      >
                        <option value="">Selecionar técnico depois</option>
                        {responsaveis?.map((tec) => (
                          <option key={tec.id} value={tec.id}>{tec.nome}</option>
                        ))}
                      </select>
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.tecnico_id && (
                  <p className="text-xs text-rose-500 font-bold">{errors.tecnico_id.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Data da Visita */}
              <div className="space-y-1.5">
                <label htmlFor="data_visita" className={labelClass}>Data da Visita *</label>
                <Controller
                  name="data_visita"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="date"
                      id="data_visita"
                      {...field}
                      className={inputClass}
                    />
                  )}
                />
                {errors.data_visita && (
                  <p className="text-xs text-rose-500 font-bold">{errors.data_visita.message}</p>
                )}
              </div>

              {/* Horário */}
              <div className="space-y-1.5">
                <label htmlFor="horario" className={labelClass}>Horário *</label>
                <Controller
                  name="horario"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="time"
                      id="horario"
                      {...field}
                      className={inputClass}
                    />
                  )}
                />
                {errors.horario && (
                  <p className="text-xs text-rose-500 font-bold">{errors.horario.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Seção 2: Anexo da Proposta em PDF */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
              <span className="w-1.5 h-3 bg-orange-500 rounded-full" />
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">2. Proposta Comercial</h4>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Anexo da Proposta (PDF)</label>
              
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[160px] ${
                  isDragActive
                    ? 'border-orange-500 bg-orange-50/20 scale-[1.01]'
                    : 'border-gray-200 hover:border-orange-400 bg-gray-50/50 hover:bg-orange-50/5'
                }`}
              >
                <input {...getInputProps()} />
                
                {pdfProposta ? (
                  <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 mx-auto">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700 truncate max-w-xs mx-auto">
                        {pdfProposta.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        {(pdfProposta.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setValue('pdf_proposta', null, { shouldValidate: true })}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remover PDF
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200/80 flex items-center justify-center text-gray-400 mx-auto">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">
                        Arraste e solte o PDF da proposta aqui
                      </p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        ou clique para selecionar do computador (Limite: 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {errors.pdf_proposta && (
                <p className="text-xs text-rose-500 font-bold">{errors.pdf_proposta.message as string}</p>
              )}
            </div>
          </div>

          {/* Seção 3: Observações */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
              <span className="w-1.5 h-3 bg-orange-500 rounded-full" />
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">3. Instruções Técnicas</h4>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="observacoes" className={labelClass}>Observações / Requisitos</label>
              <Controller
                name="observacoes"
                control={control}
                render={({ field }) => (
                  <textarea
                    id="observacoes"
                    rows={4}
                    placeholder="Descreva o que precisa ser feito nesta visita técnica..."
                    {...field}
                    className={`${inputClass} resize-none`}
                  />
                )}
              />
              {errors.observacoes && (
                <p className="text-xs text-rose-500 font-bold">{errors.observacoes.message}</p>
              )}
            </div>
          </div>

          {/* Footer Ações */}
          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3.5">
            <button
              type="button"
              onClick={() => router.push('/visitas')}
              className="px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 rounded-xl font-semibold text-sm transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm transition-all shadow-md shadow-orange-500/20 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Salvando Visita...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar Agendamento
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notificação */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all duration-300 text-white text-sm font-bold border ${
          toast.type === 'error' ? 'bg-rose-600 border-rose-500' : 'bg-gray-900 border-gray-800'
        }`}>
          {toast.type === 'error' ? (
            <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
