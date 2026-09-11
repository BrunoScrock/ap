/* ==========================================
   ECONOMIAS - Valores guardados e compras
   ========================================== */

function iniciarPagina() {
    renderEconomias();
    configurarFormularios();
    configurarConfirmarExclusao();
}

function tipoEconomiaLabel(destino) {
    return destino === 'pagamento-balao' ? 'Balão' : 'Guardar dinheiro';
}

function renderEconomias() {
    const economias = Storage.getEconomias();
    const itens = Storage.getItensCompra();
    const corpo = document.getElementById('corpoTabelaEconomias');
    const grid = document.getElementById('gridItens');

    // Totais
    const totalGuardado = Calculos.totalGuardado(economias);
    const balao2026 = economias
        .filter(e => e.destino === 'pagamento-balao')
        .reduce((soma, e) => soma + (e.valor || 0), 0);

    setTexto('totalGuardadoEconomias', Utils.formatarMoeda(totalGuardado));
    setTexto('valorBalao2026', Utils.formatarMoeda(balao2026));

    // Tabela de economias
    if (corpo) {
        corpo.innerHTML = economias.length
            ? economias.map(e => `
                <tr>
                    <td data-label="Valor" class="text-right">${Utils.formatarMoeda(e.valor)}</td>
                    <td data-label="Data">${Utils.formatarData(e.data)}</td>
                    <td data-label="Tipo">${tipoEconomiaLabel(e.destino)}</td>
                    <td data-label="Ações">
                        <div class="acoes-cell">
                            <button class="btn-acoes btn-editar-economia" data-id="${e.id}" title="Editar" aria-label="Editar valor guardado">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            <button class="btn-acoes btn-excluir-economia" data-id="${e.id}" title="Excluir" aria-label="Excluir valor guardado">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('')
            : `<tr><td colspan="4" class="empty-state">Nenhum valor guardado ainda.</td></tr>`;
        configurarAcoesEconomias();
    }

    // Grid de itens
    if (grid) {
        if (!itens.length) {
            grid.innerHTML = `
                <div class="empty-state empty-state-grid">
                    <p class="empty-icon">🛋️</p>
                    <p class="empty-title">Nenhum item cadastrado</p>
                    <p class="empty-text">Cadastre itens do enxoval (ex.: sofá, geladeira) para acompanhar o progresso das compras.</p>
                </div>
            `;
        } else {
            grid.innerHTML = itens.map(item => {
                const percent = Calculos.percentualItem(item);
                const restante = Calculos.valorRestanteCompra(item);
                const pct = Math.min(percent, 100);
                let statusClass, statusText;
                if (item.status === 'comprado') {
                    statusClass = 'comprado';
                    statusText = 'Comprado';
                } else if (item.status === 'concluido') {
                    statusClass = 'concluido';
                    statusText = 'Concluído';
                } else {
                    statusClass = 'em_andamento';
                    statusText = 'Em andamento';
                }
                return `
                    <div class="item-card">
                        <div class="item-card-header">
                            <div class="item-name">${Utils.escapeHTML(item.nome)}</div>
                            <span class="item-status-badge ${statusClass}">${statusText}</span>
                        </div>
                        <div class="item-values">
                            <span>Valor estimado: <strong>${Utils.formatarMoeda(item.valorEstimado)}</strong></span>
                        </div>
                        <div class="item-values">
                            <span>Guardado: <strong>${Utils.formatarMoeda(item.valorGuardado)}</strong></span>
                            <span>Falta: <strong>${Utils.formatarMoeda(restante)}</strong></span>
                        </div>
                        <div class="item-progress-bar">
                            <div class="item-progress-fill" style="width:${pct}%"></div>
                        </div>
                        <div class="item-percent">${pct.toFixed(0)}% guardado</div>
                        <div class="item-actions">
                            <button class="btn-acoes btn-editar-item" data-id="${item.id}" title="Editar" aria-label="Editar item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            <button class="btn-acoes btn-excluir-item" data-id="${item.id}" title="Excluir" aria-label="Excluir item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            configurarAcoesItens();
        }
    }
}

function configurarAcoesEconomias() {
    document.querySelectorAll('.btn-editar-economia').forEach(btn => {
        btn.addEventListener('click', () => abrirEdicaoEconomia(btn.dataset.id));
    });
    document.querySelectorAll('.btn-excluir-economia').forEach(btn => {
        btn.addEventListener('click', () => excluirEconomia(btn.dataset.id));
    });
}

function configurarAcoesItens() {
    document.querySelectorAll('.btn-editar-item').forEach(btn => {
        btn.addEventListener('click', () => abrirEdicaoItem(btn.dataset.id));
    });
    document.querySelectorAll('.btn-excluir-item').forEach(btn => {
        btn.addEventListener('click', () => excluirItem(btn.dataset.id));
    });
}

function buscarEconomia(id) {
    return Storage.getEconomias().find(e => String(e.id) === String(id));
}

function buscarItem(id) {
    return Storage.getItensCompra().find(i => String(i.id) === String(id));
}

function abrirEdicaoEconomia(id) {
    const e = buscarEconomia(id);
    if (!e) return;
    document.getElementById('ecoId').value = String(e.id);
    document.getElementById('ecoValor').value = Utils.paraMoedaInput(e.valor);
    document.getElementById('ecoData').value = e.data || '';
    document.getElementById('ecoDestino').value = e.destino === 'pagamento-balao' ? 'pagamento-balao' : 'compras';
    setTexto('modalEconomia-title', 'Editar Valor Guardado');
    window.App.abrirModal('modalEconomia');
}

