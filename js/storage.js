/* ==========================================
   STORAGE - Persistência dos dados
   Cache + localStorage + nuvem (Supabase)
   Leitura: cache (memoria) -> localStorage -> DADOS_INICIAIS
   Escrita: cache + localStorage + nuvem (assincrono)
   ========================================== */

const Storage = {
    PREFIXO: 'newgarden_',

    _cache: null,
    _supabase: null,
    _logado: false,

    /**
     * Chave para dados no localStorage
     */
    chave(nome) {
        return this.PREFIXO + nome;
    },

    /**
     * Colecoes persistidas (espelham as chaves do localStorage)
     */
    COLECOES() {
        return ['configuracoes', 'pagamentos', 'economias', 'itensCompra', 'meses'];
    },

    /**
     * Carrega o cliente Supabase (uma unica vez)
     */
    _carregarCliente() {
        if (this._supabase) return;
        const cfg = (typeof SUPABASE_CONFIG === 'object' && SUPABASE_CONFIG) ? SUPABASE_CONFIG : null;
        if (!cfg || !cfg.url || !cfg.anonKey ||
            cfg.url.indexOf('COLE_A_URL') !== -1 || cfg.anonKey.indexOf('COLE_A_CHAVE') !== -1) {
            return;
        }
        if (!window.supabase) return;
        this._supabase = window.supabase.createClient(cfg.url, cfg.anonKey, {
            auth: { persistSession: true, autoRefreshToken: true, storage: localStorage }
        });
    },

    /**
     * Preparar: carrega todos os dados antes de renderizar a pagina.
     * Deve ser chamado (await) uma vez no inicio (app.js).
     */
    async preparar() {
        if (this._preparando) return this._preparando;
        this._preparando = this._executarPreparar();
        return this._preparando;
    },

    async _executarPreparar() {
        this._cache = {};
        this._carregarCliente();

        const chaves = this.COLECOES();
        let carregouNuvem = false;
        let nuvemNula = false;

        if (this._supabase) {
            try {
                const { data: { session } } = await this._supabase.auth.getSession();
                this._logado = !!session;
            } catch (e) {
                this._logado = false;
            }

            if (this._logado) {
                try {
                    const { data, error } = await this._supabase
                        .from(SUPABASE_CONFIG.tabela)
                        .select('id, dados');
                    if (!error) {
                        carregouNuvem = true;
                        if (data && data.length) {
                            data.forEach(linha => { this._cache[linha.id] = linha.dados; });
                        }
                        nuvemNula = chaves.every(k => (this._cache[k] === undefined || this._cache[k] === null));
                    } else if (console) {
                        console.error('Erro ao carregar dados da nuvem:', error.message);
                    }
                } catch (e) {
                    if (console) console.error('Erro ao carregar dados da nuvem:', e);
                }
            }
        }

        // Preenche cache com dados locais nas colecoes ausentes da nuvem
        chaves.forEach(k => {
            if (!(k in this._cache)) {
                this._cache[k] = this._lerLocal(k);
            }
        });

        // Sinaliza possivel migracao: nuvem vazia + dados locais existentes
        this._nuvemCarregada = carregouNuvem;
        this._nuvemVazia = carregouNuvem && nuvemNula;

        return this;
    },

    _lerLocal(k) {
        const salvo = localStorage.getItem(this.chave(k));
        if (salvo !== null) {
            try {
                return JSON.parse(salvo);
            } catch (e) {
                if (console) console.error('Erro ao ler ' + k, e);
            }
        }
        return null;
    },

    _escreverLocal(k, v) {
        localStorage.setItem(this.chave(k), JSON.stringify(v));
    },

    _gravarNuvem(k, v) {
        if (!this._supabase || !this._logado) return;
        this._supabase
            .from(SUPABASE_CONFIG.tabela)
            .upsert({ id: k, dados: v }, { onConflict: 'id' })
            .then(() => {})
            .catch(e => { if (console) console.error('Erro ao sincronizar ' + k, e); });
    },

    _ler(k, fallback) {
        if (this._cache && k in this._cache) {
            const v = this._cache[k];
            if (v !== null && v !== undefined) return v;
        }
        const salvo = this._lerLocal(k);
        return salvo !== null && salvo !== undefined ? salvo : fallback;
    },

    _escrever(k, v) {
        if (this._cache) this._cache[k] = v;
        this._escreverLocal(k, v);
        this._gravarNuvem(k, v);
    },

    /**
     * Tema (preferencia do dispositivo - permanece local)
     */
    getTema() {
        return localStorage.getItem(this.chave('tema')) || 'light';
    },

    setTema(tema) {
        localStorage.setItem(this.chave('tema'), tema);
    },

    /**
     * Marca se ha dados locais ainda nao enviados a nuvem
     */
    haDadosParaMigrar() {
        if (!this._nuvemCarregada) return false;
        if (!this._nuvemVazia) return false;
        const chaves = this.COLECOES();
        return chaves.some(k => localStorage.getItem(this.chave(k)) !== null);
    },

    /**
     * Envia os dados do navegador para a nuvem (migracao inicial)
     */
    async enviarDadosLocaisParaNuvem() {
        if (!this._supabase || !this._logado) return 0;
        let total = 0;
        for (const k of this.COLECOES()) {
            let v = this._lerLocal(k);
            if (v === null || v === undefined) {
                const seed = window.DADOS_INICIAIS && DADOS_INICIAIS[k];
                v = Array.isArray(seed) ? seed.slice() : (seed ? { ...seed } : null);
            }
            if (v == null) continue;
            const { error } = await this._supabase
                .from(SUPABASE_CONFIG.tabela)
                .upsert({ id: k, dados: v }, { onConflict: 'id' });
            if (!error) {
                this._cache[k] = v;
                total++;
            } else if (console) {
                console.error('Erro ao enviar ' + k, error.message);
            }
        }
        return total;
    },

    /* ---------- Configuracoes ---------- */

    getConfiguracoes() {
        return this._ler('configuracoes', { ...DADOS_INICIAIS.configuracoes });
    },

    setConfiguracoes(config) {
        this._escrever('configuracoes', config);
    },

    /* ---------- Pagamentos ---------- */

    getPagamentos() {
        return this._ler('pagamentos', DADOS_INICIAIS.pagamentos);
    },

    setPagamentos(pagamentos) {
        this._escrever('pagamentos', pagamentos);
    },

    adicionarPagamento(pagamento) {
        const pagamentos = this.getPagamentos();
        pagamento.id = Utils.gerarId();
        pagamentos.push(pagamento);
        this.setPagamentos(pagamentos);
        return pagamento;
    },

    atualizarPagamento(id, dados) {
        const pagamentos = this.getPagamentos();
        const idx = pagamentos.findIndex(p => String(p.id) === String(id));
        if (idx !== -1) {
            pagamentos[idx] = { ...pagamentos[idx], ...dados };
            this.setPagamentos(pagamentos);
            return pagamentos[idx];
        }
        return null;
    },

    marcarPago(id, valorPago, dataPagamento) {
        return this.atualizarPagamento(id, {
            status: 'pago',
            valorPago: valorPago || null,
            dataPagamento: dataPagamento || Utils.hojeISO()
        });
    },

    removerPagamento(id) {
        const pagamentos = this.getPagamentos().filter(p => String(p.id) !== String(id));
        this.setPagamentos(pagamentos);
    },

    /* ---------- Economias ---------- */

    getEconomias() {
        return this._ler('economias', DADOS_INICIAIS.economias);
    },

    setEconomias(economias) {
        this._escrever('economias', economias);
    },

    adicionarEconomia(economia) {
        const economias = this.getEconomias();
        economia.id = Utils.gerarId();
        economias.push(economia);
        this.setEconomias(economias);
        return economia;
    },

    removerEconomia(id) {
        const economias = this.getEconomias().filter(e => e.id !== id);
        this.setEconomias(economias);
    },

    /* ---------- Itens de compra ---------- */

    getItensCompra() {
        return this._ler('itensCompra', DADOS_INICIAIS.itensCompra);
    },

    setItensCompra(itens) {
        this._escrever('itensCompra', itens);
    },

    adicionarItemCompra(item) {
        const itens = this.getItensCompra();
        item.id = Utils.gerarId();
        itens.push(item);
        this.setItensCompra(itens);
        return item;
    },

    removerItemCompra(id) {
        const itens = this.getItensCompra().filter(i => i.id !== id);
        this.setItensCompra(itens);
    },

    /* ---------- Controle mensal ---------- */

    getMeses() {
        return this._ler('meses', DADOS_INICIAIS.meses);
    },

    setMeses(meses) {
        this._escrever('meses', meses);
    },

    getMes(id) {
        const meses = this.getMeses();
        return meses.find(m => m.id === id) || null;
    },

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
        this.COLECOES().forEach(k => {
            localStorage.removeItem(this.chave(k));
            if (this._cache) delete this._cache[k];
        });
        if (this._supabase) {
            this.COLECOES().forEach(k => {
                this._supabase
                    .from(SUPABASE_CONFIG.tabela)
                    .delete()
                    .eq('id', k)
                    .then(() => {})
                    .catch(e => { if (console) console.error('Erro ao limpar ' + k, e); });
            });
        }
    }
};