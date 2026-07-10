-- OKKA Platform - Target Database Schema (Clean & Recreated)
-- Execute este script no SQL Editor do seu projeto Supabase.
-- ATENÇÃO: Este script limpa o schema 'public' para evitar conflitos de tabelas/triggers/funções antigas e instala o banco final pronto para uso.

-- =========================================================================
-- 0. RESETAR O SCHEMA PUBLIC (Evita qualquer conflito de tabelas parciais)
-- =========================================================================
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- =========================================================================
-- 1. ENUMS E TABELA DE EMPRESAS (SaaS Multi-Tenant)
-- =========================================================================
CREATE TYPE public.status_assinatura_enum AS ENUM ('ativa', 'inadimplente', 'cancelada');

CREATE TABLE public.empresas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_fantasia text NOT NULL,
  cnpj text UNIQUE NOT NULL,
  status_assinatura public.status_assinatura_enum DEFAULT 'ativa'::public.status_assinatura_enum NOT NULL,
  assinatura_mp_id text,
  mensalidade_customizada numeric(12,2) DEFAULT NULL,
  desconto_mensal numeric(12,2) DEFAULT 0.00,
  motivo_desconto text DEFAULT NULL,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir empresa padrão para evitar quebras de integridade
INSERT INTO public.empresas (id, nome_fantasia, cnpj, status_assinatura)
VALUES ('00000000-0000-0000-0000-000000000000', 'Empresa Padrão', '00000000000000', 'ativa')
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 2. TABELA DE PERFIS DE USUÁRIOS (perfis_usuarios)
-- =========================================================================
CREATE TABLE public.perfis_usuarios (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome_completo text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('admin', 'instalador', 'tecnico', 'mestre', 'vendedor', 'super_admin')),
  status_acesso boolean DEFAULT true NOT NULL,
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE,
  senha_temp text DEFAULT 'OkkaMestre2026!',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 3. TABELA PIVÔ empresa_membros (Múltiplas empresas por e-mail)
-- =========================================================================
CREATE TABLE public.empresa_membros (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'instalador', 'tecnico', 'mestre', 'vendedor')),
  status_acesso boolean DEFAULT true NOT NULL,
  criado_em timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, empresa_id)
);

CREATE INDEX IF NOT EXISTS idx_empresa_membros_user_id ON public.empresa_membros(user_id);
CREATE INDEX IF NOT EXISTS idx_empresa_membros_empresa_id ON public.empresa_membros(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresa_membros_user_emp ON public.empresa_membros(user_id, empresa_id);

COMMENT ON TABLE public.empresa_membros IS 'Tabela pivô N:N: um usuário pode pertencer a múltiplas empresas com papéis distintos.';

-- =========================================================================
-- 4. TABELA LEADS (Contatos Iniciais / Oportunidades do CRM)
-- =========================================================================
CREATE TABLE public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  email text,
  telefone text NOT NULL,
  cidade text NOT NULL,
  area_m2 numeric(10,2),
  status text DEFAULT 'Novo' NOT NULL CHECK (status IN ('Novo', 'Em Contato', 'Qualificado', 'Perdido')),
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE,
  endereco_obra text,
  valor_estimado numeric(12,2) DEFAULT 0.00,
  materiais_previstos jsonb DEFAULT '[]'::jsonb,
  observacoes text,
  cep text DEFAULT NULL,
  numero text DEFAULT NULL,
  tipo_servico text DEFAULT NULL
);

-- =========================================================================
-- 5. TABELA PROJECTS (Projetos do CRM)
-- =========================================================================
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  status_projeto text DEFAULT 'Orçamento' NOT NULL CHECK (status_projeto IN ('Orçamento', 'Preparação', 'Instalação', 'Teste de Carga', 'Concluído')),
  endereco text NOT NULL,
  valor_total numeric(12,2) DEFAULT 0.00 NOT NULL,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE
);

-- =========================================================================
-- 6. TABELA RESPONSÁVEIS TÉCNICOS
-- =========================================================================
CREATE TABLE public.responsaveis_tecnicos (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome text NOT NULL,
  telefone text NOT NULL,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE
);

