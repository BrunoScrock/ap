/* ==========================================
   DASHBOARD - Resumo Geral
   ========================================== */

function iniciarPagina() {
    renderDashboard();
}

function renderDashboard() {
    const configuracoes = Storage.getConfiguracoes();
    const pagamentos = Storage.getPagamentos();
    const economias = Storage.getEconomias();

    const valorTotal = configuracoes.valorTotalApartamento || 0;
    const totalPago = Calculos.totalPago(pagamentos);
    const saldoDevedor = Calculos.saldoDevedor(valorTotal, pagamentos);
    const percentual = Calculos.percentualQuitacao(valorTotal, pagamentos);
    const totalGuardado = Calculos.totalGuardado(economias);
    const dataEntrega = configuracoes.dataEntrega;

    // Cards principais
    setTexto('valorTotal', Utils.formatarMoeda(valorTotal));
    setTexto('totalPago', Utils.formatarMoeda(totalPago));
    setTexto('saldoDevedor', Utils.formatarMoeda(saldoDevedor));
    setTexto('progressoQuitacao', `${percentual.toFixed(1)}%`);
    setTexto('totalGuardado', Utils.formatarMoeda(totalGuardado));
    setTexto('dataEntrega', Utils.formatarData(dataEntrega));

    // Progresso
    const progressBar = document.getElementById('progressBarAtivo');
    if (progressBar) {
        progressBar.style.width = `${Math.min(percentual, 100)}%`;
        progressBar.querySelector('span').textContent = `${percentual.toFixed(1)}%`;
    }
    setTexto('valorPagoInfo', Utils.formatarMoeda(totalPago));
    setTexto('valorTotalInfo', Utils.formatarMoeda(valorTotal));

    // Resumo rápido
    renderResumoRapido(pagamentos, totalGuardado);

    // Gráficos
    desenharGraficoPagoDevedor(totalPago, saldoDevedor);
}

function renderResumoRapido(pagamentos, totalGuardado) {
    const container = document.getElementById('resumoRapido');
    if (!container) return;

    const pagos = Calculos.quantidadePagamentos(pagamentos);
    const totalParcelas = pagamentos.length;
    const ano = new Date().getFullYear();
    const mes = new Date().getMonth() + 1;
    const totalPagoMes = Calculos.totalPago(pagamentos, { mes, ano });
    const totalINCC = Calculos.totalINCC(pagamentos);

    container.innerHTML = `
        <div class="resumo-rapido-grid">
            <div class="mini-stat">
                <span class="mini-label">Parcelas Pagas</span>
                <span class="mini-value">${pagos} / ${totalParcelas}</span>
            </div>
            <div class="mini-stat">
                <span class="mini-label">Pago no Mês</span>
                <span class="mini-value">${Utils.formatarMoeda(totalPagoMes)}</span>
            </div>
            <div class="mini-stat">
                <span class="mini-label">INCC / Juros</span>
                <span class="mini-value">${Utils.formatarMoeda(totalINCC)}</span>
            </div>
            <div class="mini-stat">
                <span class="mini-label">Guardado</span>
                <span class="mini-value">${Utils.formatarMoeda(totalGuardado)}</span>
            </div>
        </div>
    `;
}

function setTexto(id, texto) {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
}

let _rafChart = null;
let _ultimosValoresChart = null;

