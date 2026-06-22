-- OKKA Platform - Migration: Adicionar coluna 'agendado_por' para registrar quem marcou a visita
-- Execute este script no SQL Editor do seu projeto Supabase.

alter table public.visits 
add column if not exists agendado_por text;
