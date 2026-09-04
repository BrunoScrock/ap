/* ==========================================
   PAGAMENTOS - Contabilidade do Apartamento
   ========================================== */

function iniciarPagina() {
    renderPagamentos();
    configurarFormularios();
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
    if (!pagamentos.length) {
        corpo.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <p class="empty-icon">📒</p>
                    <p class="empty-title">Nenhuma parcela cadastrada</p>
                    <p class="empty-text">Use "Novo Pagamento" ou importe os dados na aba "Importar".</p>
                </td>
            </tr>
        `;
        return;
    }

    corpo.innerHTML = pagamentos.map(p => {
        const statusClass = p.status === 'pago' ? 'status-pago' : 'status-pendente';
        const id = p.id || p.referencia || '';

        let acoes = '';
        if (p.status !== 'pago') {
            acoes += `
                <button class="btn-acoes btn-marcar-pago" data-id="${id}" title="Marcar como pago"
                    aria-label="Marcar como pago">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </button>
            `;
        }
        acoes += `
            <button class="btn-acoes btn-editar" data-id="${id}" title="Editar"
                aria-label="Editar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
            </button>
            <button class="btn-acoes btn-excluir" data-id="${id}" title="Excluir"
                aria-label="Excluir">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
            </button>
        `;

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
                <td>
                    <div class="acoes-cell">
                        ${acoes}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    configurarAcoes();
}

function configurarAcoes() {
    const corpo = document.getElementById('corpoTabelaPagamentos');
    if (!corpo) return;

    corpo.querySelectorAll('.btn-marcar-pago').forEach(btn => {
        btn.addEventListener('click', () => {
            marcarPago(btn.dataset.id);
        });
    });

    corpo.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', () => {
            abrirEdicao(btn.dataset.id);
        });
    });

    corpo.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', () => {
            excluirPagamento(btn.dataset.id);
        });
    });
}

function buscarPagamento(id) {
    const pagamentos = Storage.getPagamentos();
    return pagamentos.find(p => String(p.id) === String(id) || String(p.referencia) === String(id));
}

function marcarPago(id) {
    const p = buscarPagamento(id);
    if (!p) return;

    const valorPago = Utils.moedaParaNumero(document.getElementById('marcarValor')?.value) || p.valorProjetado || 0;

    // Abre modal de confirmação com o valor
    const modal = document.getElementById('modalMarcarPago');
    if (modal) {
        document.getElementById('marcarPagId').value = id;
        document.getElementById('marcarPagDesc').textContent = p.descricao;
        document.getElementById('marcarValor').value = Utils.paraMoedaInput(valorPago);
        document.getElementById('marcarData').value = Utils.hojeISO();
        window.App.abrirModal('modalMarcarPago');
    } else {
        Storage.marcarPago(id, valorPago, Utils.hojeISO());
        Toast.success(`Parcela "${p.descricao}" marcada como paga.`);
        renderPagamentos();
    }
}

function abrirEdicao(id) {
    const p = buscarPagamento(id);
    if (!p) return;

    document.getElementById('editarPagId').value = p.id;
    document.getElementById('editarDescricao').value = p.descricao || '';
    document.getElementById('editarVencimento').value = p.vencimento || '';
    document.getElementById('editarValorProjetado').value = Utils.paraMoedaInput(p.valorProjetado);
    document.getElementById('editarValorPago').value = Utils.paraMoedaInput(p.valorPago);
    document.getElementById('editarDataPagamento').value = p.dataPagamento || '';
    document.getElementById('editarINCC').value = Utils.paraMoedaInput(p.inccJuros);
    document.getElementById('editarCategoria').value = p.categoria || 'outro';
    document.getElementById('editarStatus').value = p.status || 'pendente';

    window.App.abrirModal('modalEditarPagamento');
}

function salvarEdicao() {
    const id = document.getElementById('editarPagId').value;
    const dados = {
        descricao: document.getElementById('editarDescricao').value.trim(),
        vencimento: document.getElementById('editarVencimento').value,
        valorProjetado: Utils.moedaParaNumero(document.getElementById('editarValorProjetado').value),
        valorPago: Utils.moedaParaNumero(document.getElementById('editarValorPago').value),
        dataPagamento: document.getElementById('editarDataPagamento').value || null,
        inccJuros: Utils.moedaParaNumero(document.getElementById('editarINCC').value),
        categoria: document.getElementById('editarCategoria').value,
        status: document.getElementById('editarStatus').value
    };

    Storage.atualizarPagamento(id, dados);
    Toast.success('Pagamento atualizado com sucesso.');
    document.getElementById('modalEditarPagamento').classList.remove('active');
    renderPagamentos();
}

function excluirPagamento(id) {
    const p = buscarPagamento(id);
    if (!p) return;

    if (confirm(`Excluir a parcela "${p.descricao}"?`)) {
        Storage.removerPagamento(id);
        Toast.success('Parcela excluída.');
        renderPagamentos();
    }
}

function configurarFormularios() {
    const btnNovo = document.getElementById('btnNovoPagamento');
    const form = document.getElementById('formPagamento');
    const modal = document.getElementById('modalPagamento');
    const formEditar = document.getElementById('formEditarPagamento');
    const formMarcar = document.getElementById('formMarcarPago');

    // Máscara de moeda nos campos monetários
    ['pagValor', 'marcarValor', 'editarValorProjetado', 'editarValorPago', 'editarINCC']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) Utils.aplicarMascaraMoeda(el);
        });

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
            const valor = Utils.moedaParaNumero(document.getElementById('pagValor').value);
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
            Toast.success('Pagamento adicionado com sucesso.');
            renderPagamentos();
        });
    }

    if (formEditar) {
        formEditar.addEventListener('submit', (e) => {
            e.preventDefault();
            salvarEdicao();
        });
    }

    if (formMarcar) {
        formMarcar.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('marcarPagId').value;
            const valor = Utils.moedaParaNumero(document.getElementById('marcarValor').value) || 0;
            const data = document.getElementById('marcarData').value || Utils.hojeISO();
            Storage.marcarPago(id, valor, data);
            document.getElementById('modalMarcarPago').classList.remove('active');
            Toast.success('Parcela marcada como paga.');
            renderPagamentos();
        });
    }
}

function setTexto(id, texto) {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
}
