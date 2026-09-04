/* ==========================================
   MENSAL - Controle Financeiro Mensal
   ========================================== */

let controleMensal = {
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear()
};

function iniciarPagina() {
    renderMes();
    configurarEventos();
}

function chaveMesAtual() {
    return Utils.chaveMes(controleMensal.ano, controleMensal.mes);
}

function obterOuCriarMes() {
    const id = chaveMesAtual();
    const mes = Storage.getMes(id);
    if (mes) return mes;

    const novoMes = {
        id,
        nome: `${Utils.nomeMes(controleMensal.mes)} ${controleMensal.ano}`,
        salario: 0,
        reembolso: 0,
        cartoesCredito: [],
        debitosAutomaticos: [],
        divisaoApartamento: 0,
        economia: 0,
        gastosFixos: 0,
        gastosVariaveis: 0,
        gastosPessoaisDisponiveis: 0,
        gastosRealizados: 0
    };

    Storage.salvarMes(novoMes);
    return novoMes;
}

function renderMes() {
    atualizarSelector();
    const mes = obterOuCriarMes();

    // Salário
    setTexto('salarioMes', Utils.formatarMoeda(mes.salario || 0));

    // Distribuição
    renderDistribuicao(mes);

    // Gráfico de distribuição
    desenharGraficoDistribuicao(mes);

    // Cartões de crédito
    renderCartoes(mes);

    // Débitos automáticos
    renderDebitos(mes);

    // Controle de gastos
    renderControleGastos(mes);

    // Histórico
    renderHistorico();
}

function atualizarSelector() {
    setTexto('mesAtualNome', Utils.nomeMes(controleMensal.mes));
    setTexto('mesAtualAno', String(controleMensal.ano));
}

function renderDistribuicao(mes) {
    const lista = document.getElementById('listaDistribuicao');
    if (!lista) return;

    const salario = mes.salario || 0;
    const reembolso = mes.reembolso || 0;
    const apartamento = mes.divisaoApartamento || 0;
    const economia = mes.economia || 0;
    const despesas = Calculos.totalDespesas(mes);
    const disponivel = Calculos.gastosPessoaisDisponiveis(mes);

    const itens = [
        { label: 'Salário', value: salario, classe: '' },
        { label: 'Reembolso', value: reembolso, classe: disponivel >= 0 ? 'positive' : '' },
        { label: 'Destino ao Apartamento', value: apartamento, classe: '' },
        { label: 'Destino à Economia', value: economia, classe: 'positive' },
        { label: 'Gastos Fixos + Variáveis', value: despesas, classe: 'negative' },
        { label: 'Disponível para Gastos Pessoais', value: disponivel, classe: disponivel >= 0 ? 'positive' : 'negative' }
    ];

    lista.innerHTML = itens.map(item => `
        <div class="distribution-item">
            <span class="label">${item.label}</span>
            <span class="value ${item.classe}">${Utils.formatarMoeda(item.value)}</span>
        </div>
    `).join('');
}

