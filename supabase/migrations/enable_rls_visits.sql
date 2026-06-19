-- OKKA Platform - Migration: RLS para Visitas Técnicas (visits)
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Habilitar RLS na tabela public.visits
alter table public.visits enable row level security;

-- 2. Política para Técnicos: Podem ver e atualizar apenas suas próprias visitas
create policy "Técnicos podem ver suas próprias visitas"
  on public.visits for select
  to authenticated
  using (tecnico_id = auth.uid());

create policy "Técnicos podem atualizar suas próprias visitas"
  on public.visits for update
  to authenticated
  using (tecnico_id = auth.uid())
  with check (tecnico_id = auth.uid());

-- 3. Política para Administradores (Conta Mestre): Permissão total (ALL)
create policy "Administradores têm permissão total em visits"
  on public.visits for all
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
