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
    url: 'COLE_A_URL_DO_PROJETO',
    anonKey: 'COLE_A_CHAVE_ANON',
    tabela: 'app_data'
};