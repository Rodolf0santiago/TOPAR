-- OKKA Platform - Migration: Super Admin View Passwords
-- Execute este script no SQL Editor do seu projeto Supabase para adicionar suporte à visualização de senhas pelo Super Admin.

ALTER TABLE public.perfis_usuarios ADD COLUMN IF NOT EXISTS senha_temp text DEFAULT 'OkkaMestre2026!';
