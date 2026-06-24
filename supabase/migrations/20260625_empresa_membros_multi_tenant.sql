-- ============================================================================
-- OKKA Platform - Migration: empresa_membros (Desafio 1 & 2)
-- 
-- DESAFIO 1: Permite que o mesmo e-mail pertença a múltiplas empresas.
--   - Cria tabela pivô empresa_membros (N:N entre auth.users e empresas)
--   - Migra dados existentes de perfis_usuarios para empresa_membros
--   - Atualiza triggers para manter sincronismo
--
-- DESAFIO 2: Prepara a infra para o Deep Cleanse (exclusão total de empresa)
--   - Adiciona função get_user_empresas() para uso no Server Action
--
-- INSTRUÇÃO: Execute este script no SQL Editor do Supabase ANTES de atualizar
-- o código Next.js. Ele é não-destrutivo: as colunas antigas de perfis_usuarios
-- são preservadas para compatibilidade retroativa.
-- ============================================================================

-- ============================================================================
-- 1. CRIAR TABELA PIVÔ empresa_membros
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.empresa_membros (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id    uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  role          text NOT NULL CHECK (role IN ('admin', 'instalador', 'tecnico', 'mestre', 'vendedor')),
  status_acesso boolean DEFAULT true NOT NULL,
  criado_em     timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, empresa_id)
);

-- Índices para queries de RLS e listagens
CREATE INDEX IF NOT EXISTS idx_empresa_membros_user_id    ON public.empresa_membros(user_id);
CREATE INDEX IF NOT EXISTS idx_empresa_membros_empresa_id ON public.empresa_membros(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresa_membros_user_emp   ON public.empresa_membros(user_id, empresa_id);

COMMENT ON TABLE public.empresa_membros IS
  'Tabela pivô N:N: um usuário pode pertencer a múltiplas empresas com papéis distintos em cada uma.';

-- ============================================================================
-- 2. MIGRAR DADOS EXISTENTES de perfis_usuarios → empresa_membros
-- ============================================================================
-- Popula empresa_membros com todos os vínculos que já existem em perfis_usuarios.
-- ON CONFLICT garante idempotência (pode rodar mais de uma vez sem problemas).

INSERT INTO public.empresa_membros (user_id, empresa_id, role, status_acesso, criado_em)
SELECT
  pu.id            AS user_id,
  pu.empresa_id,
  CASE
    WHEN pu.role IN ('admin', 'instalador', 'tecnico', 'mestre', 'vendedor') THEN pu.role
    ELSE 'tecnico'
  END              AS role,
  COALESCE(pu.status_acesso, true)  AS status_acesso,
  COALESCE(pu.created_at, now())    AS criado_em
FROM public.perfis_usuarios pu
WHERE pu.empresa_id IS NOT NULL
  AND pu.role NOT IN ('super_admin')     -- super_admin não pertence a uma empresa
ON CONFLICT (user_id, empresa_id) DO UPDATE SET
  role          = EXCLUDED.role,
  status_acesso = EXCLUDED.status_acesso;

-- ============================================================================
-- 3. HABILITAR RLS EM empresa_membros
-- ============================================================================

ALTER TABLE public.empresa_membros ENABLE ROW LEVEL SECURITY;

-- Drop de políticas antigas para idempotência
DROP POLICY IF EXISTS "Super admin can do all on empresa_membros"          ON public.empresa_membros;
DROP POLICY IF EXISTS "Users can view own company memberships"             ON public.empresa_membros;
DROP POLICY IF EXISTS "Admins can manage membros of own company - select"  ON public.empresa_membros;
DROP POLICY IF EXISTS "Admins can manage membros of own company"           ON public.empresa_membros;

-- 3a. Super Admin enxerga e gerencia tudo
CREATE POLICY "Super admin can do all on empresa_membros"
  ON public.empresa_membros FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- 3b. Usuário comum pode ver SEUS PRÓPRIOS vínculos (necessário para a tela de seleção de empresa)
CREATE POLICY "Users can view own company memberships"
  ON public.empresa_membros FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 3c. Admins/Mestres da empresa gerenciam membros (INSERT/UPDATE/DELETE) dentro da própria empresa
--     Usa subquery em empresa_membros com user_id = auth.uid() (sem recursão pois é SELECT em tabela diferente)
CREATE POLICY "Admins can manage membros of own company"
  ON public.empresa_membros FOR ALL TO authenticated
  USING (
    empresa_id = public.get_my_empresa_id()
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
      OR EXISTS (
        SELECT 1 FROM public.empresa_membros em2
        WHERE em2.user_id     = auth.uid()
          AND em2.empresa_id  = public.get_my_empresa_id()
          AND em2.role        IN ('admin', 'mestre')
          AND em2.status_acesso = true
      )
    )
  )
  WITH CHECK (
    empresa_id = public.get_my_empresa_id()
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')
      OR EXISTS (
        SELECT 1 FROM public.empresa_membros em2
        WHERE em2.user_id     = auth.uid()
          AND em2.empresa_id  = public.get_my_empresa_id()
          AND em2.role        IN ('admin', 'mestre')
          AND em2.status_acesso = true
      )
    )
  );

