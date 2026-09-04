/* ==========================================
   ECONOMIAS - Valores guardados e compras
   ========================================== */

function iniciarPagina() {
    renderEconomias();
    configurarFormularios();
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
                    <td class="text-right">${Utils.formatarMoeda(e.valor)}</td>
                    <td>${Utils.formatarData(e.data)}</td>
                    <td>${Utils.escapeHTML(e.observacao || '')}</td>
                </tr>
            `).join('')
            : `<tr><td colspan="3" class="empty-state">Nenhum valor guardado ainda.</td></tr>`;
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
                const statusClass = item.status === 'concluido' ? 'concluido' : 'em_andamento';
                const statusText = item.status === 'concluido' ? 'Concluído' : 'Em andamento';
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
                            <div class="item-progress-fill" style="width:${Math.min(percent, 100)}%"></div>
                        </div>
                        <div class="item-percent">${percent.toFixed(0)}% guardado</div>
                    </div>
                `;
            }).join('');
        }
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
            document.getElementById('ecoData').value = Utils.hojeISO();
            document.getElementById('formEconomia').reset();
            window.App.abrirModal('modalEconomia');
        });
    }

    if (formEconomia) {
        formEconomia.addEventListener('submit', (e) => {
            e.preventDefault();
            const valor = Utils.moedaParaNumero(document.getElementById('ecoValor').value);
            const data = document.getElementById('ecoData').value;
            const observacao = document.getElementById('ecoObservacao').value.trim();

            if (!valor || !data) return;

            Storage.adicionarEconomia({
                valor,
                data,
                observacao,
                destino: observacao.toLowerCase().includes('balão') ? 'pagamento-balao' : 'compras'
            });

            document.getElementById('modalEconomia').classList.remove('active');
            renderEconomias();
        });
    }

    if (btnNovoItem) {
        btnNovoItem.addEventListener('click', () => {
            document.getElementById('formItem').reset();
            window.App.abrirModal('modalItem');
        });
    }

    if (formItem) {
        formItem.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = document.getElementById('itemNome').value.trim();
            const valorEstimado = Utils.moedaParaNumero(document.getElementById('itemValorEstimado').value);
            const valorGuardado = Utils.moedaParaNumero(document.getElementById('itemValorGuardado').value);
            const status = document.getElementById('itemStatus').value;

            if (!nome || !valorEstimado) return;

            Storage.adicionarItemCompra({
                nome,
                valorEstimado,
                valorGuardado,
                status
            });

            document.getElementById('modalItem').classList.remove('active');
            renderEconomias();
        });
    }
}

function setTexto(id, texto) {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
}
