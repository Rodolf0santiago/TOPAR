-- Migração: Adicionar anexo de PDF de Proposta para Visitas Técnicas

-- 1. Adicionar coluna na tabela visits (utilizada na base de dados atual)
ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS pdf_proposta_url TEXT NULL;

-- 2. Adicionar coluna na tabela visitas_tecnicas (conforme especificação solicitada)
-- Se a tabela existir no seu ambiente de produção:
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'visitas_tecnicas') THEN
        ALTER TABLE public.visitas_tecnicas ADD COLUMN IF NOT EXISTS pdf_proposta_url TEXT NULL;
    END IF;
END $$;

-- 3. Criar bucket 'documentos_crm' no Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos_crm', 'documentos_crm', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Definir políticas de RLS no storage.objects para o bucket 'documentos_crm'
-- Permitir leitura de arquivos por usuários autenticados
CREATE POLICY "Permitir leitura de documentos por autenticados"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos_crm');

-- Permitir inserção (upload) de arquivos por usuários autenticados
CREATE POLICY "Permitir upload de documentos por autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos_crm');

-- Permitir exclusão de arquivos por usuários autenticados (opcional, para limpeza futura)
CREATE POLICY "Permitir exclusão de documentos por autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos_crm');