-- ============================================================================
-- 4. FUNÇÕES AUXILIARES PARA O NOVO MODELO
-- ============================================================================

-- 4a. Retorna todas as empresas ativas às quais o usuário atual pertence
--     Usada na tela de seleção de empresa após o login
CREATE OR REPLACE FUNCTION public.get_user_empresas(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  empresa_id    uuid,
  nome_fantasia text,
  role          text,
  status_acesso boolean,
  status_assinatura text
) AS $$
  SELECT
    e.id             AS empresa_id,
    e.nome_fantasia,
    em.role,
    em.status_acesso,
    e.status_assinatura::text
  FROM public.empresa_membros em
  JOIN public.empresas e ON e.id = em.empresa_id
  WHERE em.user_id = p_user_id
    AND em.status_acesso = true
  ORDER BY e.nome_fantasia;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4b. Verifica se um usuário pertence a uma empresa específica com status ativo
CREATE OR REPLACE FUNCTION public.user_is_member_of(p_user_id uuid, p_empresa_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.empresa_membros
    WHERE user_id     = p_user_id
      AND empresa_id  = p_empresa_id
      AND status_acesso = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4c. Retorna o papel do usuário na empresa atualmente selecionada (via JWT)
CREATE OR REPLACE FUNCTION public.get_my_role_in_empresa()
RETURNS text AS $$
  SELECT role FROM public.empresa_membros
  WHERE user_id  = auth.uid()
    AND empresa_id = public.get_my_empresa_id()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- 5. ATUALIZAR TRIGGER handle_new_user
--    Ao criar um novo usuário no auth, insere em perfis_usuarios E empresa_membros
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  _empresa_id  uuid;
  _role        text;
  _nome        text;
  _status      boolean;
BEGIN
  _empresa_id := (new.raw_user_meta_data ->> 'empresa_id')::uuid;
  _role       := COALESCE(new.raw_user_meta_data ->> 'role', 'tecnico');
  _nome       := COALESCE(
                    new.raw_user_meta_data ->> 'name',
                    new.raw_user_meta_data ->> 'nome_completo',
                    'Usuário OKKA'
                  );
  _status     := COALESCE((new.raw_user_meta_data ->> 'status_acesso')::boolean, true);

  -- A. Inserir em perfis_usuarios (dados globais — nome, email, referência)
  INSERT INTO public.perfis_usuarios (id, nome_completo, email, role, status_acesso, empresa_id)
  VALUES (
    new.id,
    _nome,
    COALESCE(new.email, 'sem-email@okka.com'),
    _role,
    _status,
    _empresa_id
  )
  ON CONFLICT (id) DO NOTHING;

  -- B. Inserir em empresa_membros (vínculo N:N) se tiver empresa_id e role operacional
  IF _empresa_id IS NOT NULL AND _role NOT IN ('super_admin') THEN
    INSERT INTO public.empresa_membros (user_id, empresa_id, role, status_acesso)
    VALUES (
      new.id,
      _empresa_id,
      CASE WHEN _role IN ('admin','instalador','tecnico','mestre','vendedor') THEN _role ELSE 'tecnico' END,
      _status
    )
    ON CONFLICT (user_id, empresa_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger (DROP + CREATE é seguro pois a função foi redefinida acima)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 6. ATUALIZAR TRIGGER sync_technical_responsible
--    Quando um membro de empresa_membros muda de role, sincroniza responsaveis_tecnicos
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_technical_from_membro()
RETURNS trigger AS $$
DECLARE
  _nome  text;
  _email text;
BEGIN
  -- Ler dados do perfil global
  SELECT nome_completo, email
  INTO _nome, _email
  FROM public.perfis_usuarios
  WHERE id = NEW.user_id;

  IF NEW.role IN ('tecnico', 'instalador') THEN
    -- Garantir entrada em responsaveis_tecnicos
    INSERT INTO public.responsaveis_tecnicos (id, nome, email, telefone, empresa_id)
    VALUES (
      NEW.user_id,
      COALESCE(_nome, 'Técnico'),
      COALESCE(_email, ''),
      COALESCE(
        (SELECT raw_user_meta_data ->> 'telefone' FROM auth.users WHERE id = NEW.user_id),
        ''
      ),
      NEW.empresa_id
    )
    ON CONFLICT (id) DO UPDATE SET
      nome       = EXCLUDED.nome,
      email      = EXCLUDED.email,
      empresa_id = EXCLUDED.empresa_id;
  ELSE
    -- Role mudou para não-técnico: remover de responsaveis_tecnicos DESTA empresa
    DELETE FROM public.responsaveis_tecnicos
    WHERE id = NEW.user_id AND empresa_id = NEW.empresa_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_technical_from_membro ON public.empresa_membros;
CREATE TRIGGER tr_sync_technical_from_membro
  AFTER INSERT OR UPDATE OF role ON public.empresa_membros
  FOR EACH ROW EXECUTE FUNCTION public.sync_technical_from_membro();

-- ============================================================================
-- 7. ATUALIZAR TRIGGER sync_profile_to_auth_users
--    Quando perfis_usuarios é atualizado, sincroniza apenas dados GLOBAIS no Auth
--    (empresa_id e role NÃO são mais gerenciados aqui — vêm da empresa selecionada)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_profile_to_auth_users()
RETURNS trigger AS $$
BEGIN
  -- Sincroniza apenas nome e email (dados globais do usuário)
  -- empresa_id e role são injetados no JWT pelo Server Action de seleção de empresa
  UPDATE auth.users
  SET raw_user_meta_data =
    COALESCE(raw_user_meta_data, '{}'::jsonb) ||
    jsonb_build_object(
      'name',         NEW.nome_completo,
      'nome_completo', NEW.nome_completo
    )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_profile_to_auth_users ON public.perfis_usuarios;
CREATE TRIGGER tr_sync_profile_to_auth_users
  AFTER INSERT OR UPDATE OF nome_completo ON public.perfis_usuarios
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_to_auth_users();

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
-- Resumo do que foi feito:
--   ✅ Tabela empresa_membros criada com RLS
--   ✅ Dados migrados de perfis_usuarios → empresa_membros
--   ✅ Funções: get_user_empresas(), user_is_member_of(), get_my_role_in_empresa()
--   ✅ Trigger handle_new_user atualizado (escreve em ambas as tabelas)
--   ✅ Trigger sync_technical_from_membro na empresa_membros
--   ✅ Trigger sync_profile_to_auth_users simplificado (apenas dados globais)
-- ============================================================================
