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
│
├── css/
│   ├── styles.css      # Estilos e design system
│   ├── dashboard.css   # Estilos específicos do dashboard
│   ├── pagamentos.css  # Estilos específicos de pagamentos
│   ├── economias.css   # Estilos específicos de economias
│   ├── mensal.css      # Estilos específicos do controle mensal
│   └── responsive.css  # Media queries para responsividade
│
├── js/
│   ├── app.js          # Lógica principal e tema
│   ├── dashboard.js    # Lógica do dashboard
│   ├── pagamentos.js   # Lógica de pagamentos
│   ├── economias.js    # Lógica de economias
│   ├── mensal.js       # Lógica do controle mensal
│   ├── storage.js      # Persistência dos dados
│   ├── calculos.js     # Cálculos financeiros centralizados
│   └── utils.js        # Utilitários (formatação BR)
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

### GitHub Pages
1. Crie um repositório no GitHub com o nome do projeto
2. Faça upload de todos os arquivos
3. Vá em **Settings > Pages**
4. Em **Source**, selecione `main` branch

O sistema ficará disponível em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`

### Vercel (alternativa gratuita)
1. Crie conta em [vercel.com](https://vercel.com)
2. Importe o repositório do GitHub
3. A Vercel detecta automaticamente projeto estático

## Segurança

- Os dados são armazenados apenas localmente no navegador (LocalStorage)
- Nenhum dado é enviado para servidores externos
- O sistema não requer autenticação (uso pessoal/local)

## Observação

Os dados do sistema são fictícios até o usuário inserir seus próprios valores. O arquivo `data/dados-iniciais.js` contém os dados de exemplo extraídos da planilha.
