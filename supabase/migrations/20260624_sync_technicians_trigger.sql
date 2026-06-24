-- OKKA Platform - Migration: Auto-sync perfis_usuarios with responsaveis_tecnicos
-- Execute este script no SQL Editor do seu projeto Supabase.

-- Garantir que a Empresa Padrão (fallback) existe no banco de dados para evitar violações de chave estrangeira
INSERT INTO public.empresas (id, nome_fantasia, cnpj, status_assinatura)
VALUES ('00000000-0000-0000-0000-000000000000', 'Empresa Padrão', '00000000000000', 'ativa')
ON CONFLICT (id) DO NOTHING;

-- 1. Criar ou substituir a função de sincronização de técnicos
CREATE OR REPLACE FUNCTION public.sync_technical_responsible()
RETURNS trigger AS $$
BEGIN
  -- Se a role do usuário é tecnico ou instalador, garante que ele existe em responsaveis_tecnicos
  IF NEW.role IN ('tecnico', 'instalador') THEN
    INSERT INTO public.responsaveis_tecnicos (id, nome, email, telefone, empresa_id)
    VALUES (
      NEW.id,
      NEW.nome_completo,
      NEW.email,
      COALESCE((SELECT telefone FROM public.responsaveis_tecnicos WHERE id = NEW.id), ''),
      NEW.empresa_id
    )
    ON CONFLICT (id) DO UPDATE SET
      nome = EXCLUDED.nome,
      email = EXCLUDED.email,
      empresa_id = EXCLUDED.empresa_id;
  ELSE
    -- Se a role mudou para outra coisa, remove da tabela de técnicos para não poluir a listagem
    DELETE FROM public.responsaveis_tecnicos WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Vincular a função ao trigger na tabela perfis_usuarios
DROP TRIGGER IF EXISTS tr_sync_technical_responsible ON public.perfis_usuarios;
CREATE TRIGGER tr_sync_technical_responsible
  AFTER INSERT OR UPDATE OF role, nome_completo, email, empresa_id ON public.perfis_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_technical_responsible();

-- 3. Sincronizar retroativamente todos os técnicos e instaladores já existentes no banco
INSERT INTO public.responsaveis_tecnicos (id, nome, email, telefone, empresa_id)
SELECT id, nome_completo, email, '', empresa_id 
FROM public.perfis_usuarios 
WHERE role IN ('tecnico', 'instalador')
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  empresa_id = EXCLUDED.empresa_id;
