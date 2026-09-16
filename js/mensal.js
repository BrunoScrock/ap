/* ==========================================
   MENSAL - Controle Financeiro Mensal (Bruno + Geovana)
   ========================================== */

let controleMensal = {
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear()
};

const PESSOAS = ['bruno', 'geovana'];

let confirmarExclusaoCallback = null;

function iniciarPagina() {
    migrarEstruturaMensal();
    renderMes();
    configurarFormularios();
    configurarConfirmarExclusao();
}

/* ---------- Migração dos dados antigos ---------- */

function migrarEstruturaMensal() {
    const meses = Storage.getMeses();
    const novos = meses.filter(m => m && m.bruno && m.geovana && m.apartamento);
    if (novos.length !== meses.length) {
        Storage.setMeses(novos);
    }
}

/* ---------- Modelo de dados ---------- */

function chaveMesAtual() {
    return Utils.chaveMes(controleMensal.ano, controleMensal.mes);
}

function criarPessoaModelo() {
    return {
        salario: 0,
        outrasReceitas: 0,
        credito: [],
        debito: [],
        reembolsos: []
    };
}

function obterOuCriarMes() {
    const id = chaveMesAtual();
    const mes = Storage.getMes(id);
    if (mes) {
        if (!mes.bruno) mes.bruno = criarPessoaModelo();
        if (!mes.geovana) mes.geovana = criarPessoaModelo();
        if (!mes.apartamento) mes.apartamento = { entrada: 0, juros: 0 };
        return mes;
    }
    const novoMes = {
        id,
        nome: `${Utils.nomeMes(controleMensal.mes)} ${controleMensal.ano}`,
        bruno: criarPessoaModelo(),
        geovana: criarPessoaModelo(),
        apartamento: { entrada: 0, juros: 0 }
    };
    Storage.salvarMes(novoMes);
    return novoMes;
}

function obterLista(mes, tipo, pessoa) {
    if (tipo === 'credito') return mes[pessoa].credito;
    if (tipo === 'debito') return mes[pessoa].debito;
    return mes[pessoa].reembolsos;
}

function rotuloTipo(tipo) {
    if (tipo === 'credito') return 'cartão de crédito';
    if (tipo === 'debito') return 'cartão de débito';
    return 'reembolso';
}

function nomePessoa(pessoa) {
    return pessoa === 'bruno' ? 'Bruno' : 'Geovana';
}

function idDe(pessoa) {
    return pessoa === 'bruno' ? 'Bruno' : 'Geo';
}

/* ---------- Cálculos por pessoa ---------- */

function somar(lista) {
    return lista.reduce((soma, item) => soma + (item.valor || 0), 0);
}

function totalCredito(p) { return somar(p.credito); }
function totalCreditoFixo(p) { return somar(p.credito.filter(c => c.tipo === 'fixo')); }
function totalCreditoParcelado(p) { return somar(p.credito.filter(c => c.tipo === 'parcelado')); }
function totalDebito(p) { return somar(p.debito); }

function reembolsoPorStatus(p, status) {
    return somar(p.reembolsos.filter(r => r.status === status));
}

function reembolsoRecebido(p) { return reembolsoPorStatus(p, 'recebido'); }
function reembolsoPrevisto(p) { return reembolsoPorStatus(p, 'previsto'); }

function totalEfetivoCredito(p) {
    return totalCredito(p) - reembolsoRecebido(p);
}

function totalReceitas(p) {
    return (p.salario || 0) + (p.outrasReceitas || 0);
}

function totalGastos(p) {
    return totalEfetivoCredito(p) + totalDebito(p);
}

function saldoAntesApto(p) {
    return totalReceitas(p) - totalGastos(p);
}

function saldoFinal(p, parteApto) {
    return saldoAntesApto(p) - (parteApto || 0);
}

/* ---------- Divisão do apartamento (75/25 ou 50/50) ---------- */