-- =========================================================================
-- 7. TABELA VISITS (Visitas Técnicas / Relatórios de Campo)
-- =========================================================================
CREATE TABLE public.visits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  data_visita date NOT NULL,
  horario time without time zone NOT NULL,
  status_visita text DEFAULT 'Agendada' NOT NULL CHECK (status_visita IN ('Agendada', 'Realizada', 'Cancelada')),
  material_usado jsonb DEFAULT '[]'::jsonb NOT NULL,
  valor_gasto numeric(12,2) DEFAULT 0.00 NOT NULL,
  observacoes text,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  tecnico_id uuid REFERENCES public.responsaveis_tecnicos(id) ON DELETE SET NULL,
  whatsapp_enviado boolean DEFAULT false NOT NULL,
  whatsapp_log text,
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE,
  agendado_por text,
  pdf_proposta_url text,
  realizada_com_atraso boolean DEFAULT false NOT NULL
);

-- =========================================================================
-- 8. TABELAS ADICIONAIS: WHATSAPP, GDRIVE, PLANOS E FATURAS
-- =========================================================================
CREATE SEQUENCE IF NOT EXISTS public.whatsapp_config_id_seq;

CREATE TABLE public.whatsapp_config (
  id integer PRIMARY KEY DEFAULT nextval('public.whatsapp_config_id_seq'),
  ativo boolean DEFAULT false NOT NULL,
  api_provider text DEFAULT 'evolution' NOT NULL CHECK (api_provider IN ('evolution', 'zapi', 'custom')),
  api_url text,
  api_key text,
  instancia text,
  antecedencia_minutos integer DEFAULT 60 NOT NULL,
  mensagem_template text DEFAULT 'Olá {nome_tecnico}, sua próxima visita técnica para o cliente {cliente_nome} no endereço {endereco_obra} será daqui a {antecedencia} (agendada para às {horario_visita}).' NOT NULL,
  headers_customizados text,
  payload_customizado text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE UNIQUE
);

