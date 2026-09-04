/* ==========================================
   STORAGE - Persistência dos dados
   Usa localStorage + dados iniciais da planilha
   ========================================== */

const Storage = {
    PREFIXO: 'newgarden_',

    /**
     * Chave para dados no localStorage
     */
    chave(nome) {
        return this.PREFIXO + nome;
    },

    /**
     * Carrega a configuração do tema
     */
    getTema() {
        return localStorage.getItem(this.chave('tema')) || 'light';
    },

    /**
     * Salva a configuração do tema
     */
    setTema(tema) {
        localStorage.setItem(this.chave('tema'), tema);
    },

    /**
     * Carrega configurações gerais
     */
    getConfiguracoes() {
        const salvo = localStorage.getItem(this.chave('configuracoes'));
        if (salvo) {
            try {
                return JSON.parse(salvo);
            } catch (e) {
                console.error('Erro ao ler configurações:', e);
            }
        }
        return { ...DADOS_INICIAIS.configuracoes };
    },

    /**
     * Salva configurações gerais
     */
    setConfiguracoes(config) {
        localStorage.setItem(this.chave('configuracoes'), JSON.stringify(config));
    },

    /**
     * Carrega lista de pagamentos.
     * Se não houver dados salvos, carrega da planilha (dados iniciais).
     */
    getPagamentos() {
        const salvo = localStorage.getItem(this.chave('pagamentos'));
        if (salvo !== null) {
            try {
                return JSON.parse(salvo);
            } catch (e) {
                console.error('Erro ao ler pagamentos:', e);
            }
        }
        return DADOS_INICIAIS.pagamentos;
    },

    /**
     * Salva lista de pagamentos
     */
    setPagamentos(pagamentos) {
        localStorage.setItem(this.chave('pagamentos'), JSON.stringify(pagamentos));
    },

    /**
     * Adiciona um pagamento
     */
    adicionarPagamento(pagamento) {
        const pagamentos = this.getPagamentos();
        pagamento.id = Utils.gerarId();
        pagamentos.push(pagamento);
        this.setPagamentos(pagamentos);
        return pagamento;
    },

    /**
     * Atualiza um pagamento existente
     */
    atualizarPagamento(id, dados) {
        const pagamentos = this.getPagamentos();
        const idx = pagamentos.findIndex(p => p.id === id);
        if (idx !== -1) {
            pagamentos[idx] = { ...pagamentos[idx], ...dados };
            this.setPagamentos(pagamentos);
            return pagamentos[idx];
        }
        return null;
    },

    /**
     * Marca um pagamento como pago
     */
    marcarPago(id, valorPago, dataPagamento) {
        return this.atualizarPagamento(id, {
            status: 'pago',
            valorPago: valorPago || null,
            dataPagamento: dataPagamento || Utils.hojeISO()
        });
    },

    /**
     * Remove um pagamento
     */
    removerPagamento(id) {
        const pagamentos = this.getPagamentos().filter(p => p.id !== id);
        this.setPagamentos(pagamentos);
    },

    /**
     * Carrega economias (valores guardados)
     */
    getEconomias() {
        const salvo = localStorage.getItem(this.chave('economias'));
        if (salvo !== null) {
            try {
                return JSON.parse(salvo);
            } catch (e) {
                console.error('Erro ao ler economias:', e);
            }
        }
        return DADOS_INICIAIS.economias;
    },

    /**
     * Salva economias
     */
    setEconomias(economias) {
        localStorage.setItem(this.chave('economias'), JSON.stringify(economias));
    },

    /**
     * Adiciona uma economia
     */
    adicionarEconomia(economia) {
        const economias = this.getEconomias();
        economia.id = Utils.gerarId();
        economias.push(economia);
        this.setEconomias(economias);
        return economia;
    },

    /**
     * Remove uma economia
     */
    removerEconomia(id) {
        const economias = this.getEconomias().filter(e => e.id !== id);
        this.setEconomias(economias);
    },

    /**
     * Carrega itens de compra
     */
    getItensCompra() {
        const salvo = localStorage.getItem(this.chave('itensCompra'));
        if (salvo !== null) {
            try {
                return JSON.parse(salvo);
            } catch (e) {
                console.error('Erro ao ler itens:', e);
            }
        }
        return DADOS_INICIAIS.itensCompra;
    },

    /**
     * Salva itens de compra
     */
    setItensCompra(itens) {
        localStorage.setItem(this.chave('itensCompra'), JSON.stringify(itens));
    },

    /**
     * Adiciona um item de compra
     */
    adicionarItemCompra(item) {
        const itens = this.getItensCompra();
        item.id = Utils.gerarId();
        itens.push(item);
        this.setItensCompra(itens);
        return item;
    },

    /**
     * Remove um item de compra
     */
    removerItemCompra(id) {
        const itens = this.getItensCompra().filter(i => i.id !== id);
        this.setItensCompra(itens);
    },

    /**
     * Carrega meses de controle financeiro
     */
    getMeses() {
        const salvo = localStorage.getItem(this.chave('meses'));
        if (salvo !== null) {
            try {
                return JSON.parse(salvo);
            } catch (e) {
                console.error('Erro ao ler meses:', e);
            }
        }
        return DADOS_INICIAIS.meses;
    },

    /**
     * Salva a lista de meses
     */
    setMeses(meses) {
        localStorage.setItem(this.chave('meses'), JSON.stringify(meses));
    },

    /**
     * Busca um mês por id (ex: '2026-08')
     */
    getMes(id) {
        const meses = this.getMeses();
        return meses.find(m => m.id === id) || null;
    },

    /**
     * Adiciona ou atualiza um mês
     */
    salvarMes(mes) {
        const meses = this.getMeses();
        const idx = meses.findIndex(m => m.id === mes.id);
        if (idx !== -1) {
            meses[idx] = mes;
        } else {
            meses.push(mes);
        }
        this.setMeses(meses);
    },

    /**
     * Limpa todos os dados e restaura os iniciais
     */
    restaurarDadosIniciais() {
        localStorage.removeItem(this.chave('pagamentos'));
        localStorage.removeItem(this.chave('economias'));
        localStorage.removeItem(this.chave('itensCompra'));
        localStorage.removeItem(this.chave('meses'));
        localStorage.removeItem(this.chave('configuracoes'));
    }
};
