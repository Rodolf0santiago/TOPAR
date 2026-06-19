-- OKKA Platform - Migration: Cadastro de Responsáveis Técnicos
-- Execute este script no SQL Editor do seu projeto Supabase.

create table public.responsaveis_tecnicos (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  telefone text not null,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security)
alter table public.responsaveis_tecnicos enable row level security;

-- Políticas de RLS
create policy "Usuários autenticados podem gerenciar responsaveis_tecnicos"
  on public.responsaveis_tecnicos for all
  to authenticated
  using (true)
  with check (true);
