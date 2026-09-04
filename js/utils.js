/* ==========================================
   UTILITÁRIOS
   Formatação de moeda, datas e helpers
   ========================================== */

const Utils = {
    /**
     * Formata um valor numérico para moeda brasileira (BRL)
     * @param {number} valor - Valor a ser formatado
     * @returns {string} String formatada ex: R$ 1.500,00
     */
    formatarMoeda(valor) {
        if (valor === null || valor === undefined || isNaN(valor)) {
            valor = 0;
        }
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).replace(/\u00a0/g, ' ');
    },

    /**
     * Formata uma data ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
     * @param {string} dataISO - Data no formato ISO
     * @returns {string} Data formatada ex: 10/01/2026
     */
    formatarData(dataISO) {
        if (!dataISO) return '—';
        const partes = dataISO.split('-');
        if (partes.length !== 3) return dataISO;
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    },

    /**
     * Converte data brasileira (DD/MM/YYYY) para ISO (YYYY-MM-DD)
     * @param {string} dataBR - Data no formato brasileiro
     * @returns {string} Data ISO
     */
    dataBRParaISO(dataBR) {
        const partes = dataBR.split('/');
        if (partes.length !== 3) return dataBR;
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    },

    /**
     * Cria data ISO a partir de objeto Date
     * @param {Date} data - Objeto Date
     * @returns {string} Data ISO
     */
    dataParaISO(data) {
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${data.getFullYear()}-${mes}-${dia}`;
    },

    /**
     * Cria objeto Date local a partir de string ISO
     * @param {string} dataISO - Data ISO
     * @returns {Date} Objeto Date
     */
    ISOParaData(dataISO) {
        const partes = dataISO.split('-');
        return new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
    },

    /**
     * Obtém ano a partir de data ISO
     * @param {string} dataISO - Data ISO
     * @returns {number} Ano
     */
    obterAno(dataISO) {
        if (!dataISO) return null;
        return parseInt(dataISO.split('-')[0]);
    },

    /**
     * Obtém mês (1-12) a partir de data ISO
     * @param {string} dataISO - Data ISO
     * @returns {number} Mês (1-12)
     */
    obterMes(dataISO) {
        if (!dataISO) return null;
        return parseInt(dataISO.split('-')[1]);
    },

    /**
     * Obter nome do mês em português
     * @param {number} mes - Mês (1-12)
     * @returns {string} Nome do mês
     */
    nomeMes(mes) {
        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return meses[mes - 1] || '';
    },

    /**
     * Nome curto do mês
     */
    nomeMesCurto(mes) {
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return meses[mes - 1] || '';
    },

    /**
     * Gera ID único
     * @returns {number} ID numérico único
     */
    gerarId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    },

    /**
     * Escape de HTML para evitar XSS
     * @param {string} texto - Texto original
     * @returns {string} Texto com HTML escapado
     */
    escapeHTML(texto) {
        const div = document.createElement('div');
        div.textContent = texto || '';
        return div.innerHTML;
    },

    /**
     * Debounce para evitar chamadas excessivas
     * @param {Function} fn - Função a ser executada
     * @param {number} delay - Atraso em ms
     */
    debounce(fn, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    /**
     * Obtém a data atual em ISO
     * @returns {string} Data atual ISO
     */
    hojeISO() {
        return this.dataParaISO(new Date());
    },

    /**
     * Obtém o nome do mês atual e ano
     */
    mesAtual() {
        const d = new Date();
        return {
            mes: d.getMonth() + 1,
            ano: d.getFullYear()
        };
    },

    /**
     * Gera chave de mês (YYYY-MM) para id
     */
    chaveMes(ano, mes) {
        return `${ano}-${String(mes).padStart(2, '0')}`;
    }
};