function desenharGraficoPagoDevedor(pago, devedor) {
    const canvas = document.getElementById('chartPagoDevedor');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    _ultimosValoresChart = [pago, devedor];
    if (_rafChart) cancelAnimationFrame(_rafChart);

    const tema = document.documentElement.getAttribute('data-theme') || 'light';
    const cores = getCoresTema(tema);

    const total = (pago + devedor) || 1;
    const pctPago = pago / total;

    const desenhar = (progresso) => {
        const dpr = window.devicePixelRatio || 1;
        const larguraCss = canvas.clientWidth || (canvas.parentElement ? canvas.parentElement.clientWidth - 32 : 300) || 300;
        const alturaCss = 300;
        canvas.width = Math.round(larguraCss * dpr);
        canvas.height = Math.round(alturaCss * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, larguraCss, alturaCss);

        const cx = larguraCss / 2;
        const cy = 126;
        const raio = Math.max(56, Math.min((larguraCss - 56) / 2, 86));
        const espessura = Math.max(18, Math.min(30, raio * 0.34));
        const inicio = -Math.PI / 2;
        const gap = 0.035;
        const angulo = Math.PI * 2 * progresso;
        const angPago = angulo * pctPago;
        const angDevedor = angulo * (1 - pctPago);

        // Trilha (fundo)
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(127, 135, 150, 0.16)';
        ctx.lineWidth = espessura;
        ctx.beginPath();
        ctx.arc(cx, cy, raio, 0, Math.PI * 2);
        ctx.stroke();

        // Arco devedor (vermelho)
        if (angDevedor > gap * 2) {
            ctx.strokeStyle = cores.danger;
            ctx.beginPath();
            ctx.arc(cx, cy, raio, inicio + angPago + gap, inicio + angulo - gap);
            ctx.stroke();
        }

        // Arco pago (verde), com sombra
        if (angPago > gap * 2) {
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 3;
            ctx.strokeStyle = cores.success;
            ctx.beginPath();
            ctx.arc(cx, cy, raio, inicio + gap, inicio + angPago - gap);
            ctx.stroke();
            ctx.restore();
        }

        // Valor central: % quitado
        ctx.textAlign = 'center';
        ctx.fillStyle = cores.texto;
        ctx.font = 'bold 30px sans-serif';
        ctx.fillText((pctPago * 100).toFixed(1) + '%', cx, cy + 5);
        ctx.fillStyle = cores.textSecundario;
        ctx.font = '12px sans-serif';
        ctx.fillText('quitado', cx, cy + 25);

        // Legenda
        const linhas = [
            { cor: cores.success, label: 'Total Pago', valor: pago, pct: pctPago },
            { cor: cores.danger, label: 'Saldo Devedor', valor: devedor, pct: 1 - pctPago }
        ];
        const yInicial = cy + raio + 34;
        linhas.forEach((linha, i) => {
            const y = yInicial + i * 22;
            const txtValor = Utils.formatarMoeda(linha.valor) + '  (' + (linha.pct * 100).toFixed(1) + '%)';

            let fs = 12;
            ctx.font = fs + 'px sans-serif';
            ctx.textAlign = 'left';
            let wLabel = ctx.measureText(linha.label).width;
            let wValor = ctx.measureText(txtValor).width;
            while (wLabel + wValor + 28 > larguraCss - 24 && fs > 9.5) {
                fs -= 0.5;
                ctx.font = fs + 'px sans-serif';
                wLabel = ctx.measureText(linha.label).width;
                wValor = ctx.measureText(txtValor).width;
            }

            const startX = (larguraCss - (wLabel + wValor + 28)) / 2;

            // Bolinha colorida
            ctx.fillStyle = linha.cor;
            ctx.beginPath();
            ctx.arc(startX + 5, y - 4, 5, 0, Math.PI * 2);
            ctx.fill();

            // Rótulo
            ctx.fillStyle = cores.textSecundario;
            ctx.fillText(linha.label, startX + 15, y);

            // Valor + %
            ctx.font = 'bold ' + fs + 'px sans-serif';
            ctx.fillStyle = cores.texto;
            ctx.fillText(txtValor, startX + 15 + wLabel + 13, y);
        });
    };

    const inicioT = performance.now();
    const duracao = 950;
    const animar = (agora) => {
        const t = Math.min((agora - inicioT) / duracao, 1);
        const e = 1 - Math.pow(1 - t, 3);
        desenhar(e);
        if (t < 1) _rafChart = requestAnimationFrame(animar);
    };
    _rafChart = requestAnimationFrame(animar);
}

window.addEventListener('resize', () => {
    if (_ultimosValoresChart) {
        desenharGraficoPagoDevedor(_ultimosValoresChart[0], _ultimosValoresChart[1]);
    }
});

window.redesenharGraficos = function () {
    if (_ultimosValoresChart) {
        desenharGraficoPagoDevedor(_ultimosValoresChart[0], _ultimosValoresChart[1]);
    }
};

function getCoresTema(tema) {
    if (tema === 'dark') {
        return {
            primary: '#3a7bd5',
            success: '#2dd4a7',
            successDark: '#12a785',
            danger: '#f27272',
            dangerDark: '#d05555',
            texto: '#e5e7eb',
            textSecundario: '#94a3b8'
        };
    }
    return {
        primary: '#2c5585',
        success: '#047857',
        successDark: '#036f50',
        danger: '#b91c1c',
        dangerDark: '#991b1b',
        texto: '#1f2937',
        textSecundario: '#6b7280'
    };
}