function desenharGraficoDistribuicao(mes) {
    const canvas = document.getElementById('chartDistribuicao');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const tema = document.documentElement.getAttribute('data-theme') || 'light';
    const cores = getCoresTema(tema);

    const largura = canvas.parentElement.clientWidth || 300;
    canvas.width = largura;
    canvas.height = 250;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const data = [
        { label: 'Apartamento', value: mes.divisaoApartamento || 0, cor: cores.primary },
        { label: 'Economia', value: mes.economia || 0, cor: cores.success },
        { label: 'Despesas', value: Calculos.totalDespesas(mes), cor: cores.danger },
        { label: 'Disponível', value: Math.max(0, Calculos.gastosPessoaisDisponiveis(mes)), cor: cores.secondary }
    ];

    const total = data.reduce((s, d) => s + d.value, 0);
    if (total <= 0) {
        ctx.fillStyle = cores.textSecundario;
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Sem dados para o mês', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Gráfico de pizza
    const centroX = canvas.width / 2;
    const centroY = canvas.height / 2 - 10;
    const raio = Math.min(centroX - 10, centroY - 10, 90);

    let anguloInicio = -Math.PI / 2;

    data.forEach(d => {
        if (d.value <= 0) return;
        const fracao = d.value / total;
        const anguloFim = anguloInicio + fracao * 2 * Math.PI;

        ctx.beginPath();
        ctx.moveTo(centroX, centroY);
        ctx.arc(centroX, centroY, raio, anguloInicio, anguloFim);
        ctx.closePath();
        ctx.fillStyle = d.cor;
        ctx.fill();

        // Borda branca entre fatias
        ctx.strokeStyle = cores.fundo;
        ctx.lineWidth = 2;
        ctx.stroke();

        anguloInicio = anguloFim;
    });

    // Legenda
    let y = 8;
    ctx.font = '12px sans-serif';
    data.forEach(d => {
        const fracao = total > 0 ? (d.value / total) * 100 : 0;
        ctx.fillStyle = d.cor;
        ctx.fillRect(8, y, 12, 12);
        ctx.fillStyle = cores.texto;
        ctx.textAlign = 'left';
        ctx.fillText(`${d.label}: ${fracao.toFixed(1)}%`, 26, y + 10);
        y += 20;
    });

    // Título
    ctx.fillStyle = cores.textSecundario;
    ctx.textAlign = 'center';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Total alocado: ${Utils.formatarMoeda(total)}`, canvas.width / 2, canvas.height - 4);
}

function renderCartoes(mes) {
    const grid = document.getElementById('gridCartoesCredito');
    if (!grid) return;

    if (!mes.cartoesCredito || mes.cartoesCredito.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <p class="empty-icon">💳</p>
                <p class="empty-title">Nenhum cartão de crédito</p>
                <p class="empty-text">Os cartões aparecerão aqui quando cadastrados.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = mes.cartoesCredito.map(cc => `
        <div class="credit-card">
            <div class="cc-header">
                <span class="cc-name">${Utils.escapeHTML(cc.nome)}</span>
                <span class="cc-total">${Utils.formatarMoeda(cc.totalPagar)}</span>
            </div>
            <div class="cc-items">
                ${(cc.parcelas || []).map(p =>
                    `<div>${Utils.escapeHTML(p.descricao)} — ${Utils.formatarMoeda(p.valor)}${p.quantParcelas ? ` (${p.quantParcelas})` : ''}</div>`
                ).join('') || 'Sem parcelas'}
                ${cc.reembolso ? `<div style="margin-top:8px;color:#ffd700"><strong>Reembolso: ${Utils.formatarMoeda(cc.reembolso)}</strong></div>` : ''}
            </div>
        </div>
    `).join('');
}

function renderDebitos(mes) {
    const corpo = document.getElementById('corpoTabelaDebitos');
    if (!corpo) return;

    const debitos = mes.debitosAutomaticos || [];
    corpo.innerHTML = debitos.length
        ? debitos.map(d => `
            <tr>
                <td>${Utils.escapeHTML(d.descricao)}</td>
                <td class="text-right">${Utils.formatarMoeda(d.valor)}</td>
            </tr>
        `).join('')
        : `<tr><td colspan="2" class="empty-state">Sem débitos automáticos neste mês.</td></tr>`;
}

function renderControleGastos(mes) {
    const limiteInput = document.getElementById('limiteGastos');
    const gastosInput = document.getElementById('gastosRealizados');
    const statusEl = document.getElementById('statusOrcamento');

    const limite = mes.gastosPessoaisDisponiveis || 0;
    const gastos = mes.gastosRealizados || 0;

    if (limiteInput) {
        limiteInput.value = Utils.paraMoedaInput(limite);
    }
    if (gastosInput) {
        gastosInput.value = Utils.paraMoedaInput(gastos);
    }

    if (statusEl) {
        renderStatusOrcamento(statusEl, limite, gastos);
    }
}

function renderStatusOrcamento(el, limite, gastos) {
    const saldo = limite - gastos;
    const percentual = limite > 0 ? (gastos / limite) * 100 : 0;

    let estado = 'ok';
    let mensagem;
    if (saldo < 0) {
        estado = 'den-danger';
        mensagem = `Atenção! Gastou ${Utils.formatarMoeda(Math.abs(saldo))} acima do limite (${percentual.toFixed(0)}% do orçamento)`;
    } else if (percentual >= 0.8) {
        estado = 'den-warn';
        mensagem = `Cuidado! Usou ${percentual.toFixed(0)}% do limite. Restam ${Utils.formatarMoeda(saldo)}`;
    } else {
        mensagem = `Dentro do orçamento. Usou ${percentual.toFixed(0)}% do limite. Restam ${Utils.formatarMoeda(saldo)}`;
    }

    el.className = `budget-status ${estado}`;
    el.textContent = mensagem;
}

function renderHistorico() {
    const corpo = document.getElementById('corpoTabelaHistorico');
    if (!corpo) return;

    const meses = Storage.getMeses();
    const lista = [...meses].sort((a, b) => a.id.localeCompare(b.id)).reverse();

    corpo.innerHTML = lista.length
        ? lista.map(m => `
            <tr>
                <td>${Utils.escapeHTML(m.nome)}</td>
                <td class="text-right">${Utils.formatarMoeda(m.salario || 0)}</td>
                <td class="text-right">${Utils.formatarMoeda(m.divisaoApartamento || 0)}</td>
                <td class="text-right">${Utils.formatarMoeda(m.economia || 0)}</td>
                <td class="text-right">${Utils.formatarMoeda(Calculos.totalDespesas(m))}</td>
            </tr>
        `).join('')
        : '<tr><td colspan="5" class="empty-state">Nenhum mês cadastrado ainda.</td></tr>';
}

function configurarEventos() {
    // Máscara de moeda nos campos monetários
    const camposMoeda = [
        'limiteGastos', 'gastosRealizados',
        'salarioInput', 'reembolsoInput', 'divisaoApartamentoInput',
        'economiaInput', 'gastosFixosInput', 'gastosVariaveisInput'
    ];
    camposMoeda.forEach(id => {
        const el = document.getElementById(id);
        if (el) Utils.aplicarMascaraMoeda(el);
    });

    // Navegação entre meses
    const btnAnterior = document.getElementById('btnMesAnterior');
    const btnProximo = document.getElementById('btnMesProximo');

    if (btnAnterior) {
        btnAnterior.addEventListener('click', () => {
            navegarMes(-1);
        });
    }

    if (btnProximo) {
        btnProximo.addEventListener('click', () => {
            navegarMes(1);
        });
    }

    // Editar salário
    const btnEditar = document.getElementById('btnEditarSalario');
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            const mes = obterOuCriarMes();
            document.getElementById('salarioInput').value = Utils.paraMoedaInput(mes.salario);
            document.getElementById('reembolsoInput').value = Utils.paraMoedaInput(mes.reembolso);
            document.getElementById('divisaoApartamentoInput').value = Utils.paraMoedaInput(mes.divisaoApartamento);
            document.getElementById('economiaInput').value = Utils.paraMoedaInput(mes.economia);
            document.getElementById('gastosFixosInput').value = Utils.paraMoedaInput(mes.gastosFixos);
            document.getElementById('gastosVariaveisInput').value = Utils.paraMoedaInput(mes.gastosVariaveis);
            window.App.abrirModal('modalSalario');
        });
    }

    const formSalario = document.getElementById('formSalario');
    if (formSalario) {
        formSalario.addEventListener('submit', (e) => {
            e.preventDefault();
            const mes = obterOuCriarMes();

            mes.salario = Utils.moedaParaNumero(document.getElementById('salarioInput').value);
            mes.reembolso = Utils.moedaParaNumero(document.getElementById('reembolsoInput').value);
            mes.divisaoApartamento = Utils.moedaParaNumero(document.getElementById('divisaoApartamentoInput').value);
            mes.economia = Utils.moedaParaNumero(document.getElementById('economiaInput').value);
            mes.gastosFixos = Utils.moedaParaNumero(document.getElementById('gastosFixosInput').value);
            mes.gastosVariaveis = Utils.moedaParaNumero(document.getElementById('gastosVariaveisInput').value);
            mes.gastosPessoaisDisponiveis = Calculos.gastosPessoaisDisponiveis(mes);

            Storage.salvarMes(mes);
            document.getElementById('modalSalario').classList.remove('active');
            renderMes();
        });
    }

    // Controle de gastos (atualiza ao digitar)
    const limiteInput = document.getElementById('limiteGastos');
    const gastosInput = document.getElementById('gastosRealizados');

    const salvarGastos = () => {
        const mes = obterOuCriarMes();
        mes.gastosPessoaisDisponiveis = Utils.moedaParaNumero(limiteInput.value);
        mes.gastosRealizados = Utils.moedaParaNumero(gastosInput.value);
        Storage.salvarMes(mes);
        renderMes();
    };

    if (gastosInput) {
        gastosInput.addEventListener('change', salvarGastos);
    }
}

function navegarMes(delta) {
    controleMensal.mes += delta;
    while (controleMensal.mes > 12) {
        controleMensal.mes -= 12;
        controleMensal.ano++;
    }
    while (controleMensal.mes < 1) {
        controleMensal.mes += 12;
        controleMensal.ano--;
    }
    renderMes();
}

function getCoresTema(tema) {
    if (tema === 'dark') {
        return {
            primary: '#3a7bd5',
            success: '#2dd4a7',
            danger: '#f27272',
            secondary: '#94a3b8',
            fundo: '#1e293b',
            texto: '#e5e7eb',
            textSecundario: '#94a3b8'
        };
    }
    return {
        primary: '#1a3a5f',
        success: '#047857',
        danger: '#b91c1c',
        secondary: '#6b7280',
        fundo: '#ffffff',
        texto: '#1f2937',
        textSecundario: '#6b7280'
    };
}

function setTexto(id, texto) {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
}
