/* ==========================================
   IMPORTACAO UI - Controle da página de importação
   ========================================== */

let dadosParaImportar = [];
let arquivoCarregado = '';

function iniciarPagina() {
    configurarEventos();
}

function configurarEventos() {
    const btnLimpar = document.getElementById('btnLimparColar');
    const btnPrevColar = document.getElementById('btnPrevisualizarColar');
    const btnPrevArq = document.getElementById('btnPrevisualizarArquivo');
    const btnCancelar = document.getElementById('btnCancelarImportacao');
    const btnConfirmar = document.getElementById('btnConfirmarImportacao');
    const inputArquivo = document.getElementById('importArquivo');

    if (btnLimpar) {
        btnLimpar.addEventListener('click', () => {
            document.getElementById('importTextarea').value = '';
        });
    }

    if (btnPrevColar) {
        btnPrevColar.addEventListener('click', () => {
            const texto = document.getElementById('importTextarea').value;
            const pagamentos = Importacao.parseTabulado(texto);
            mostrarPreview(pagamentos);
        });
    }

    if (btnPrevArq) {
        btnPrevArq.addEventListener('click', () => {
            const arquivo = inputArquivo.files && inputArquivo.files[0];
            if (!arquivo) {
                alert('Selecione um arquivo primeiro.');
                return;
            }
            const leitor = new FileReader();
            leitor.onload = (e) => {
                arquivoCarregado = e.target.result;
                const pagamentos = Importacao.parseArquivoHTML(arquivoCarregado);
                mostrarPreview(pagamentos);
            };
            leitor.onerror = () => alert('Erro ao ler o arquivo.');
            leitor.readAsText(arquivo);
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            limparPreview();
        });
    }

    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', () => {
            if (!dadosParaImportar.length) {
                alert('Nenhum dado para importar.');
                return;
            }
            const importados = Importacao.importar(dadosParaImportar);
            if (importados > 0) {
                alert(`${importados} parcela(s) importada(s) com sucesso!`);
                limparPreview();
                document.getElementById('importTextarea').value = '';
            } else {
                alert('Nenhuma parcela foi importada.');
            }
        });
    }
}

function mostrarPreview(pagamentos) {
    const card = document.getElementById('previewCard');
    const corpo = document.getElementById('corpoPreview');
    const badge = document.getElementById('previewBadge');

    if (!pagamentos.length) {
        alert('Nenhuma parcela reconhecida. Verifique se o formato colado corresponde à tabela.');
        return;
    }

    dadosParaImportar = pagamentos;

    corpo.innerHTML = pagamentos.slice(0, 50).map(p => {
        const statusClass = p.status === 'pago' ? 'status-pago' : 'status-pendente';
        return `
            <tr>
                <td>${p.referencia || ''}</td>
                <td>${Utils.escapeHTML(p.descricao)}</td>
                <td>${Utils.formatarData(p.vencimento)}</td>
                <td class="text-right">${Utils.formatarMoeda(p.valorProjetado)}</td>
                <td class="text-right">${p.status === 'pago' ? Utils.formatarMoeda(p.valorPago) : '—'}</td>
                <td class="text-right">${p.status === 'pago' ? Utils.formatarMoeda(p.inccJuros) : '—'}</td>
                <td><span class="status ${statusClass}">${p.status.toUpperCase()}</span></td>
            </tr>
        `;
    }).join('');

    badge.textContent = `${pagamentos.length} parcela(s) reconhecida(s)`;
    badge.className = 'badge badge-primary';
    card.hidden = false;
}

function limparPreview() {
    dadosParaImportar = [];
    arquivoCarregado = '';
    const card = document.getElementById('previewCard');
    if (card) card.hidden = true;
    const corpo = document.getElementById('corpoPreview');
    if (corpo) corpo.innerHTML = '';
}