CREATE TABLE public.gdrive_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE UNIQUE,
  folder_id text NOT NULL,
  service_account_json text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.planos_saas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  valor numeric(12,2) NOT NULL,
  mp_plan_id text NOT NULL,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.faturas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  valor numeric(12,2) NOT NULL,
  data_vencimento timestamp with time zone NOT NULL,
  status text NOT NULL CHECK (status IN ('Pendente', 'Paga', 'Falhou')),
  mp_payment_id text,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.permissoes_abas (
  role text PRIMARY KEY CHECK (role IN ('admin', 'instalador', 'tecnico', 'mestre', 'vendedor')),
  dashboard boolean DEFAULT true NOT NULL,
  leads boolean DEFAULT true NOT NULL,
  visitas boolean DEFAULT true NOT NULL,
  projetos boolean DEFAULT true NOT NULL,
  equipe boolean DEFAULT true NOT NULL,
  eficiencia boolean DEFAULT true NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.tipos_servico (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text UNIQUE NOT NULL,
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.materiais_predefinidos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  tipo_servico text,
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT materiais_predefinidos_empresa_id_nome_tipo_servico_key UNIQUE(empresa_id, nome, tipo_servico)
);

-- =========================================================================
-- 9. FUNÇÕES DE AUXÍLIO E SEGURANÇA (RLS & JWT CLAIMS)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.get_my_empresa_id()
RETURNS uuid AS $$
DECLARE
  _empresa_id text;
BEGIN
  -- A. Ler do JWT metadata (mais rápido e evita loops de recursão)
  _empresa_id := auth.jwt() -> 'user_metadata' ->> 'empresa_id';
  IF _empresa_id IS NOT NULL THEN
    RETURN _empresa_id::uuid;
  END IF;

  -- B. Fallback: Buscar direto da tabela auth.users (evita loops de recursão)
  RETURN (SELECT (raw_user_meta_data ->> 'empresa_id')::uuid FROM auth.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
DECLARE
  _role text;
BEGIN
  -- A. Ler do JWT metadata
  _role := auth.jwt() -> 'user_metadata' ->> 'role';
  IF _role IS NOT NULL THEN
    RETURN _role = 'super_admin';
  END IF;

  -- B. Fallback: Buscar direto da tabela auth.users
  RETURN COALESCE((SELECT (raw_user_meta_data ->> 'role') = 'super_admin' FROM auth.users WHERE id = auth.uid()), false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =========================================================================
-- 10. TRIGGERS OPERACIONAIS E DE SINCRONIZAÇÃO
-- =========================================================================

-- Trigger: Criar Perfil de Usuário Automaticamente no SignUp
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfis_usuarios (id, nome_completo, email, role, status_acesso, empresa_id)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuário OKKA'),
    coalesce(new.email, 'sem-email@okka.com'),
    coalesce(new.raw_user_meta_data->>'role', 'instalador'),
    coalesce((new.raw_user_meta_data->>'status_acesso')::boolean, true),
    (new.raw_user_meta_data->>'empresa_id')::uuid
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger: Sincronização Bidirecional (Perfis -> Auth metadata)
CREATE OR REPLACE FUNCTION public.sync_profile_to_auth_users()
RETURNS trigger AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'empresa_id', NEW.empresa_id,
      'role', NEW.role,
      'name', NEW.nome_completo,
      'nome_completo', NEW.nome_completo,
      'status_acesso', NEW.status_acesso
    )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_sync_profile_to_auth_users
  AFTER INSERT OR UPDATE OF empresa_id, role, nome_completo, status_acesso ON public.perfis_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_to_auth_users();

-- Trigger: Prevenir Escalonamento de Privilégios (Apenas SuperAdmins alteram a role 'super_admin')
CREATE OR REPLACE FUNCTION public.check_profile_role_changes()
RETURNS trigger AS $$
BEGIN
  IF NEW.role = 'super_admin' THEN
    IF NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Não autorizado: Apenas SuperAdmins podem atribuir a role super_admin.';
    END IF;
  END IF;

  IF OLD.role = 'super_admin' AND NEW.role <> 'super_admin' THEN
    IF NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Não autorizado: Apenas SuperAdmins podem remover a role super_admin.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_check_profile_role_changes
  BEFORE INSERT OR UPDATE OF role ON public.perfis_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_role_changes();

-- Trigger: Marcar visitas realizadas com atraso
CREATE OR REPLACE FUNCTION public.check_visit_delay_on_update()
RETURNS trigger AS $$
DECLARE
  _scheduled timestamp;
  _now_sp timestamp;
BEGIN
  _scheduled := (NEW.data_visita + NEW.horario);
  _now_sp := timezone('America/Sao_Paulo'::text, now());

  IF NEW.status_visita = 'Realizada' AND (TG_OP = 'INSERT' OR COALESCE(OLD.status_visita, '') <> 'Realizada') THEN
    IF _now_sp > _scheduled THEN
      NEW.realizada_com_atraso := true;
    END IF;
  END IF;

  IF NEW.status_visita <> 'Realizada' THEN
    NEW.realizada_com_atraso := false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_check_visit_delay_on_update
  BEFORE INSERT OR UPDATE OF status_visita, data_visita, horario ON public.visits
  FOR EACH ROW
  EXECUTE FUNCTION public.check_visit_delay_on_update();

-- Trigger: Sincronizar Técnicos/Instaladores na tabela responsaveis_tecnicos
CREATE OR REPLACE FUNCTION public.sync_technical_responsible()
RETURNS trigger AS $$
BEGIN
  IF NEW.role IN ('tecnico', 'instalador') THEN
    INSERT INTO public.responsaveis_tecnicos (id, nome, email, telefone, empresa_id)
    VALUES (
      NEW.id,
      NEW.nome_completo,
      NEW.email,
      COALESCE(
        (SELECT (raw_user_meta_data ->> 'telefone') FROM auth.users WHERE id = NEW.id),
        COALESCE((SELECT telefone FROM public.responsaveis_tecnicos WHERE id = NEW.id), '')
      ),
      NEW.empresa_id
    )
    ON CONFLICT (id) DO UPDATE SET
      nome = EXCLUDED.nome,
      email = EXCLUDED.email,
      telefone = EXCLUDED.telefone,
      empresa_id = EXCLUDED.empresa_id;
  ELSE
    DELETE FROM public.responsaveis_tecnicos WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_sync_technical_responsible
  AFTER INSERT OR UPDATE OF role, nome_completo, email, empresa_id ON public.perfis_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_technical_responsible();

-- Trigger: Preencher empresa_id automaticamente se omitido
CREATE OR REPLACE FUNCTION public.set_empresa_id_on_insert_or_update()
RETURNS trigger AS $$
BEGIN
  IF NEW.empresa_id IS NULL THEN
    NEW.empresa_id := COALESCE(
      public.get_my_empresa_id(),
      '00000000-0000-0000-0000-000000000000'::uuid
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_set_projects_empresa_id
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_on_insert_or_update();

CREATE OR REPLACE TRIGGER tr_set_leads_empresa_id
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_on_insert_or_update();

CREATE OR REPLACE TRIGGER tr_set_visits_empresa_id
  BEFORE INSERT OR UPDATE ON public.visits
  FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_on_insert_or_update();

CREATE OR REPLACE TRIGGER tr_set_responsaveis_tecnicos_empresa_id
  BEFORE INSERT OR UPDATE ON public.responsaveis_tecnicos
  FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_on_insert_or_update();

CREATE OR REPLACE TRIGGER tr_set_whatsapp_config_empresa_id
  BEFORE INSERT OR UPDATE ON public.whatsapp_config
  FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_on_insert_or_update();

CREATE OR REPLACE TRIGGER tr_set_materiais_predefinidos_empresa_id
  BEFORE INSERT OR UPDATE ON public.materiais_predefinidos
  FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_on_insert_or_update();

-- Trigger: Preencher automaticamente empresa_id do Tipo de Serviço
CREATE OR REPLACE FUNCTION public.set_tipos_servico_empresa_id()
RETURNS trigger AS $$
BEGIN
  IF NEW.empresa_id IS NULL THEN
    NEW.empresa_id := public.get_my_empresa_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_set_tipos_servico_empresa_id
  BEFORE INSERT OR UPDATE ON public.tipos_servico
  FOR EACH ROW EXECUTE FUNCTION public.set_tipos_servico_empresa_id();

-- Trigger: Excluir Usuário correspondente na auth.users quando deletar o Perfil
CREATE OR REPLACE FUNCTION public.handle_delete_user_profile()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = OLD.id) THEN
    DELETE FROM auth.users WHERE id = OLD.id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_on_profile_deleted
  AFTER DELETE ON public.perfis_usuarios
  FOR EACH ROW EXECUTE FUNCTION public.handle_delete_user_profile();

-- =========================================================================
-- 11. HABILITAR RLS E CONFIGURAR POLÍTICAS DE SEGURANÇA
-- =========================================================================

-- Empresas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin can do all on empresas" ON public.empresas FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "Users can view their own empresa" ON public.empresas FOR SELECT TO authenticated USING (id = public.get_my_empresa_id());

-- Perfis Usuários
ALTER TABLE public.perfis_usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin can do all on perfis_usuarios" ON public.perfis_usuarios FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "Perfis usuarios select policy" ON public.perfis_usuarios FOR SELECT TO authenticated USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id() OR id = auth.uid());
CREATE POLICY "Perfis usuarios update policy" ON public.perfis_usuarios FOR UPDATE TO authenticated USING (public.is_super_admin() OR (empresa_id = public.get_my_empresa_id() AND ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre')))) WITH CHECK (public.is_super_admin() OR (empresa_id = public.get_my_empresa_id() AND ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre'))));
CREATE POLICY "Perfis usuarios insert policy" ON public.perfis_usuarios FOR INSERT TO authenticated WITH CHECK (public.is_super_admin() OR (empresa_id = public.get_my_empresa_id() AND ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre'))));
CREATE POLICY "Perfis usuarios delete policy" ON public.perfis_usuarios FOR DELETE TO authenticated USING (public.is_super_admin() OR (empresa_id = public.get_my_empresa_id() AND ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre'))));

-- Empresa Membros
ALTER TABLE public.empresa_membros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin can do all on empresa_membros" ON public.empresa_membros FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "Users can view own company memberships" ON public.empresa_membros FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage membros of own company" ON public.empresa_membros FOR ALL TO authenticated USING (empresa_id = public.get_my_empresa_id() AND ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre') OR EXISTS (SELECT 1 FROM public.empresa_membros em2 WHERE em2.user_id = auth.uid() AND em2.empresa_id = public.get_my_empresa_id() AND em2.role IN ('admin', 'mestre') AND em2.status_acesso = true))) WITH CHECK (empresa_id = public.get_my_empresa_id() AND ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre') OR EXISTS (SELECT 1 FROM public.empresa_membros em2 WHERE em2.user_id = auth.uid() AND em2.empresa_id = public.get_my_empresa_id() AND em2.role IN ('admin', 'mestre') AND em2.status_acesso = true)));

-- Leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Público pode criar leads pela Landing Page" ON public.leads FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Leads multi-tenant policy" ON public.leads FOR ALL TO authenticated USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id()) WITH CHECK (public.is_super_admin() OR empresa_id = public.get_my_empresa_id());

-- Projetos
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects multi-tenant policy" ON public.projects FOR ALL TO authenticated USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id()) WITH CHECK (public.is_super_admin() OR empresa_id = public.get_my_empresa_id());

-- Responsáveis Técnicos
ALTER TABLE public.responsaveis_tecnicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Responsaveis tecnicos multi-tenant policy" ON public.responsaveis_tecnicos FOR ALL TO authenticated USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id()) WITH CHECK (public.is_super_admin() OR empresa_id = public.get_my_empresa_id());

-- Visitas (Visits)
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin can do all on visits" ON public.visits FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "Admins e Mestres total access within company" ON public.visits FOR ALL TO authenticated USING (empresa_id = public.get_my_empresa_id() AND ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre') OR EXISTS (SELECT 1 FROM public.perfis_usuarios WHERE perfis_usuarios.id = auth.uid() AND perfis_usuarios.role IN ('admin', 'mestre')))) WITH CHECK (empresa_id = public.get_my_empresa_id() AND ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'mestre') OR EXISTS (SELECT 1 FROM public.perfis_usuarios WHERE perfis_usuarios.id = auth.uid() AND perfis_usuarios.role IN ('admin', 'mestre'))));
CREATE POLICY "Tecnicos e Instaladores can view their assigned visits within company" ON public.visits FOR SELECT TO authenticated USING (empresa_id = public.get_my_empresa_id() AND tecnico_id = auth.uid());
CREATE POLICY "Tecnicos e Instaladores can update their assigned visits within company" ON public.visits FOR UPDATE TO authenticated USING (empresa_id = public.get_my_empresa_id() AND tecnico_id = auth.uid()) WITH CHECK (empresa_id = public.get_my_empresa_id() AND tecnico_id = auth.uid());

-- WhatsApp Config
ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Whatsapp config multi-tenant policy" ON public.whatsapp_config FOR ALL TO authenticated USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id()) WITH CHECK (public.is_super_admin() OR empresa_id = public.get_my_empresa_id());

-- Google Drive Config
ALTER TABLE public.gdrive_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can select their own company's gdrive config" ON public.gdrive_config FOR SELECT TO authenticated USING (empresa_id = public.get_my_empresa_id() OR public.is_super_admin());
CREATE POLICY "Users can manage their own company's gdrive config" ON public.gdrive_config FOR ALL TO authenticated USING (empresa_id = public.get_my_empresa_id() OR public.is_super_admin()) WITH CHECK (empresa_id = public.get_my_empresa_id() OR public.is_super_admin());

-- Planos SaaS
ALTER TABLE public.planos_saas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Qualquer usuario autenticado pode ver planos" ON public.planos_saas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Apenas super admin pode gerenciar planos" ON public.planos_saas FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- Faturas
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios podem ver faturas de sua propria empresa" ON public.faturas FOR SELECT TO authenticated USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id());

-- Permissões de Abas
ALTER TABLE public.permissoes_abas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Qualquer autenticado pode ler abas" ON public.permissoes_abas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Apenas gestores alteram abas" ON public.permissoes_abas FOR ALL TO authenticated USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'mestre') WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'mestre');