function calcularDivisao(mes) {
    const b = saldoAntesApto(mes.bruno);
    const g = saldoAntesApto(mes.geovana);
    const total = (mes.apartamento.entrada || 0) + (mes.apartamento.juros || 0);

    let brunoPct = null;
    let geovanaPct = null;
    let empate = false;
    let maior = null;

    if (total > 0) {
        if (Math.abs(b - g) < 0.005) {
            brunoPct = 0.5;
            geovanaPct = 0.5;
            empate = true;
        } else if (b > g) {
            brunoPct = 0.75;
            geovanaPct = 0.25;
            maior = 'bruno';
        } else {
            brunoPct = 0.25;
            geovanaPct = 0.75;
            maior = 'geovana';
        }
    }

    const brunoParte = brunoPct === null ? 0 : Math.round(total * brunoPct * 100) / 100;
    const geovanaParte = total - brunoParte;

    return { total, brunoPct, geovanaPct, brunoParte, geovanaParte, empate, maior };
}

/* ---------- Renderização ---------- */

function renderMes() {
    atualizarSelector();
    const mes = obterOuCriarMes();
    const divisao = calcularDivisao(mes);

    renderApartamento(mes, divisao);
    PESSOAS.forEach(p => renderPessoa(mes, p, divisao));
    renderResumoFinal(mes, divisao);
    renderMensagensFinal(mes, divisao);
}

function atualizarSelector() {
    setTexto('mesAtualNome', Utils.nomeMes(controleMensal.mes));
    setTexto('mesAtualAno', String(controleMensal.ano));
}

function renderApartamento(mes, divisao) {
    const inEntrada = document.getElementById('apEntrada');
    const inJuros = document.getElementById('apJuros');
    if (inEntrada) inEntrada.value = Utils.paraMoedaInput(mes.apartamento.entrada);
    if (inJuros) inJuros.value = Utils.paraMoedaInput(mes.apartamento.juros);

    setTexto('apTotal', Utils.formatarMoeda(divisao.total));

    const brunoPct = divisao.brunoPct === null ? '—' : `${Math.round(divisao.brunoPct * 100)}%`;
    const geovanaPct = divisao.geovanaPct === null ? '—' : `${Math.round(divisao.geovanaPct * 100)}%`;

    setTexto('splitBrunoPct', brunoPct);
    setTexto('splitBrunoVal', Utils.formatarMoeda(divisao.brunoParte));
    setTexto('splitGeovanaPct', geovanaPct);
    setTexto('splitGeovanaVal', Utils.formatarMoeda(divisao.geovanaParte));

    const boxBruno = document.getElementById('splitBruno');
    const boxGeo = document.getElementById('splitGeovana');
    if (boxBruno) boxBruno.classList.toggle('maior', divisao.maior === 'bruno');
    if (boxGeo) boxGeo.classList.toggle('maior', divisao.maior === 'geovana');

    const note = document.getElementById('splitNote');
    if (note) note.hidden = !(divisao.empate && divisao.total > 0);
}

function renderPessoa(mes, pessoa, divisao) {
    const p = mes[pessoa];
    renderSalarioCampos(pessoa, p);
    renderCredito(mes, pessoa, p);
    renderReembolsos(mes, pessoa, p);
    renderDebito(mes, pessoa, p);
    renderResumoPessoa(pessoa, p, divisao);
}

function renderSalarioCampos(pessoa, p) {
    const suf = idDe(pessoa);
    const inSalario = document.getElementById(suf === 'Bruno' ? 'brunoSalarioInput' : 'geoSalarioInput');
    const inOutras = document.getElementById(suf === 'Bruno' ? 'brunoOutrasInput' : 'geoOutrasInput');
    if (inSalario) inSalario.value = Utils.paraMoedaInput(p.salario);
    if (inOutras) inOutras.value = Utils.paraMoedaInput(p.outrasReceitas);
    setTexto(`${suf === 'Bruno' ? 'bruno' : 'geo'}ReceitasTotal`, Utils.formatarMoeda(totalReceitas(p)));
}

