-- =========================================================================
-- Script SQL para criar o primeiro Super Admin diretamente no Banco
-- Resolve o problema do trigger "check_profile_role_changes"
-- =========================================================================

-- 1. Desabilitar temporariamente todos os triggers da tabela para evitar bloqueios
ALTER TABLE public.perfis_usuarios DISABLE TRIGGER ALL;

DO $$
DECLARE
  _user_id uuid := gen_random_uuid();
  _email text := 'santfelicee@gmail.com';
  -- Senha encriptada usando pgcrypto (Senha: admin1234)
  _password_hash text := crypt('admin1234', gen_salt('bf', 10));
BEGIN
  -- Limpar qualquer tentativa anterior
  DELETE FROM auth.users WHERE email = _email;
  DELETE FROM public.perfis_usuarios WHERE email = _email;

  -- 2. Inserir na tabela do Supabase Auth (auth.users)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, recovery_sent_at, last_sign_in_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, 
    updated_at, confirmation_token, email_change, 
    email_change_token_new, recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000', 
    _user_id, 
    'authenticated', 
    'authenticated', 
    _email, 
    _password_hash, 
    now(), 
    null, 
    null, 
    '{"provider":"email","providers":["email"]}'::jsonb, 
    '{"role":"super_admin","name":"Super Admin TOP AR"}'::jsonb, 
    now(), 
    now(), 
    '', 
    '', 
    '', 
    ''
  );

  -- 3. Inserir na tabela pública de perfis (public.perfis_usuarios)
  INSERT INTO public.perfis_usuarios (id, nome_completo, email, role, status_acesso, empresa_id)
  VALUES (
    _user_id, 
    'Super Admin TOP AR', 
    _email, 
    'super_admin', 
    true, 
    null
  );

  RAISE NOTICE '✅ Usuário Super Admin santfelicee@gmail.com criado com sucesso!';
END $$;

-- 4. Re-habilitar todos os triggers
ALTER TABLE public.perfis_usuarios ENABLE TRIGGER ALL;
