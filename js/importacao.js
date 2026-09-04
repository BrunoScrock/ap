/* ==========================================
   IMPORTACAO - Migração de Dados da Planilha
   Importa a tabela de Pagamentos do contrato
   (colar texto tabulado ou carregar arquivo HTML)
   ========================================== */

const Importacao = {

    /**
     * Converte texto de moeda brasileira em número
     * ex: "R$ 2.066,37" -> 2066.37 | "1.966,55" -> 1966.55
     */
    moedaParaNumero(texto) {
        if (!texto) return 0;
        let t = String(texto).trim();
        t = t.replace(/[R$\s]/g, '');
        // Formato brasileiro: usa vírgula como decimal e ponto como milhar
        if (t.includes(',')) {
            t = t.replace(/\./g, '').replace(',', '.');
        }
        const numero = parseFloat(t);
        return isNaN(numero) ? 0 : numero;
    },

    /**
     * Converte data brasileira (DD/MM/AAAA) em ISO (AAAA-MM-DD)
     * Retorna null se não reconhecer
     */
    dataParaISO(texto) {
        if (!texto) return null;
        const t = String(texto).trim();
        const partes = t.split('/');
        if (partes.length !== 3) return null;
        const dia = partes[0].padStart(2, '0');
        const mes = partes[1].padStart(2, '0');
        const ano = partes[2];
        if (ano.length !== 4) return null;
        return `${ano}-${mes}-${dia}`;
    },

    /**
     * Normaliza status ("PAGO" -> "pago", "PENDENTE" -> "pendente")
     */
    normalizarStatus(texto) {
        const t = String(texto || '').trim().toUpperCase();
        if (t === 'PAGO' || t === 'PAG' || t === 'PAGO ✓') return 'pago';
        return 'pendente';
    },

    /**
     * Extrai a categoria a partir da descrição
     */
    adivinharCategoria(descricao) {
        const d = String(descricao || '').toLowerCase();
        if (d.includes('sinal')) return 'sinal';
        if (d.includes('bal')) return 'balao';
        if (d.includes('financiamento')) return 'financiamento';
        if (d.includes('mensal')) return 'parcela';
        return 'outro';
    },

    /**
     * Detecta o índice das colunas mapeado pelos cabeçalhos
     * @param {Array<string>} cabecalho - Linha de cabeçalho
     * @returns {Object} mapa de colunas
     */
    mapearColunas(cabecalho) {
        const mapa = {
            referencia: -1, descricao: -1, vencimento: -1,
            valorProjetado: -1, valorPago: -1, data: -1, incc: -1, status: -1
        };
        if (Array.isArray(cabecalho)) {
            cabecalho.forEach((celula, i) => {
                const chave = String(celula || '').trim().toLowerCase().replace(/\s+/g, ' ');
                if (chave === 'ref' || chave === 'ref.') mapa.referencia = i;
                else if (chave.includes('descri')) mapa.descricao = i;
                else if (chave === 'vencimento' || chave === 'venc') mapa.vencimento = i;
                else if (chave.includes('projetado')) mapa.valorProjetado = i;
                else if (chave === 'valor pago' || chave === 'valor efetivo' || chave === 'valor') mapa.valorPago = i;
                else if (chave === 'data' || chave === 'data pagamento' || chave === 'dt. pagto') mapa.data = i;
                else if (chave.includes('incc') || chave.includes('juros')) mapa.incc = i;
                else if (chave === 'status' || chave === 'situação') mapa.status = i;
            });
        }
        return mapa;
    },

    /**
     * Detecta o deslocamento de colunas entre o cabeçalho e as linhas de dados.
     * Em planilhas HTML exportadas, as linhas de dados podem ter uma coluna
     * vazia extra no início, deslocando os valores em relação ao título.
     * @param {Array} matriz - Matriz de linhas/células
     * @param {number} idxCab - Índice da linha de cabeçalho
     * @returns {number} Deslocamento a aplicar aos índices do cabeçalho
     */
    detectarDeslocamento(matriz, idxCab) {
        const cab = matriz[idxCab] || [];
        const idxRefCab = cab.findIndex(c => /^ref\.?$/i.test(String(c || '').trim()));

        if (idxRefCab === -1) return 0;

        // Procura nas primeiras linhas de dados o campo "ref" numérico
        for (let i = idxCab + 1; i < Math.min(idxCab + 5, matriz.length); i++) {
            const linha = matriz[i] || [];
            const idxRefLinha = linha.findIndex(c => /^\d+$/.test(String(c || '').trim()) && parseInt(c) <= 99);
            if (idxRefLinha !== -1) {
                return idxRefLinha - idxRefCab;
            }
        }
        return 0;
    },

    /**
     * Verifica se uma linha de células é uma parcela válida.
     * Uma parcela é válida se tiver referência numérica ou descrição.
     * Linhas de totais (TOTAL PAGO, etc.) são descartadas.
     */
    ehLinhaValida(celulas, mapa, deslocamento) {
        const iRef = mapa.referencia + deslocamento;
        const iDesc = mapa.descricao + deslocamento;
        const ref = (iRef >= 0 && iRef < celulas.length) ? String(celulas[iRef] || '').trim() : '';
        const desc = (iDesc >= 0 && iDesc < celulas.length) ? String(celulas[iDesc] || '').trim() : '';
        const refNumerica = /^\d+$/.test(ref);
        return refNumerica || (desc !== '');
    },

    /**
     * Converte uma linha de células em objeto de pagamento.
     * @param {number} deslocamento - Deslocamento entre cabeçalho e dados
     */
    linhaParaPagamento(celulas, mapa, idx, deslocamento) {
        const pegar = (campo) => {
            const i = mapa[campo] + deslocamento;
            return (i >= 0 && i < celulas.length) ? String(celulas[i] || '').trim() : '';
        };

        const descricao = pegar('descricao') || `Item ${idx + 1}`;
        const valorProjetado = this.moedaParaNumero(pegar('valorProjetado'));
        const valorPagoRaw = pegar('valorPago');
        const status = this.normalizarStatus(pegar('status'));

        const temPago = valorPagoRaw && this.moedaParaNumero(valorPagoRaw) > 0;

        return {
            referencia: pegar('referencia') || (idx + 1),
            descricao,
            vencimento: this.dataParaISO(pegar('vencimento')) || '',
            valorProjetado,
            valorPago: status === 'pago' && temPago ? this.moedaParaNumero(valorPagoRaw) : (status === 'pago' ? valorProjetado : 0),
            dataPagamento: status === 'pago' ? (this.dataParaISO(pegar('data')) || '') : null,
            inccJuros: status === 'pago' ? this.moedaParaNumero(pegar('incc')) : 0,
            status,
            categoria: this.adivinharCategoria(descricao)
        };
    },

    /**
     * Encontra a linha de cabeçalho dentro de uma matriz de linhas/células
     */
    encontrarCabecalho(matriz) {
        for (let i = 0; i < matriz.length; i++) {
            const linha = matriz[i];
            const txt = linha.join(' ').toLowerCase();
            if (txt.includes('descri') && (txt.includes('valor') || txt.includes('vencimento'))) {
                return i;
            }
        }
        return -1;
    },

    /**
     * Parseia texto tabulado (copiado da planilha)
     * @param {string} texto - Texto colado com linhas separadas por \n
     * @returns {Array} Lista de pagamentos
     */
    parseTabulado(texto) {
        const linhas = String(texto || '').split(/\r?\n/)
            .map(l => l.replace(/\t+$/g, '').trimEnd())
            .filter(l => l.trim() !== '');

        if (linhas.length === 0) return [];

        // Cada linha separada por tab
        const matriz = linhas.map(l => l.split('\t'));

        // Encontrar cabeçalho
        const idxCab = this.encontrarCabecalho(matriz);
        if (idxCab === -1) return [];

        const mapa = this.mapearColunas(matriz[idxCab]);
        const deslocamento = this.detectarDeslocamento(matriz, idxCab);
        const pagamentos = [];

        for (let i = idxCab + 1; i < matriz.length; i++) {
            const celulas = matriz[i];
            const txt = celulas.join(' ').trim();
            if (!txt) continue;
            if (celulas.join('').trim() === '') continue;
            if (!this.ehLinhaValida(celulas, mapa, deslocamento)) continue;

            const pagamento = this.linhaParaPagamento(celulas, mapa, i, deslocamento);
            if (pagamento.valorProjetado > 0 || pagamento.descricao) {
                pagamentos.push(pagamento);
            }
        }

        return pagamentos;
    },

    /**
     * Parseia conteúdo HTML exportado do Google Sheets (tabela waffle)
     * @param {string} html - Conteúdo HTML
     * @returns {Array} Lista de pagamentos
     */
    parseArquivoHTML(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');

        // Seleciona a tabela waffle
        const tabela = doc.querySelector('table.waffle') || doc.querySelector('table');
        if (!tabela) return [];

        // Construir a matriz a partir das células (texto puro)
        const matriz = [];
        tabela.querySelectorAll('tr').forEach(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds.length === 0) return;
            const celulas = Array.from(tds).map(td => td.textContent.trim());
            matriz.push(celulas);
        });

        // As th do cabeçalho (colunas A,B,C...) podem aparecer; filtrar
        const matrizLimpa = matriz.filter(linha => {
            // Manter apenas linhas que não são cabeçalho de coluna (tudo vazio exceto 1 letra)
            const naoVazios = linha.filter(c => c && c.trim() !== '');
            if (naoVazios.length === 1 && /^[A-Z]$/.test(naoVazios[0].trim())) return false;
            return true;
        });

        const idxCab = this.encontrarCabecalho(matrizLimpa);
        if (idxCab === -1) return [];

        const mapa = this.mapearColunas(matrizLimpa[idxCab]);
        const deslocamento = this.detectarDeslocamento(matrizLimpa, idxCab);
        const pagamentos = [];

        for (let i = idxCab + 1; i < matrizLimpa.length; i++) {
            const celulas = matrizLimpa[i];
            const txt = celulas.join(' ').trim();
            if (!txt) continue;
            if (!this.ehLinhaValida(celulas, mapa, deslocamento)) continue;

            const pagamento = this.linhaParaPagamento(celulas, mapa, i, deslocamento);
            if (pagamento.valorProjetado > 0 || pagamento.descricao) {
                pagamentos.push(pagamento);
            }
        }

        return pagamentos;
    },

    /**
     * Executa a importação: salva os pagamentos e re-renderiza
     * @param {Array} pagamentos - Pagamentos importados
     */
    importar(pagamentos) {
        if (!pagamentos.length) return 0;

        const existentes = Storage.getPagamentos();

        // Atualiza por correspondência ou adiciona novo
        const resultado = pagamentos.map(p => {
            // Reaproveita o id se já existe (evita duplicar)
            const chave = (p.descricao || '') + (p.valorProjetado || '');
            const idx = existentes.findIndex(e => (e.descricao || '') + (e.valorProjetado || '') === chave);
            if (idx !== -1) {
                const novo = { ...existentes[idx], ...p };
                existentes[idx] = novo;
                return novo;
            }
            p.id = Utils.gerarId();
            existentes.push(p);
            return p;
        });

        Storage.setPagamentos(existentes);
        return resultado.length;
    }
};