function excluirEconomia(id) {
    const e = buscarEconomia(id);
    if (!e) return;
    abrirConfirmarExclusao(
        'Excluir valor guardado?',
        `Deseja excluir ${Utils.formatarMoeda(e.valor)} (${tipoEconomiaLabel(e.destino)})?`,
        () => {
            Storage.removerEconomia(String(e.id));
            Toast.success('Valor guardado excluído.');
            renderEconomias();
        }
    );
}

function abrirEdicaoItem(id) {
    const i = buscarItem(id);
    if (!i) return;
    document.getElementById('itemId').value = String(i.id);
    document.getElementById('itemNome').value = i.nome || '';
    document.getElementById('itemValorEstimado').value = Utils.paraMoedaInput(i.valorEstimado);
    document.getElementById('itemValorGuardado').value = Utils.paraMoedaInput(i.valorGuardado);
    document.getElementById('itemStatus').value = i.status || 'em_andamento';
    setTexto('modalItem-title', 'Editar Item para Compra');
    window.App.abrirModal('modalItem');
}

function excluirItem(id) {
    const i = buscarItem(id);
    if (!i) return;
    abrirConfirmarExclusao(
        'Excluir item?',
        `Deseja excluir "${Utils.escapeHTML(i.nome || '')}" da lista de compras?`,
        () => {
            Storage.removerItemCompra(String(i.id));
            Toast.success('Item excluído.');
            renderEconomias();
        }
    );
}

let confirmarExclusaoCallback = null;

function abrirConfirmarExclusao(titulo, mensagem, aoConfirmar) {
    confirmarExclusaoCallback = aoConfirmar;
    if (document.getElementById('modalConfirmarTitle')) {
        document.getElementById('modalConfirmarTitle').textContent = titulo;
    }
    if (document.getElementById('modalConfirmarMensagem')) {
        document.getElementById('modalConfirmarMensagem').textContent = mensagem;
    }
    window.App.abrirModal('modalConfirmarExclusao');
}

function configurarConfirmarExclusao() {
    const btn = document.getElementById('btnConfirmarExclusao');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const acao = confirmarExclusaoCallback;
        confirmarExclusaoCallback = null;
        window.App.fecharModal(document.getElementById('modalConfirmarExclusao'));
        if (typeof acao === 'function') acao();
    });

    const modal = document.getElementById('modalConfirmarExclusao');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                confirmarExclusaoCallback = null;
            }
        });
        modal.querySelectorAll('[data-fechar-modal]').forEach(b => {
            b.addEventListener('click', () => {
                confirmarExclusaoCallback = null;
            });
        });
    }
}

function configurarFormularios() {
    const btnNovaEconomia = document.getElementById('btnNovaEconomia');
    const formEconomia = document.getElementById('formEconomia');
    const btnNovoItem = document.getElementById('btnNovoItem');
    const formItem = document.getElementById('formItem');

    // Máscara de moeda nos campos monetários
    ['ecoValor', 'itemValorEstimado', 'itemValorGuardado']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) Utils.aplicarMascaraMoeda(el);
        });

    if (btnNovaEconomia) {
        btnNovaEconomia.addEventListener('click', () => {
            document.getElementById('ecoId').value = '';
            document.getElementById('formEconomia').reset();
            document.getElementById('ecoData').value = Utils.hojeISO();
            setTexto('modalEconomia-title', 'Guardar Valor');
            window.App.abrirModal('modalEconomia');
        });
    }

    if (formEconomia) {
        formEconomia.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('ecoId').value;
            const valor = Utils.moedaParaNumero(document.getElementById('ecoValor').value);
            const data = document.getElementById('ecoData').value;
            const destino = document.getElementById('ecoDestino').value;

            if (!valor || !data) return;

            if (id) {
                Storage.atualizarEconomia(id, { valor, data, destino });
                Toast.success('Valor guardado atualizado.');
            } else {
                Storage.adicionarEconomia({ valor, data, destino });
            }

            document.getElementById('modalEconomia').classList.remove('active');
            renderEconomias();
        });
    }

    if (btnNovoItem) {
        btnNovoItem.addEventListener('click', () => {
            document.getElementById('itemId').value = '';
            document.getElementById('formItem').reset();
            setTexto('modalItem-title', 'Novo Item para Compra');
            window.App.abrirModal('modalItem');
        });
    }

    if (formItem) {
        formItem.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('itemId').value;
            const nome = document.getElementById('itemNome').value.trim();
            const valorEstimado = Utils.moedaParaNumero(document.getElementById('itemValorEstimado').value);
            const valorGuardado = Utils.moedaParaNumero(document.getElementById('itemValorGuardado').value);
            const status = document.getElementById('itemStatus').value;

            if (!nome || !valorEstimado) return;

            if (id) {
                Storage.atualizarItemCompra(id, { nome, valorEstimado, valorGuardado, status });
                Toast.success('Item atualizado.');
            } else {
                Storage.adicionarItemCompra({ nome, valorEstimado, valorGuardado, status });
            }

            document.getElementById('modalItem').classList.remove('active');
            renderEconomias();
        });
    }
}

function setTexto(id, texto) {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
}