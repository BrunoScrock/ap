-- ============================================================
-- SUPABASE - Configuracao inicial (rodar no SQL Editor do painel)
-- Nome do projeto sugerido: new-garden
-- ============================================================

-- 1) Tabela unica que guarda cada colecao de dados do app
--    (pagamentos, configuracoes, economias, itensCompra, meses)
create table if not exists public.app_data (
    id            text primary key,
    dados         jsonb not null default '{}'::jsonb,
    atualizado_em timestamptz not null default now()
);

-- 2) Ativa a seguranca no nivel da linha (RLS)
alter table public.app_data enable row level security;

-- 3) Permite apenas os 2 e-mails autorizados dentro do app
--     (quem nao esta nessa lista NAO consegue ler nem gravar)
drop policy if exists "acesso_autorizado" on public.app_data;

create policy "acesso_autorizado"
on public.app_data
for all
using (
    auth.jwt() ->> 'email' in (
        'brunobatistascrock@gmail.com',
        'geovanagmro@gmail.com'
    )
)
with check (
    auth.jwt() ->> 'email' in (
        'brunobatistascrock@gmail.com',
        'geovanagmro@gmail.com'
    )
);

-- (Opcional) garantir que as colunas sejam atualizadas nas mudancas
create or replace function public.touch_app_data()
returns trigger language plpgsql as $$
begin
    new.atualizado_em = now();
    return new;
end $$;

drop trigger if exists trg_app_data on public.app_data;

create trigger trg_app_data
before update on public.app_data
for each row execute function public.touch_app_data();