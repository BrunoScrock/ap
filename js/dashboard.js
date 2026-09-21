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
    const totalGuardado = Calculos.totalDisponivelCompras(economias);
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

    // Legenda do gráfico
    setTexto('chartValorPago', Utils.formatarMoeda(totalPago));
    setTexto('chartValorDevedor', Utils.formatarMoeda(saldoDevedor));
    setTexto('chartPctPago', `${Math.min(percentual, 100).toFixed(1)}%`);
    setTexto('chartPctDevedor', `${Math.max(0, Math.min(100, 100 - percentual)).toFixed(1)}%`);

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
    const barraPct = totalParcelas ? Math.round((pagos / totalParcelas) * 100) : 0;

    container.innerHTML = `
        <div class="np-grid">
            <div class="np-card np-pago">
                <span class="np-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                </span>
                <span class="np-body">
                    <span class="np-label">Parcelas pagas</span>
                    <span class="np-value">${pagos} de ${totalParcelas}</span>
                    <span class="np-bar"><i style="width:${barraPct}%"></i></span>
                </span>
            </div>
            <div class="np-card np-mes">
                <span class="np-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                </span>
                <span class="np-body">
                    <span class="np-label">Pago no mês</span>
                    <span class="np-value">${Utils.formatarMoeda(totalPagoMes)}</span>
                </span>
            </div>
            <div class="np-card np-incc">
                <span class="np-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                        <polyline points="17 6 23 6 23 12"/>
                    </svg>
                </span>
                <span class="np-body">
                    <span class="np-label">INCC / Juros</span>
                    <span class="np-value">${Utils.formatarMoeda(totalINCC)}</span>
                </span>
            </div>
            <div class="np-card np-guardado">
                <span class="np-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                </span>
                <span class="np-body">
                    <span class="np-label">Guardado p/ compras</span>
                    <span class="np-value">${Utils.formatarMoeda(totalGuardado)}</span>
                </span>
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
        const alturaCss = 320;
        canvas.width = Math.round(larguraCss * dpr);
        canvas.height = Math.round(alturaCss * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, larguraCss, alturaCss);

        const cx = larguraCss / 2;
        const cy = 158;
        const raio = Math.max(72, Math.min((larguraCss - 56) / 2, 104));
        const espessura = Math.max(18, Math.min(30, raio * 0.34));
        const inicio = -Math.PI / 2;
        const gap = 0.035;
        const angulo = Math.PI * 2 * progresso;
        const angPago = angulo * pctPago;
        const angDevedor = angulo * (1 - pctPago);

        // Trilha (fundo)
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(127, 135, 150, 0.14)';
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

        // Arco pago (verde), com gradiente e sombra
        if (angPago > gap * 2) {
            const grad = ctx.createLinearGradient(cx - raio, cy - espessura, cx + raio, cy + espessura);
            grad.addColorStop(0, cores.successLight);
            grad.addColorStop(1, cores.success);
            ctx.save();
            ctx.strokeStyle = grad;
            ctx.shadowColor = 'rgba(4, 120, 87, 0.35)';
            ctx.shadowBlur = 16;
            ctx.shadowOffsetY = 4;
            ctx.beginPath();
            ctx.arc(cx, cy, raio, inicio + gap, inicio + angPago - gap);
            ctx.stroke();
            ctx.restore();
        }

        // Valor central: % quitado
        ctx.textAlign = 'center';
        ctx.fillStyle = cores.texto;
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText((pctPago * 100).toFixed(1) + '%', cx, cy + 4);
        ctx.fillStyle = cores.textSecundario;
        ctx.font = '12.5px sans-serif';
        ctx.fillText('do contrato quitado', cx, cy + 26);
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
            successLight: '#6ee7b7',
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
        successLight: '#10b981',
        successDark: '#036f50',
        danger: '#b91c1c',
        dangerDark: '#991b1b',
        texto: '#1f2937',
        textSecundario: '#6b7280'
    };
}
