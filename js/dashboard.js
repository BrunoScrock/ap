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

    // Gráficos
    desenharGraficoPagoDevedor(totalPago, saldoDevedor);
    desenharGraficoPagamentosMes(pagamentos);
}

function setTexto(id, texto) {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
}

function desenharGraficoPagoDevedor(pago, devedor) {
    const canvas = document.getElementById('chartPagoDevedor');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const tema = document.documentElement.getAttribute('data-theme') || 'light';
    const cores = getCoresTema(tema);

    const largura = canvas.parentElement.clientWidth || 300;
    canvas.width = largura;
    canvas.height = 250;

    const valores = [pago, devedor];
    const rotulos = ['Total Pago', 'Saldo Devedor'];
    const TOTAL_BARRAS = valores.reduce((a, b) => a + b, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const inicioX = 40;
    const larguraBarra = (canvas.width - inicioX - 20) / valores.length - 20;
    const alturaMax = canvas.height - 60;
    const maxValor = Math.max(...valores, 1);

    // Fundo
    ctx.fillStyle = 'transparent';

    // Barras
    valores.forEach((valor, i) => {
        const x = inicioX + i * (larguraBarra + 20);
        const altura = (valor / maxValor) * (alturaMax - 30);
        const y = canvas.height - 40 - altura;

        // Gradiente da barra
        const grad = ctx.createLinearGradient(0, y, 0, canvas.height - 40);
        grad.addColorStop(0, i === 0 ? cores.success : cores.danger);
        grad.addColorStop(1, i === 0 ? cores.successDark : cores.dangerDark);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, larguraBarra, altura, 6);
        ctx.fill();

        // Rótulo
        ctx.fillStyle = cores.textSecundario;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(rotulos[i], x + larguraBarra / 2, canvas.height - 22);

        // Valor a cima da barra
        ctx.fillStyle = cores.texto;
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(Utils.formatarMoeda(valor), x + larguraBarra / 2, y - 8);
    });

    // Legenda
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = cores.texto;
    ctx.fillText('Distribuição do Investimento', canvas.width / 2, canvas.height - 2);
}

function desenharGraficoPagamentosMes(pagamentos) {
    const canvas = document.getElementById('chartPagamentosMes');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const tema = document.documentElement.getAttribute('data-theme') || 'light';
    const cores = getCoresTema(tema);

    const largura = canvas.parentElement.clientWidth || 300;
    canvas.width = largura;
    canvas.height = 250;

    const porMes = Calculos.pagamentosPorMes(pagamentos);
    const chaves = Object.keys(porMes).sort();

    if (chaves.length === 0) {
        ctx.fillStyle = cores.textSecundario;
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Sem pagamentos registrados', canvas.width / 2, canvas.height / 2);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const inicioX = 40;
    const larguraBarra = (canvas.width - inicioX - 20) / chaves.length - 8;
    const alturaMax = canvas.height - 50;
    const maxValor = Math.max(...Object.values(porMes), 1);

    chaves.forEach((chave, i) => {
        const valor = porMes[chave];
        const [ano, mes] = chave.split('-');
        const x = inicioX + i * (larguraBarra + 8);
        const altura = (valor / maxValor) * (alturaMax - 40);
        const y = canvas.height - 45 - altura;

        ctx.fillStyle = cores.primary;
        ctx.beginPath();
        ctx.roundRect(x, y, larguraBarra, altura, 4);
        ctx.fill();

        // Rótulo do mês
        ctx.fillStyle = cores.textSecundario;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${Utils.nomeMesCurto(parseInt(mes))}/${ano.slice(2)}`, x + larguraBarra / 2, canvas.height - 30);

        // Valor
        ctx.fillStyle = cores.texto;
        ctx.font = '11px sans-serif';
        ctx.fillText(Utils.formatarMoeda(valor), x + larguraBarra / 2, y - 6);
    });
}

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
