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

    const desenhar = (progresso) => {
        const dpr = window.devicePixelRatio || 1;
        const larguraCss = canvas.parentElement.clientWidth || 300;
        const alturaCss = 260;
        canvas.width = Math.round(larguraCss * dpr);
        canvas.height = Math.round(alturaCss * dpr);
        canvas.style.width = larguraCss + 'px';
        canvas.style.height = alturaCss + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, larguraCss, alturaCss);

        const valores = [pago, devedor];
        const rotulos = ['Total Pago', 'Saldo Devedor'];
        const total = valores.reduce((a, b) => a + b, 0) || 1;
        const maxValor = Math.max(...valores, 1);

        const areaEsq = 14;
        const areaDir = 14;
        const areaTopo = 58;
        const larguraUtil = larguraCss - areaEsq - areaDir;
        const baseY = alturaCss - 42;
        const alturaMax = baseY - areaTopo;

        const espaco = 26;
        const larguraBarra = Math.min(130, (larguraUtil - espaco) / 2);

        // Linhas de grade horizontais
        ctx.strokeStyle = 'rgba(127, 135, 150, 0.22)';
        ctx.lineWidth = 1;
        [0.25, 0.5, 0.75].forEach((f) => {
            const gy = baseY - alturaMax * f;
            ctx.beginPath();
            ctx.moveTo(areaEsq, gy);
            ctx.lineTo(larguraCss - areaDir, gy);
            ctx.stroke();
        });

        // Linha de base
        ctx.strokeStyle = 'rgba(127, 135, 150, 0.4)';
        ctx.beginPath();
        ctx.moveTo(areaEsq, baseY);
        ctx.lineTo(larguraCss - areaDir, baseY);
        ctx.stroke();

        valores.forEach((valor, i) => {
            const xc = areaEsq + (larguraUtil / valores.length) * i + larguraUtil / (valores.length * 2);
            const x = xc - larguraBarra / 2;
            const largF = (valor / maxValor) * alturaMax * progresso;
            const y = baseY - largF;
            const altura = baseY - y;

            // Sombra da barra
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
            ctx.shadowBlur = 14;
            ctx.shadowOffsetY = 6;

            const grad = ctx.createLinearGradient(0, y, 0, baseY);
            grad.addColorStop(0, i === 0 ? cores.success : cores.danger);
            grad.addColorStop(1, i === 0 ? cores.successDark : cores.dangerDark);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x, y, larguraBarra, Math.max(altura, 0.001), Math.min(10, larguraBarra / 2));
            ctx.fill();
            ctx.restore();

            // Brilho no topo da barra
            if (altura > 10) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
                ctx.beginPath();
                ctx.roundRect(x + 2, y + 3, larguraBarra - 4, Math.min(6, altura / 2), 4);
                ctx.fill();
            }

            // Valor + porcentagem acima da barra
            const pct = ((valor / total) * 100).toFixed(1);
            const txtY = Math.min(y - 12, areaTopo - 16);
            ctx.textAlign = 'center';
            ctx.fillStyle = cores.texto;
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText(Utils.formatarMoeda(valor), xc, txtY);
            ctx.fillStyle = cores.textSecundario;
            ctx.font = '11px sans-serif';
            ctx.fillText(pct + '% do total', xc, txtY + 15);

            // Rótulo da categoria
            ctx.fillStyle = cores.textSecundario;
            ctx.font = '12px sans-serif';
            ctx.fillText(rotulos[i], xc, baseY + 20);
        });
    };

    // Animacao de crescimento (ease-out cubic)
    const inicio = performance.now();
    const duracao = 900;
    const animar = (agora) => {
        const t = Math.min((agora - inicio) / duracao, 1);
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
