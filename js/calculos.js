/* ==========================================
   CÁLCULOS FINANCEIROS CENTRALIZADOS
   Todos os cálculos são feitos aqui para garantir
   consistência entre as telas.
   ========================================== */

const Calculos = {
    /**
     * Calcula o total pago (soma dos valores pagos)
     * @param {Array} pagamentos - Lista de pagamentos
     * @param {Object} opcoes - Opções de filtro (mes, ano)
     * @returns {number} Total pago
     */
    totalPago(pagamentos, opcoes = {}) {
        return pagamentos
            .filter(p => p.status === 'pago')
            .filter(p => {
                if (!opcoes.mes || !p.dataPagamento) return true;
                const mes = Utils.obterMes(p.dataPagamento);
                if (opcoes.mes && mes !== opcoes.mes) return false;
                if (opcoes.ano) {
                    const ano = Utils.obterAno(p.dataPagamento);
                    if (ano !== opcoes.ano) return false;
                }
                return true;
            })
            .reduce((soma, p) => soma + (p.valorPago || 0), 0);
    },

    /**
     * Calcula total de INCC/Juros de obra pagos
     * @param {Array} pagamentos - Lista de pagamentos
     * @param {Object} opcoes - Opções de filtro (ano)
     */
    totalINCC(pagamentos, opcoes = {}) {
        return pagamentos
            .filter(p => p.status === 'pago')
            .filter(p => {
                if (!opcoes.ano) return true;
                if (!p.dataPagamento) return false;
                return Utils.obterAno(p.dataPagamento) === opcoes.ano;
            })
            .reduce((soma, p) => soma + (p.inccJuros || 0), 0);
    },

    /**
     * Total pago incluindo INCC/Juros de obra
     */
    totalPagoComINCC(pagamentos) {
        return this.totalPago(pagamentos) + this.totalINCC(pagamentos);
    },

    /**
     * Calcula quantidade de pagamentos realizados
     */
    quantidadePagamentos(pagamentos) {
        return pagamentos.filter(p => p.status === 'pago').length;
    },

    /**
     * Calcula saldo devedor (valor total - total pago)
     * @param {number} valorTotal - Valor total do contrato
     * @param {Array} pagamentos - Lista de pagamentos
     */
    saldoDevedor(valorTotal, pagamentos) {
        return valorTotal - this.totalPago(pagamentos);
    },

    /**
     * Calcula percentual de quitação
     * @returns {number} Percentual (ex: 40 => 40%)
     */
    percentualQuitacao(valorTotal, pagamentos) {
        const pago = this.totalPago(pagamentos);
        if (valorTotal <= 0) return 0;
        return (pago / valorTotal) * 100;
    },

    /**
     * Total guardado (economias)
     */
    totalGuardado(economias) {
        return economias.reduce((soma, e) => soma + (e.valor || 0), 0);
    },

    /**
     * Volume para compras (economias com destino específico)
     */
    totalDisponivelCompras(economias) {
        return economias
            .filter(e => e.destino !== 'pagamento-balao')
            .reduce((soma, e) => soma + (e.valor || 0), 0);
    },

    /**
     * Valor restante para compra
     */
    valorRestanteCompra(item) {
        const estimado = item.valorEstimado || 0;
        const guardado = item.valorGuardado || 0;
        return estimado - guardado;
    },

    /**
     * Percentual guardado de um item
     */
    percentualItem(item) {
        if (!item.valorEstimado) return 0;
        return ((item.valorGuardado || 0) / item.valorEstimado) * 100;
    },

    /**
     * Total de receitas do mês (salário + reembolso)
     */
    totalReceitas(mes) {
        return (mes.salario || 0) + (mes.reembolso || 0);
    },

    /**
     * Total de despesas do mês (cartão + débitos)
     */
    totalDespesas(mes) {
        let totalCartoes = 0;
        if (mes.cartoesCredito) {
            totalCartoes = mes.cartoesCredito.reduce((soma, cc) => soma + (cc.totalPagar || 0), 0);
        }
        let totalDebitos = 0;
        if (mes.debitosAutomaticos) {
            totalDebitos = mes.debitosAutomaticos.reduce((soma, d) => soma + (d.valor || 0), 0);
        }
        return totalCartoes + totalDebitos;
    },

    /**
     * Saldo do mês (receitas - despesas)
     */
    saldoMes(mes) {
        return this.totalReceitas(mes) - this.totalDespesas(mes);
    },

    /**
     * Dinheiro disponível para gastos pessoais
     * Saldo após despesas - destino apartamento - economia
     */
    gastosPessoaisDisponiveis(mes) {
        const saldo = this.saldoMes(mes);
        return saldo - (mes.divisaoApartamento || 0) - (mes.economia || 0);
    },

    /**
     * Saldo do orçamento (limite - gastos realizados)
     */
    saldoOrcamento(limite, gastosRealizados) {
        return (limite || 0) - (gastosRealizados || 0);
    },

    /**
     * Estado do orçamento
     * @returns {string} 'ok' | 'warn' | 'danger'
     */
    estadoOrcamento(limite, gastosRealizados) {
        const saldo = this.saldoOrcamento(limite, gastosRealizados);
        const limiteV = limite || 0;

        if (limiteV === 0) return 'ok';
        const percentualGasto = (gastosRealizados || 0) / limiteV;

        if (saldo < 0 || percentualGasto > 1) return 'danger';
        if (percentualGasto >= 0.8) return 'warn';
        return 'ok';
    },

    /**
     * Agrupa pagamentos por mês para gráficos
     * @returns {Object} { chaveMes: total }
     */
    pagamentosPorMes(pagamentos) {
        const agrupado = {};
        pagamentos
            .filter(p => p.status === 'pago' && p.dataPagamento)
            .forEach(p => {
                const ano = Utils.obterAno(p.dataPagamento);
                const mes = Utils.obterMes(p.dataPagamento);
                const chave = `${ano}-${String(mes).padStart(2, '0')}`;
                agrupado[chave] = (agrupado[chave] || 0) + (p.valorPago || 0);
            });
        return agrupado;
    },

    /**
     * Percentual do total para um valor
     */
    percentual(valor, total) {
        if (!total) return 0;
        return (valor / total) * 100;
    }
};
