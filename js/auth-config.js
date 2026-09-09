/* ==========================================
   AUTENTICACAO - Configuracao
   Preencha abaixo os dados do Supabase e os
   e-mails permitidos.
   ========================================== */

const AUTH_CONFIG = {
    emailsPermitidos: [
        'brunobatistascrock@gmail.com',
        'geovanagmro@gmail.com'
    ]
};

const SUPABASE_CONFIG = {
    // Em Settings > API do seu projeto no Supabase:
    url: 'https://isslkatxpjffxevnoiwf.supabase.co',
    // Usar SEMPRE a chave 'anon' (publishable): comeca com 'eyJhbGciOi...'
    // ou 'sb_publishable_'. NUNCA usar a 'service_role' (sb_secret_) aqui,
    // pois os arquivos do site sao publicos.
    anonKey: 'sb_publishable_S9lw9YKpDnyipEtD5W-Hpw_2p9RWh9h',
    tabela: 'app_data'
};