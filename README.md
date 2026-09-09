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

## Autenticação (login com Google)

O acesso à interface é restrito a um login com conta Google. Só os e-mails
cadastrados em `js/auth-config.js` (lista `emailsPermitidos`) conseguem entrar;
os demais veem "Acesso negado".

- **Client ID:** configurado em `js/auth-config.js` (criado no Google Cloud Console → Credentials → OAuth client ID → Web application).
- **Origem autorizada no Google:** `https://brunoscrock.github.io`
- Para permitir/remover alguém, edite `emailsPermitidos` em `js/auth-config.js` e envie novamente (push).

> ⚠️ **Limitação:** o login protege a *interface*, mas os arquivos do repositório
> continuam públicos (GitHub Pages). A restrição é feita no navegador (client-side).

## Segurança

- Os dados são armazenados apenas localmente no navegador (LocalStorage)
- Nenhum dado é enviado para servidores externos
- Acesso à interface restrito por login com Google (`js/auth-config.js`)

## Observação

Os dados do sistema são fictícios até o usuário inserir seus próprios valores. O arquivo `data/dados-iniciais.js` contém os dados de exemplo extraídos da planilha.
