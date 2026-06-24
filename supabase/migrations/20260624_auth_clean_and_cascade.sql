-- OKKA Platform - Migration: Auth User Cleanup on Profile Delete, Empresa Cascade Delete & RLS Recursion Fix
-- Execute este script no SQL Editor do seu projeto Supabase.

-- =========================================================================
-- 1. CORREÇÃO DE RECURSÃO INFINITA (Redefinição das funções de auxílio RLS)
-- =========================================================================

-- Redefinir a função get_my_empresa_id() para buscar no auth.users em caso de fallback (evitando recursão infinita com perfis_usuarios)
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

-- Redefinir a função is_super_admin() para buscar no auth.users em caso de fallback (evitando recursão infinita com perfis_usuarios)
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

-- =========================================================================
-- 2. AJUSTE DE POLÍTICAS RLS PARA EVITAR RECURSÃO NO SELECT
-- =========================================================================

-- Desmembrar a política "Perfis usuarios insert/delete policy" de FOR ALL para FOR INSERT e FOR DELETE específicos.
-- Como ela possuía uma verificação subquery (EXISTS) na própria tabela perfis_usuarios, quando o comando era FOR ALL
-- a política de SELECT a acionava recursivamente, causando o estouro de pilha (infinite recursion).
DROP POLICY IF EXISTS "Perfis usuarios insert/delete policy" ON public.perfis_usuarios;
DROP POLICY IF EXISTS "Perfis usuarios insert policy" ON public.perfis_usuarios;
DROP POLICY IF EXISTS "Perfis usuarios delete policy" ON public.perfis_usuarios;

CREATE POLICY "Perfis usuarios insert policy" ON public.perfis_usuarios
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_super_admin() 
    OR (
      empresa_id = public.get_my_empresa_id() 
      AND (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
        OR EXISTS (
          SELECT 1 FROM public.perfis_usuarios 
          WHERE perfis_usuarios.id = auth.uid() 
          AND perfis_usuarios.role IN ('admin', 'mestre')
        )
      )
    )
  );

CREATE POLICY "Perfis usuarios delete policy" ON public.perfis_usuarios
  FOR DELETE TO authenticated
  USING (
    public.is_super_admin() 
    OR (
      empresa_id = public.get_my_empresa_id() 
      AND (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
        OR EXISTS (
          SELECT 1 FROM public.perfis_usuarios 
          WHERE perfis_usuarios.id = auth.uid() 
          AND perfis_usuarios.role IN ('admin', 'mestre')
        )
      )
    )
  );

-- =========================================================================
-- 3. CONFIGURAR ON DELETE CASCADE PARA EMPRESAS
-- =========================================================================

-- Tabela perfis_usuarios (alterar de SET NULL para CASCADE)
ALTER TABLE public.perfis_usuarios
  DROP CONSTRAINT IF EXISTS perfis_usuarios_empresa_id_fkey,
  DROP CONSTRAINT IF EXISTS fk_perfis_usuarios_empresa;

ALTER TABLE public.perfis_usuarios
  ADD CONSTRAINT perfis_usuarios_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
  ON DELETE CASCADE;

-- Garantir que as outras tabelas tenham ON DELETE CASCADE
ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_empresa_id_fkey;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
  ON DELETE CASCADE;

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_empresa_id_fkey;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
  ON DELETE CASCADE;

ALTER TABLE public.visits
  DROP CONSTRAINT IF EXISTS visits_empresa_id_fkey;
ALTER TABLE public.visits
  ADD CONSTRAINT visits_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
  ON DELETE CASCADE;

ALTER TABLE public.responsaveis_tecnicos
  DROP CONSTRAINT IF EXISTS responsaveis_tecnicos_empresa_id_fkey;
ALTER TABLE public.responsaveis_tecnicos
  ADD CONSTRAINT responsaveis_tecnicos_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
  ON DELETE CASCADE;

ALTER TABLE public.whatsapp_config
  DROP CONSTRAINT IF EXISTS whatsapp_config_empresa_id_fkey;
ALTER TABLE public.whatsapp_config
  ADD CONSTRAINT whatsapp_config_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
  ON DELETE CASCADE;

ALTER TABLE public.materiais_predefinidos
  DROP CONSTRAINT IF EXISTS materiais_predefinidos_empresa_id_fkey;
ALTER TABLE public.materiais_predefinidos
  ADD CONSTRAINT materiais_predefinidos_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
  ON DELETE CASCADE;

-- =========================================================================
-- 4. CRIAR TRIGGER DE EXCLUSÃO DEFINITIVA NO AUTH.USERS
-- =========================================================================

CREATE OR REPLACE FUNCTION public.handle_delete_user_profile()
RETURNS trigger AS $$
BEGIN
  -- Deleta do auth.users caso ainda exista (evitando recursão se o delete partiu do auth)
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = OLD.id) THEN
    DELETE FROM auth.users WHERE id = OLD.id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar a trigger na tabela perfis_usuarios
DROP TRIGGER IF EXISTS tr_on_profile_deleted ON public.perfis_usuarios;
CREATE TRIGGER tr_on_profile_deleted
  AFTER DELETE ON public.perfis_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_delete_user_profile();
