/* ==========================================
   PAGAMENTOS - Contabilidade do Apartamento
   ========================================== */

function iniciarPagina() {
    renderPagamentos();
    configurarFormulario();
}

function renderPagamentos() {
    const pagamentos = Storage.getPagamentos();
    const configuracoes = Storage.getConfiguracoes();
    const corpo = document.getElementById('corpoTabelaPagamentos');
    if (!corpo) return;

    const anoAtual = new Date().getFullYear();
    const mesAtual = new Date().getMonth() + 1;

    const totalPago = Calculos.totalPago(pagamentos);
    const totalPagoMes = Calculos.totalPago(pagamentos, { mes: mesAtual, ano: anoAtual });
    const totalPagoAno = Calculos.totalPago(pagamentos, { ano: anoAtual });
    const qtdPagamentos = Calculos.quantidadePagamentos(pagamentos);
    const valorTotal = configuracoes.valorTotalApartamento || 0;
    const saldoDevedor = Calculos.saldoDevedor(valorTotal, pagamentos);
    const percentual = Calculos.percentualQuitacao(valorTotal, pagamentos);

    // Atualiza totais
    setTexto('totalPagoGeral', Utils.formatarMoeda(totalPago));
    setTexto('qtdPagamentos', String(qtdPagamentos));
    setTexto('totalPagoMes', Utils.formatarMoeda(totalPagoMes));
    setTexto('totalPagoAno', Utils.formatarMoeda(totalPagoAno));
    setTexto('saldoDevedorPag', Utils.formatarMoeda(saldoDevedor));
    setTexto('percentualQuitacaoPag', `${percentual.toFixed(1)}%`);

    // Renderiza tabela
    corpo.innerHTML = pagamentos.map(p => {
        const statusClass = p.status === 'pago' ? 'status-pago' : 'status-pendente';
        return `
            <tr>
                <td>${p.referencia || ''}</td>
                <td>${Utils.escapeHTML(p.descricao)}</td>
                <td>${Utils.formatarData(p.vencimento)}</td>
                <td class="text-right">${Utils.formatarMoeda(p.valorProjetado)}</td>
                <td class="text-right">${p.status === 'pago' ? Utils.formatarMoeda(p.valorPago) : '—'}</td>
                <td>${Utils.formatarData(p.dataPagamento)}</td>
                <td class="text-right">${p.status === 'pago' && p.inccJuros ? Utils.formatarMoeda(p.inccJuros) : '—'}</td>
                <td><span class="status ${statusClass}">${p.status.toUpperCase()}</span></td>
            </tr>
        `;
    }).join('');
}

function configurarFormulario() {
    const btnNovo = document.getElementById('btnNovoPagamento');
    const form = document.getElementById('formPagamento');
    const modal = document.getElementById('modalPagamento');

    if (btnNovo) {
        btnNovo.addEventListener('click', () => {
            document.getElementById('pagData').value = Utils.hojeISO();
            form.reset();
            form.querySelector('input').focus();
            window.App.abrirModal('modalPagamento');
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const dataPagamento = document.getElementById('pagData').value;
            const valor = parseFloat(document.getElementById('pagValor').value);
            const descricao = document.getElementById('pagDescricao').value.trim();
            const categoria = document.getElementById('pagCategoria').value;
            const observacao = document.getElementById('pagObservacao').value.trim();

            if (!dataPagamento || !valor || !descricao) return;

            const novoPagamento = {
                referencia: '—',
                descricao,
                valorProjetado: valor,
                valorPago: valor,
                dataPagamento,
                inccJuros: 0,
                status: 'pago',
                categoria,
                observacao
            };

            Storage.adicionarPagamento(novoPagamento);
            modal.classList.remove('active');
            renderPagamentos();
        });
    }
}

function setTexto(id, texto) {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
}
