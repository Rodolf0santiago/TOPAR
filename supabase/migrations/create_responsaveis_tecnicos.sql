-- OKKA Platform - Migration: Cadastro de Responsáveis Técnicos
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Remover a restrição de chave estrangeira da tabela visits para permitir a recriação
alter table public.visits drop constraint if exists visits_tecnico_id_fkey;

-- 2. Recriar a tabela responsaveis_tecnicos vinculando id ao auth.users
drop table if exists public.responsaveis_tecnicos cascade;

create table public.responsaveis_tecnicos (
  id uuid references auth.users on delete cascade primary key,
  nome text not null,
  telefone text not null,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Restaurar a chave estrangeira em public.visits apontando para a nova tabela
alter table public.visits add column if not exists tecnico_id uuid;

alter table public.visits add constraint visits_tecnico_id_fkey 
foreign key (tecnico_id) references public.responsaveis_tecnicos(id) on delete set null;

-- 4. Habilitar RLS (Row Level Security)
alter table public.responsaveis_tecnicos enable row level security;

-- 5. Criar Políticas de RLS
create policy "Qualquer usuário autenticado pode ver responsaveis_tecnicos"
  on public.responsaveis_tecnicos for select
  to authenticated
  using (true);

create policy "Apenas administradores podem gerenciar responsaveis_tecnicos"
  on public.responsaveis_tecnicos for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