-- Tipos de Serviço
ALTER TABLE public.tipos_servico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tipos servico multi-tenant policy" ON public.tipos_servico FOR ALL TO authenticated USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id() OR empresa_id = '00000000-0000-0000-0000-000000000000') WITH CHECK (public.is_super_admin() OR empresa_id = public.get_my_empresa_id());

-- Materiais Pré-definidos
ALTER TABLE public.materiais_predefinidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Materiais predefinidos multi-tenant policy" ON public.materiais_predefinidos FOR ALL TO authenticated USING (public.is_super_admin() OR empresa_id = public.get_my_empresa_id() OR empresa_id = '00000000-0000-0000-0000-000000000000') WITH CHECK (public.is_super_admin() OR empresa_id = public.get_my_empresa_id());

-- =========================================================================
-- 12. SEEDS E INSERÇÕES INICIAIS
-- =========================================================================

-- Planos SaaS Padrão
INSERT INTO public.planos_saas (id, nome, valor, mp_plan_id)
VALUES ('d3b07384-d113-49d5-a50d-bf4cf166a012', 'Pro Mensal', 99.90, '2c93808486987c2b01869cbbf9020478')
ON CONFLICT (id) DO NOTHING;

-- Configurações padrão de Abas
INSERT INTO public.permissoes_abas (role, dashboard, leads, visitas, projetos, equipe, eficiencia) VALUES
  ('admin', true, true, true, true, true, true),
  ('mestre', true, true, true, true, true, true),
  ('vendedor', true, true, true, true, false, false),
  ('tecnico', false, false, true, false, false, false),
  ('instalador', false, false, true, false, false, false)