function renderCredito(mes, pessoa, p) {
    const suf = idDe(pessoa);
    const total = totalCredito(p);
    const fixo = totalCreditoFixo(p);
    const parcelado = totalCreditoParcelado(p);
    const reemb = reembolsoRecebido(p);
    const efetivo = totalEfetivoCredito(p);

    setTexto(`credTotal${suf}`, Utils.formatarMoeda(total));
    setTexto(`credFixo${suf}`, Utils.formatarMoeda(fixo));
    setTexto(`credParcelado${suf}`, Utils.formatarMoeda(parcelado));
    setTexto(`credReemb${suf}`, Utils.formatarMoeda(reemb));
    setTexto(`credPrevisto${suf}`, Utils.formatarMoeda(reembolsoPrevisto(p)));
    setTexto(`credEfetivo${suf}`, Utils.formatarMoeda(efetivo));

    const corpo = document.getElementById(`corpoCredito${suf}`);
    if (!corpo) return;

    corpo.innerHTML = p.credito.length
        ? p.credito.map(c => `
            <tr>
                <td data-label="Descrição">${Utils.escapeHTML(c.descricao)}</td>
                <td data-label="Valor" class="text-right">${Utils.formatarMoeda(c.valor)}</td>
                <td data-label="Tipo">${c.tipo === 'parcelado' ? 'Parcelado' : 'Fixo'}</td>
                <td data-label="Parcelas">${c.quantParcelas || '—'}</td>
                <td data-label="Atual">${c.parcelaAtual || '—'}</td>
                <td data-label="Categoria">${Utils.escapeHTML(c.categoria) || '—'}</td>
                <td data-label="Observação">${Utils.escapeHTML(c.observacao) || '—'}</td>
                <td data-label="Ações">
                    <div class="acoes-cell">
                        ${botaoEditar('credito', c.id)}
                        ${botaoExcluir('credito', c.id)}
                    </div>
                </td>
            </tr>
        `).join('')
        : `<tr><td colspan="8" class="empty-state">Sem gastos de cartão de crédito neste mês.</td></tr>`;

    ligarAcoes(corpo, 'credito', pessoa);
}

function renderReembolsos(mes, pessoa, p) {
    const suf = idDe(pessoa);
    const corpo = document.getElementById(`corpoReembolso${suf}`);
    if (!corpo) return;

    corpo.innerHTML = p.reembolsos.length
        ? p.reembolsos.map(r => `
            <tr>
                <td data-label="Descrição">${Utils.escapeHTML(r.descricao)}</td>
                <td data-label="Valor" class="text-right">${Utils.formatarMoeda(r.valor)}</td>
                <td data-label="Responsável">${Utils.escapeHTML(r.responsavel) || '—'}</td>
                <td data-label="Status">${badgeReembolso(r.status)}</td>
                <td data-label="Observação">${Utils.escapeHTML(r.observacao) || '—'}</td>
                <td data-label="Ações">
                    <div class="acoes-cell">
                        ${botaoEditar('reembolso', r.id)}
                        ${botaoExcluir('reembolso', r.id)}
                    </div>
                </td>
            </tr>
        `).join('')
        : `<tr><td colspan="6" class="empty-state">Sem reembolsos neste mês.</td></tr>`;

    ligarAcoes(corpo, 'reembolso', pessoa);
}

function renderDebito(mes, pessoa, p) {
    const suf = idDe(pessoa);
    const total = totalDebito(p);
    setTexto(`debTotal${suf}`, Utils.formatarMoeda(total));

    const corpo = document.getElementById(`corpoDebito${suf}`);
    if (!corpo) return;

    corpo.innerHTML = p.debito.length
        ? p.debito.map(d => `
            <tr>
                <td data-label="Descrição">${Utils.escapeHTML(d.descricao)}</td>
                <td data-label="Valor" class="text-right">${Utils.formatarMoeda(d.valor)}</td>
                <td data-label="Categoria">${Utils.escapeHTML(d.categoria) || '—'}</td>
                <td data-label="Data">${Utils.formatarData(d.data)}</td>
                <td data-label="Observação">${Utils.escapeHTML(d.observacao) || '—'}</td>
                <td data-label="Ações">
                    <div class="acoes-cell">
                        ${botaoEditar('debito', d.id)}
                        ${botaoExcluir('debito', d.id)}
                    </div>
                </td>
            </tr>
        `).join('')
        : `<tr><td colspan="6" class="empty-state">Sem gastos de cartão de débito neste mês.</td></tr>`;

    ligarAcoes(corpo, 'debito', pessoa);
}

