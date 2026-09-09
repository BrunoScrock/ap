# New Garden Financeiro

Sistema web de controle financeiro e contabilidade de investimento em apartamento.

## Descrição

O sistema foi criado para transformar uma planilha de controle financeiro em uma aplicação web organizada, visual e responsiva. Ele permite acompanhar:

- **Dashboard**: Resumo geral do investimento no apartamento
- **Contabilidade**: Controle de parcelas e pagamentos do contrato
- **Economias**: Valores guardados e planejamento de compras (enxoval)
- **Mensal**: Controle financeiro mensal com planejamento do orçamento

## Tecnologias

- **HTML5** + **CSS3** + **JavaScript** (puro, sem frameworks)
- **LocalStorage** para persistência dos dados no navegador
- Design **mobile-first** responsivo
- Tema claro/escuro

## Estrutura de Pastas

```
projeto/
│
├── index.html          # Dashboard / Resumo geral
├── pagamentos.html     # Contabilidade do apartamento
├── economias.html      # Valores guardados e compras
├── mensal.html         # Controle financeiro mensal
├── importacao.html     # Tela de importação de parcelas
│
├── css/
│   ├── styles.css      # Estilos e design system
│   ├── dashboard.css   # Estilos específicos do dashboard
│   ├── pagamentos.css  # Estilos específicos de pagamentos
│   ├── economias.css   # Estilos específicos de economias
│   ├── mensal.css      # Estilos específicos do controle mensal
│   ├── importacao.css  # Estilos específicos da importação
│   └── responsive.css  # Media queries para responsividade
│
├── js/
│   ├── app.js          # Lógica principal, tema e modais
│   ├── dashboard.js    # Lógica do dashboard
│   ├── pagamentos.js   # Lógica de pagamentos
│   ├── economias.js    # Lógica de economias
│   ├── mensal.js       # Lógica do controle mensal
│   ├── importacao.js   # Parser e lógica de importação
│   ├── importacao-ui.js# Interface da tela de importação
│   ├── storage.js      # Persistência dos dados (localStorage)
│   ├── calculos.js     # Cálculos financeiros centralizados
│   ├── toast.js        # Sistema de notificações (toast)
│   └── utils.js        # Utilitários (formatação BR, máscara de moeda)
│
├── data/
│   └── dados-iniciais.js  # Dados da planilha (banco inicial)
│
└── assets/
    ├── icons/          # Ícones da interface
    └── images/         # Imagens do projeto
```

## Como Executar Localmente

O sistema não requer build ou servidor. Basta abrir os arquivos HTML no navegador.

### Opção 1 - Abrir direto no navegador
Abra o arquivo `index.html` no seu navegador.

### Opção 2 - Servidor local (recomendado)
Para uma experiência completa (sem restrições de arquivos locais):

```bash
# Com Python
python -m http.server

# Ou com Node.js (se instalado)
npx serve
```

Acesse `http://localhost:8000` (ou a porta indicada).

## Migração de Dados

Os dados da planilha foram migrados para o arquivo `data/dados-iniciais.js`. Na primeira vez que o sistema for aberto, esses dados são carregados automaticamente como o "banco de dados inicial".

Para **resetar** os dados e voltar ao estado inicial, limpe os dados do site no navegador ou execute no console:

```javascript
Storage.restaurarDadosIniciais();
```

## Publicação Gratuita

### GitHub Pages (recomendado)

O projeto é 100% estático (HTML/CSS/JS + localStorage), então funciona redondo no
GitHub Pages, sem custo e sem servidor.

**Passo a passo:**

1. **Crie o repositório no GitHub**
   - Vá em [github.com/new](https://github.com/new)
   - Dê um nome (ex.: `new-garden-financeiro`)
   - **Privacidade:** escolha `Public` para publicar via Pages sem custo.
   > ⚠️ Os dados em `data/dados-iniciais.js` (valores de parcelas e salários) ficarão
   > **visíveis publicamente** num repositório público. Se não quiser expor seus valores,
   > publique o repositório como `Private` (requer plano pago para Pages) ou deixe o
   > `dados-iniciais.js` com dados fictícios/de exemplo.

2. **Envie os arquivos**
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git
   git branch -M main
   git push -u origin main
   ```

3. **Ative o GitHub Pages**
   - No repositório, vá em **Settings > Pages**
   - Em **Source**, selecione: `Deploy from a branch`
   - Branch: `main` / pasta: `/ (root)`
   - Clique em **Save**

4. **Acesse**
   O sistema ficará disponível em:
   `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`

### Vercel (alternativa gratuita)

1. Crie conta em [vercel.com](https://vercel.com)
2. Importe o repositório do GitHub
3. A Vercel detecta automaticamente projeto estático (sem build)
4. O deploy é automático a cada `push`

## Autenticação (login com Google via Supabase)

O acesso à interface é restrito a um login com conta Google. Só os e-mails
cadastrados em `js/auth-config.js` (lista `emailsPermitidos`) conseguem entrar;
os demais veem "Acesso negado".

- **Client ID / Secret do Google:** configurados no painel do Supabase (Authentication → Providers → Google), criados no Google Cloud Console → Credentials → OAuth client ID → Web application.
- **Callback URL do Supabase:** `https://<seu-projeto>.supabase.co/auth/v1/callback`
- **URL e chave anon do projeto:** preencha `SUPABASE_CONFIG` em `js/auth-config.js`.
- Para permitir/remover alguém, edite `emailsPermitidos` em `js/auth-config.js` e envie novamente (push).

## Dados (Supabase + LocalStorage)

Os dados são leitura-escrita em três camadas: cache em memória → LocalStorage →
tabela `app_data` no Supabase (sincronização automática, sempre que o usuário está
logado). Assim os dois moradores compartilham os mesmos dados em qualquer
dispositivo, sem exportar/importar arquivos.

- **Estrutura:** `supabase.sql` cria a tabela `app_data` (`id` text PK, `dados` jsonb, `atualizado_em`) com Row Level Security: somente os e-mails de `emailsPermitidos` podem ler/gravar (a restrição vale no servidor, não só no navegador).
- **Configuração inicial (uma única vez):**
  1. Crie um projeto em [supabase.com](https://supabase.com).
  2. Abra **SQL Editor** e execute o conteúdo de `supabase.sql`.
  3. Em **Authentication → Providers**, habilite **Google** com o Client ID/Secret (mesmo client OAuth do Cloud Console).
  4. Em **Project Settings → API**, copie a URL do projeto e a chave `anon` (pública) para `SUPABASE_CONFIG` em `js/auth-config.js` e envie (push).
- **Migração dos dados do navegador:** após o primeiro login, se a nuvem estiver vazia e houver dados salvos no navegador, o sistema mostra um aviso com o botão **"Enviar dados para a nuvem"** (uma única vez).

> ⚠️ Enquanto `SUPABASE_CONFIG` não estiver preenchido, o sistema funciona apenas
> com dados locais e mostra "Serviço de login ainda não configurado".

## Segurança

- Dados guardados em conta Supabase com RLS restrito aos e-mails autorizados (server-side).
- Acesso à interface restrito por login com Google (`js/auth-config.js`).
- A chave `anon` é pública por projeto (segura à frente da RLS); nunca use a `service_role`.

## Observação

Os dados do sistema são fictícios até o usuário inserir seus próprios valores. O arquivo `data/dados-iniciais.js` contém os dados de exemplo extraídos da planilha.