ON CONFLICT (role) DO UPDATE SET
  dashboard = EXCLUDED.dashboard,
  leads = EXCLUDED.leads,
  visitas = EXCLUDED.visitas,
  projetos = EXCLUDED.projetos,
  equipe = EXCLUDED.equipe,
  eficiencia = EXCLUDED.eficiencia,
  updated_at = timezone('utc'::text, now());

-- Tipos de Serviço iniciais da Empresa Padrão
INSERT INTO public.tipos_servico (nome, empresa_id) VALUES
  ('Aquecimento de piso', '00000000-0000-0000-0000-000000000000'),
  ('Instalação Sistemas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Limpeza de placas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Carregamento Veicular', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (nome) DO NOTHING;

-- Materiais Iniciais da Empresa Padrão
INSERT INTO public.materiais_predefinidos (nome, tipo_servico, empresa_id) VALUES
  ('Cabo Calefator 15W/m', 'Aquecimento de piso', '00000000-0000-0000-0000-000000000000'),
  ('Cabo Calefator 20W/m', 'Aquecimento de piso', '00000000-0000-0000-0000-000000000000'),
  ('Termostato Wifi Black', 'Aquecimento de piso', '00000000-0000-0000-0000-000000000000'),
  ('Termostato Wifi White', 'Aquecimento de piso', '00000000-0000-0000-0000-000000000000'),
  ('Termostato Digital Programável', 'Aquecimento de piso', '00000000-0000-0000-0000-000000000000'),
  ('Isolamento Térmico (Refletivo)', 'Aquecimento de piso', '00000000-0000-0000-0000-000000000000'),
  ('Sensor de Piso NTC', 'Aquecimento de piso', '00000000-0000-0000-0000-000000000000'),
  ('Malha Metálica de Fixação', 'Aquecimento de piso', '00000000-0000-0000-0000-000000000000'),
  ('Fita de Fixação Adesiva', 'Aquecimento de piso', '00000000-0000-0000-0000-000000000000'),
  
  ('Painel Solar 550W', 'Instalação Sistemas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Inversor Monofásico 5kW', 'Instalação Sistemas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Estrutura de Fixação Telhado', 'Instalação Sistemas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Cabo Solar 6mm Preto', 'Instalação Sistemas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Cabo Solar 6mm Vermelho', 'Instalação Sistemas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Conector MC4', 'Instalação Sistemas Solares', '00000000-0000-0000-0000-000000000000'),
  
  ('Escova de Limpeza Extensível', 'Limpeza de placas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Detergente Neutro Solar', 'Limpeza de placas Solares', '00000000-0000-0000-0000-000000000000'),
  ('Rodo Extensível 6m', 'Limpeza de placas Solares', '00000000-0000-0000-0000-000000000000'),
  
  ('Wallbox 22kW Inteligente', 'Carregamento Veicular', '00000000-0000-0000-0000-000000000000'),
  ('Cabo Tipo 2 Reforçado', 'Carregamento Veicular', '00000000-0000-0000-0000-000000000000'),
  ('Disjuntor 32A Bipolar', 'Carregamento Veicular', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (empresa_id, nome, tipo_servico) DO NOTHING;

-- Configuração padrão de WhatsApp
INSERT INTO public.whatsapp_config (id, ativo, api_provider, antecedencia_minutos, empresa_id)
VALUES (1, false, 'evolution', 60, '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 13. CONFIGURAR STORAGE BUCKETS (Documentos do CRM)
-- =========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos_crm', 'documentos_crm', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas do Storage RLS
DROP POLICY IF EXISTS "Permitir leitura de documentos por autenticados" ON storage.objects;
CREATE POLICY "Permitir leitura de documentos por autenticados" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documentos_crm');

DROP POLICY IF EXISTS "Permitir upload de documentos por autenticados" ON storage.objects;
CREATE POLICY "Permitir upload de documentos por autenticados" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documentos_crm');

DROP POLICY IF EXISTS "Permitir exclusão de documentos por autenticados" ON storage.objects;
CREATE POLICY "Permitir exclusão de documentos por autenticados" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documentos_crm');