function renderResumoPessoa(pessoa, p, divisao) {
    const suf = pessoa === 'bruno' ? 'bruno' : 'geo';
    const receitas = totalReceitas(p);
    const totalCred = totalCredito(p);
    const reemb = reembolsoRecebido(p);
    const efetivo = totalEfetivoCredito(p);
    const deb = totalDebito(p);
    const gastos = totalGastos(p);
    const anterior = saldoAntesApto(p);
    const parteApto = pessoa === 'bruno' ? divisao.brunoParte : divisao.geovanaParte;
    const final = saldoFinal(p, parteApto);

    setTexto(`${suf}Salario`, Utils.formatarMoeda(receitas));
    setTexto(`${suf}Credito`, Utils.formatarMoeda(totalCred));
    setTexto(`${suf}Reembolsos`, Utils.formatarMoeda(reemb));
    setTexto(`${suf}Efetivo`, Utils.formatarMoeda(efetivo));
    setTexto(`${suf}Debito`, Utils.formatarMoeda(deb));
    setTexto(`${suf}Gastos`, Utils.formatarMoeda(gastos));
    setTexto(`${suf}SaldAntes`, Utils.formatarMoeda(anterior));
    setTexto(`${suf}Apto`, Utils.formatarMoeda(parteApto));
    setTexto(`${suf}SaldoFinal`, Utils.formatarMoeda(final));

    const elSaldoAntes = document.getElementById(`${suf}SaldAntes`);
    const elSaldoFinal = document.getElementById(`${suf}SaldoFinal`);
    if (elSaldoAntes) {
        elSaldoAntes.classList.toggle('positive', anterior >= 0);
        elSaldoAntes.classList.toggle('negative', anterior < 0);
    }
    if (elSaldoFinal) {
        elSaldoFinal.classList.toggle('positive', final >= 0);
        elSaldoFinal.classList.toggle('negative', final < 0);
    }
}

function renderResumoFinal(mes, divisao) {
    const corpo = document.getElementById('corpoResumoFinal');
    if (!corpo) return;

    const linhas = [
        ['Salário', totalReceitas(mes.bruno), totalReceitas(mes.geovana)],
        ['Crédito', totalCredito(mes.bruno), totalCredito(mes.geovana)],
        ['Reembolsos (recebidos)', reembolsoRecebido(mes.bruno), reembolsoRecebido(mes.geovana)],
        ['Débito', totalDebito(mes.bruno), totalDebito(mes.geovana)],
        ['Total de gastos', totalGastos(mes.bruno), totalGastos(mes.geovana)],
        ['Saldo antes do apartamento', saldoAntesApto(mes.bruno), saldoAntesApto(mes.geovana)],
        ['Divisão do apartamento', divisao.brunoParte, divisao.geovanaParte],
        ['Saldo final', saldoFinal(mes.bruno, divisao.brunoParte), saldoFinal(mes.geovana, divisao.geovanaParte)]
    ];

    corpo.innerHTML = linhas.map(([label, vb, vg]) => `
        <tr>
            <td>${label}</td>
            <td data-label="Bruno" class="text-right">${Utils.formatarMoeda(vb)}</td>
            <td data-label="Geovana" class="text-right">${Utils.formatarMoeda(vg)}</td>
        </tr>
    `).join('');
}

function renderMensagensFinal(mes, divisao) {
    const box = document.getElementById('mensagensSaldo');
    if (!box) return;

    box.innerHTML = PESSOAS.map(pessoa => {
        const nome = nomePessoa(pessoa);
        const parte = pessoa === 'bruno' ? divisao.brunoParte : divisao.geovanaParte;
        const final = saldoFinal(mes[pessoa], parte);
        const negativo = final < 0;
        const texto = `Após pagar os gastos do mês e sua parte do apartamento, o ${nome} ficará com ${Utils.formatarMoeda(final)}.`;
        return `
            <p class="saldo-mensagem ${negativo ? 'saldo-negativo' : 'saldo-positivo'}">
                ${texto}
                ${negativo ? ` <strong>Atenção:</strong> saldo negativo — não há valor suficiente para cobrir as despesas previstas.` : ''}
            </p>
        `;
    }).join('');
}

