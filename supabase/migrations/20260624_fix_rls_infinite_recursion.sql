-- OKKA Platform - Migration: Fix RLS Infinite Recursion
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Redefinir a função get_my_empresa_id() para buscar no auth.users em caso de fallback
CREATE OR REPLACE FUNCTION public.get_my_empresa_id()
RETURNS uuid AS $$
DECLARE
  _empresa_id text;
BEGIN
  -- A. Tentar ler do JWT metadata (mais rápido e evita loops de recursão)
  _empresa_id := auth.jwt() -> 'user_metadata' ->> 'empresa_id';
  IF _empresa_id IS NOT NULL THEN
    RETURN _empresa_id::uuid;
  END IF;

  -- B. Fallback: Buscar da tabela auth.users (evita loops de recursão com perfis_usuarios)
  RETURN (SELECT (raw_user_meta_data ->> 'empresa_id')::uuid FROM auth.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Redefinir a função is_super_admin() para buscar no auth.users em caso de fallback
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
DECLARE
  _role text;
BEGIN
  -- A. Tentar ler do JWT metadata
  _role := auth.jwt() -> 'user_metadata' ->> 'role';
  IF _role IS NOT NULL THEN
    RETURN _role = 'super_admin';
  END IF;

  -- B. Fallback: Buscar da tabela auth.users
  RETURN COALESCE((SELECT (raw_user_meta_data ->> 'role') = 'super_admin' FROM auth.users WHERE id = auth.uid()), false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
