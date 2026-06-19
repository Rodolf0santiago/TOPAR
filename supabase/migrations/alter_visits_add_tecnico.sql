-- OKKA Platform - Migration: Atualização de Visitas Técnicas (Visits)
-- Execute este script no SQL Editor do seu projeto Supabase.

-- Adicionar chave estrangeira referenciando responsaveis_tecnicos
alter table public.visits 
add column if not exists tecnico_id uuid references public.responsaveis_tecnicos(id) on delete set null;

-- Nota: O campo 'horario' já está definido no schema original como:
-- horario time without time zone not null
-- Caso precise garantir que esteja no banco real com um padrão, execute:
-- alter table public.visits add column if not exists horario time without time zone not null default '09:00:00';