/* ---------- Utilitários de UI ---------- */

function botaoEditar(tipo, id) {
    return `
        <button class="btn-acoes" data-editar="${id}" data-tipo="${tipo}" title="Editar" aria-label="Editar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
        </button>`;
}

function botaoExcluir(tipo, id) {
    return `
        <button class="btn-acoes" data-excluir="${id}" data-tipo="${tipo}" title="Excluir" aria-label="Excluir">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
        </button>`;
}

function badgeReembolso(status) {
    if (status === 'recebido') return '<span class="status-badge recebido">Recebido</span>';
    if (status === 'cancelado') return '<span class="status-badge cancelado">Cancelado</span>';
    return '<span class="status-badge previsto">Previsto</span>';
}

function ligarAcoes(corpo, tipo, pessoa) {
    corpo.querySelectorAll('[data-editar]').forEach(btn => {
        btn.addEventListener('click', () => abrirEdicao(tipo, pessoa, btn.dataset.editar));
    });
    corpo.querySelectorAll('[data-excluir]').forEach(btn => {
        btn.addEventListener('click', () => excluirLancamento(tipo, pessoa, btn.dataset.excluir));
    });
}

/* ---------- Modals: novo / editar ---------- */

function abrirNovo(tipo, pessoa) {
    const nome = nomePessoa(pessoa);
    const rotulo = rotuloTipo(tipo);

    if (tipo === 'credito') {
        document.getElementById('formCredito').reset();
        document.getElementById('credId').value = '';
        document.getElementById('credPessoa').value = pessoa;
        setTexto('modalCredito-title', `Novo Gasto no ${rotulo} — ${nome}`);
        window.App.abrirModal('modalCredito');
    } else if (tipo === 'debito') {
        document.getElementById('formDebito').reset();
        document.getElementById('debId').value = '';
        document.getElementById('debPessoa').value = pessoa;
        setTexto('modalDebito-title', `Novo Gasto no ${rotulo} — ${nome}`);
        window.App.abrirModal('modalDebito');
    } else {
        document.getElementById('formReembolso').reset();
        document.getElementById('reembId').value = '';
        document.getElementById('reembPessoa').value = pessoa;
        setTexto('modalReembolso-title', `Novo Reembolso do Cartão — ${nome}`);
        window.App.abrirModal('modalReembolso');
    }
}

function abrirEdicao(tipo, pessoa, id) {
    const nome = nomePessoa(pessoa);
    const mes = obterOuCriarMes();
    const lista = obterLista(mes, tipo, pessoa);
    const item = lista.find(i => String(i.id) === String(id));
    if (!item) return;

    if (tipo === 'credito') {
        document.getElementById('credId').value = id;
        document.getElementById('credPessoa').value = pessoa;
        document.getElementById('credDescricao').value = item.descricao || '';
        document.getElementById('credValor').value = Utils.paraMoedaInput(item.valor);
        document.getElementById('credTipo').value = item.tipo === 'parcelado' ? 'parcelado' : 'fixo';
        document.getElementById('credQuant').value = item.quantParcelas || '';
        document.getElementById('credAtual').value = item.parcelaAtual || '';
        document.getElementById('credCategoria').value = item.categoria || '';
        document.getElementById('credObs').value = item.observacao || '';
        setTexto('modalCredito-title', `Editar Gasto no ${rotuloTipo(tipo)} — ${nome}`);
        window.App.abrirModal('modalCredito');
    } else if (tipo === 'debito') {
        document.getElementById('debId').value = id;
        document.getElementById('debPessoa').value = pessoa;
        document.getElementById('debDescricao').value = item.descricao || '';
        document.getElementById('debValor').value = Utils.paraMoedaInput(item.valor);
        document.getElementById('debCategoria').value = item.categoria || '';
        document.getElementById('debData').value = item.data || '';
        document.getElementById('debObs').value = item.observacao || '';
        setTexto('modalDebito-title', `Editar Gasto no ${rotuloTipo(tipo)} — ${nome}`);
        window.App.abrirModal('modalDebito');
    } else {
        document.getElementById('reembId').value = id;
        document.getElementById('reembPessoa').value = pessoa;
        document.getElementById('reembDescricao').value = item.descricao || '';
        document.getElementById('reembValor').value = Utils.paraMoedaInput(item.valor);
        document.getElementById('reembResponsavel').value = item.responsavel || '';
        document.getElementById('reembStatus').value = item.status || 'previsto';
        document.getElementById('reembObs').value = item.observacao || '';
        setTexto('modalReembolso-title', `Editar Reembolso do Cartão — ${nome}`);
        window.App.abrirModal('modalReembolso');
    }
}

