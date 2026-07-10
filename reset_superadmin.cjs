const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env dynamically to get project URL and keys
const dotenvPath = path.join(__dirname, '.env');
const env = {};
if (fs.existsSync(dotenvPath)) {
  const content = fs.readFileSync(dotenvPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("❌ Erro: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas no arquivo .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const email = 'santfelicee@gmail.com';
  const password = 'admin1234';

  console.log(`Conectando ao Supabase em: ${supabaseUrl}`);
  
  // Query all profiles first
  const { data: profiles, error: profError } = await supabase.from('perfis_usuarios').select('*');
  if (profError) {
    console.warn('Erro ao consultar perfis_usuarios:', profError.message);
  } else {
    console.log('Perfis existentes na tabela:', profiles);
  }

  // List users to check if they exist
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw new Error('Erro ao listar usuários: ' + listError.message);
  }

  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    console.log(`Usuário encontrado no Auth (ID: ${existingUser.id}). Atualizando...`);
    
    const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: password,
      user_metadata: { role: 'super_admin', name: 'Super Admin TOP AR' }
    });
    if (updateError) {
      console.error('Erro detalhado no update:', updateError);
      throw new Error('Erro ao atualizar usuário: ' + updateError.message);
    }
    
    const { error: dbError } = await supabase
      .from('perfis_usuarios')
      .update({ role: 'super_admin', status_acesso: true })
      .eq('id', existingUser.id);
      
    if (dbError) {
      console.warn('Erro ao atualizar perfis_usuarios:', dbError.message);
    }

    console.log('✅ Usuário existente atualizado com sucesso!');
  } else {
    console.log(`Usuário não encontrado no Auth. Criando novo usuário Super Admin...`);
    
    // Check if profile exists and delete it first if it does, to prevent unique email constraint violation!
    const existingProfile = profiles ? profiles.find(p => p.email.toLowerCase() === email.toLowerCase()) : null;
    if (existingProfile) {
      console.log(`Perfil com e-mail ${email} já existia na tabela perfis_usuarios (ID: ${existingProfile.id}). Removendo para evitar conflito...`);
      const { error: delError } = await supabase.from('perfis_usuarios').delete().eq('id', existingProfile.id);
      if (delError) {
        console.warn('Erro ao remover perfil órfão:', delError.message);
      }
    }

    const { data, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'super_admin', name: 'Super Admin TOP AR' }
    });
    if (createError) {
      console.error('Erro detalhado na criação:', createError);
      throw new Error('Erro ao criar usuário: ' + createError.message);
    }
    
    console.log('✅ Novo usuário Super Admin criado no Auth com sucesso!');
  }

  console.log('\n--- DADOS DE ACESSO AO CRM ---');
  console.log(`Link: http://localhost:3000/login`);
  console.log(`E-mail: ${email}`);
  console.log(`Senha: ${password}`);
  console.log(`Role: super_admin (Permissão Total)`);
  console.log('-----------------------------');
}

main().catch(err => {
  console.error('❌ Falha no processo:', err.message);
});