function lerNumero(id) {
    const el = document.getElementById(id);
    return el ? Utils.moedaParaNumero(el.value) : 0;
}

/* ---------- Exclusão com confirmação ---------- */

function excluirLancamento(tipo, pessoa, id) {
    const mes = obterOuCriarMes();
    const lista = obterLista(mes, tipo, pessoa);
    const item = lista.find(i => String(i.id) === String(id));
    if (!item) return;

    abrirConfirmarExclusao(
        `Excluir ${rotuloTipo(tipo)}?`,
        `Deseja excluir "${Utils.escapeHTML(item.descricao)}" do ${rotuloTipo(tipo)} de ${nomePessoa(pessoa)}?`,
        () => {
            const mesAtual = obterOuCriarMes();
            const arr = obterLista(mesAtual, tipo, pessoa);
            const novaLista = arr.filter(i => String(i.id) !== String(id));
            if (tipo === 'credito') mesAtual[pessoa].credito = novaLista;
            else if (tipo === 'debito') mesAtual[pessoa].debito = novaLista;
            else mesAtual[pessoa].reembolsos = novaLista;
            Storage.salvarMes(mesAtual);
            Toast.success('Lançamento excluído.');
            renderMes();
        }
    );
}

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
            if (e.target === modal) confirmarExclusaoCallback = null;
        });
        modal.querySelectorAll('[data-fechar-modal]').forEach(b => {
            b.addEventListener('click', () => {
                confirmarExclusaoCallback = null;
            });
        });
    }
}

/* ---------- Formulários e eventos ---------- */

function configurarFormularios() {
    const camposMoeda = [
        'apEntrada', 'apJuros',
        'brunoSalarioInput', 'brunoOutrasInput',
        'geoSalarioInput', 'geoOutrasInput',
        'credValor', 'debValor', 'reembValor'
    ];
    camposMoeda.forEach(id => {
        const el = document.getElementById(id);
        if (el) Utils.aplicarMascaraMoeda(el);
    });

    // Navegação entre meses
    const btnAnterior = document.getElementById('btnMesAnterior');
    const btnProximo = document.getElementById('btnMesProximo');
    if (btnAnterior) btnAnterior.addEventListener('click', () => navegarMes(-1));
    if (btnProximo) btnProximo.addEventListener('click', () => navegarMes(1));

    // Botões "novo"
    const alvos = [
        ['btnNovoCreditoBruno', 'credito', 'bruno'],
        ['btnNovoCreditoGeo', 'credito', 'geovana'],
        ['btnNovoDebitoBruno', 'debito', 'bruno'],
        ['btnNovoDebitoGeo', 'debito', 'geovana'],
        ['btnNovoReembolsoBruno', 'reembolso', 'bruno'],
        ['btnNovoReembolsoGeo', 'reembolso', 'geovana']
    ];
    alvos.forEach(([idBtn, tipo, pessoa]) => {
        const el = document.getElementById(idBtn);
        if (el) el.addEventListener('click', () => abrirNovo(tipo, pessoa));
    });

    // Autosave de campos fixos (salários, receitas e apartamento)
    const camposAutosave = [
        ['brunoSalarioInput', 'salario', 'bruno'],
        ['brunoOutrasInput', 'outrasReceitas', 'bruno'],
        ['geoSalarioInput', 'salario', 'geovana'],
        ['geoOutrasInput', 'outrasReceitas', 'geovana'],
        ['apEntrada', 'entrada', 'apartamento'],
        ['apJuros', 'juros', 'apartamento']
    ];
    camposAutosave.forEach(([idInput, campo, alvo]) => {
        const el = document.getElementById(idInput);
        if (el) {
            el.addEventListener('change', () => {
                const mes = obterOuCriarMes();
                const valor = Utils.moedaParaNumero(el.value);
                if (alvo === 'apartamento') mes.apartamento[campo] = valor;
                else mes[alvo][campo] = valor;
                Storage.salvarMes(mes);
                renderMes();
            });
        }
    });

    // Formulário de crédito
    const formCredito = document.getElementById('formCredito');
    if (formCredito) {
        formCredito.addEventListener('submit', (e) => {
            e.preventDefault();
            const mes = obterOuCriarMes();
            const id = document.getElementById('credId').value;
            const pessoa = document.getElementById('credPessoa').value;
            const descricao = document.getElementById('credDescricao').value.trim();
            const valor = lerNumero('credValor');
            if (!descricao || valor <= 0) return;

            const dados = {
                descricao,
                valor,
                tipo: document.getElementById('credTipo').value,
                quantParcelas: document.getElementById('credQuant').value ? Number(document.getElementById('credQuant').value) : null,
                parcelaAtual: document.getElementById('credAtual').value ? Number(document.getElementById('credAtual').value) : null,
                categoria: document.getElementById('credCategoria').value.trim(),
                observacao: document.getElementById('credObs').value.trim()
            };

            if (id) {
                const lista = mes[pessoa].credito;
                const idx = lista.findIndex(i => String(i.id) === String(id));
                if (idx !== -1) lista[idx] = { ...lista[idx], ...dados };
            } else {
                mes[pessoa].credito.push({ id: Utils.gerarId(), ...dados });
            }

            Storage.salvarMes(mes);
            document.getElementById('modalCredito').classList.remove('active');
            Toast.success('Gasto de crédito salvo.');
            renderMes();
        });
    }

    // Formulário de débito
    const formDebito = document.getElementById('formDebito');
    if (formDebito) {
        formDebito.addEventListener('submit', (e) => {
            e.preventDefault();
            const mes = obterOuCriarMes();
            const id = document.getElementById('debId').value;
            const pessoa = document.getElementById('debPessoa').value;
            const descricao = document.getElementById('debDescricao').value.trim();
            const valor = lerNumero('debValor');
            if (!descricao || valor <= 0) return;

            const dados = {
                descricao,
                valor,
                categoria: document.getElementById('debCategoria').value.trim(),
                data: document.getElementById('debData').value || null,
                observacao: document.getElementById('debObs').value.trim()
            };

            if (id) {
                const lista = mes[pessoa].debito;
                const idx = lista.findIndex(i => String(i.id) === String(id));
                if (idx !== -1) lista[idx] = { ...lista[idx], ...dados };
            } else {
                mes[pessoa].debito.push({ id: Utils.gerarId(), ...dados });
            }

            Storage.salvarMes(mes);
            document.getElementById('modalDebito').classList.remove('active');
            Toast.success('Gasto de débito salvo.');
            renderMes();
        });
    }

    // Formulário de reembolso
    const formReembolso = document.getElementById('formReembolso');
    if (formReembolso) {
        formReembolso.addEventListener('submit', (e) => {
            e.preventDefault();
            const mes = obterOuCriarMes();
            const id = document.getElementById('reembId').value;
            const pessoa = document.getElementById('reembPessoa').value;
            const descricao = document.getElementById('reembDescricao').value.trim();
            const valor = lerNumero('reembValor');
            if (!descricao || valor <= 0) return;

            const dados = {
                descricao,
                valor,
                responsavel: document.getElementById('reembResponsavel').value.trim(),
                status: document.getElementById('reembStatus').value,
                observacao: document.getElementById('reembObs').value.trim()
            };

            if (id) {
                const lista = mes[pessoa].reembolsos;
                const idx = lista.findIndex(i => String(i.id) === String(id));
                if (idx !== -1) lista[idx] = { ...lista[idx], ...dados };
            } else {
                mes[pessoa].reembolsos.push({ id: Utils.gerarId(), ...dados });
            }

            Storage.salvarMes(mes);
            document.getElementById('modalReembolso').classList.remove('active');
            Toast.success('Reembolso salvo.');
            renderMes();
        });
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

function setTexto(id, texto) {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
}