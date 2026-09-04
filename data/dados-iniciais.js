/* ==========================================
   DADOS INICIAIS
   Dados extraídos da planilha (banco de dados inicial)
   ========================================== */

const DADOS_INICIAIS = {
    configuracoes: {
        valorTotalApartamento: 374322.92,
        dataEntrega: '2029-05-04',
        nomeApartamento: 'Apto 1409 - New Garden',
        nomeEmpreendimento: 'New Garden'
    },

    pagamentos: [
        { id: 1, referencia: 1, descricao: 'Sinal de Negócio', vencimento: '2026-05-18', valorProjetado: 6999.97, valorPago: 6999.97, dataPagamento: '2026-05-18', inccJuros: 0, status: 'pago', categoria: 'sinal' },
        { id: 2, referencia: 2, descricao: 'Mensal 01/35', vencimento: '2026-06-10', valorProjetado: 2066.37, valorPago: 2066.37, dataPagamento: '2026-06-08', inccJuros: 0, status: 'pago', categoria: 'parcela' },
        { id: 3, referencia: 3, descricao: 'Mensal 02/35', vencimento: '2026-07-10', valorProjetado: 2066.37, valorPago: 2066.37, dataPagamento: '2026-07-04', inccJuros: 308.00, status: 'pago', categoria: 'parcela' },
        { id: 4, referencia: 4, descricao: 'Mensal 03/35', vencimento: '2026-08-10', valorProjetado: 2066.37, valorPago: 2066.37, dataPagamento: '2026-08-03', inccJuros: 300.99, status: 'pago', categoria: 'parcela' },
        { id: 5, referencia: 5, descricao: 'Mensal 04/35', vencimento: '2026-09-10', valorProjetado: 2066.37, valorPago: 2066.37, dataPagamento: '2026-09-02', inccJuros: 379.68, status: 'pago', categoria: 'parcela' },
        { id: 6, referencia: 6, descricao: 'Mensal 05/35', vencimento: '2026-10-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 7, referencia: 7, descricao: 'Mensal 06/35', vencimento: '2026-11-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 8, referencia: 8, descricao: 'Mensal 07/35', vencimento: '2026-12-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 9, referencia: 9, descricao: 'Balão Dez/26', vencimento: '2026-12-30', valorProjetado: 5000.00, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'balao' },
        { id: 10, referencia: 10, descricao: 'Mensal 08/35', vencimento: '2027-01-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 11, referencia: 11, descricao: 'Mensal 09/35', vencimento: '2027-02-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 12, referencia: 12, descricao: 'Mensal 10/35', vencimento: '2027-03-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 13, referencia: 13, descricao: 'Mensal 11/35', vencimento: '2027-04-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 14, referencia: 14, descricao: 'Mensal 12/35', vencimento: '2027-05-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 15, referencia: 15, descricao: 'Mensal 13/35', vencimento: '2027-06-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 16, referencia: 16, descricao: 'Mensal 14/35', vencimento: '2027-07-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 17, referencia: 17, descricao: 'Mensal 15/35', vencimento: '2027-08-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 18, referencia: 18, descricao: 'Mensal 16/35', vencimento: '2027-09-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 19, referencia: 19, descricao: 'Mensal 17/35', vencimento: '2027-10-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 20, referencia: 20, descricao: 'Mensal 18/35', vencimento: '2027-11-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 21, referencia: 21, descricao: 'Mensal 19/35', vencimento: '2027-12-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 22, referencia: 22, descricao: 'Balão Dez/27', vencimento: '2027-12-30', valorProjetado: 5000.00, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'balao' },
        { id: 23, referencia: 23, descricao: 'Mensal 20/35', vencimento: '2028-01-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 24, referencia: 24, descricao: 'Mensal 21/35', vencimento: '2028-02-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 25, referencia: 25, descricao: 'Mensal 22/35', vencimento: '2028-03-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 26, referencia: 26, descricao: 'Mensal 23/35', vencimento: '2028-04-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 27, referencia: 27, descricao: 'Mensal 24/35', vencimento: '2028-05-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 28, referencia: 28, descricao: 'Mensal 25/35', vencimento: '2028-06-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 29, referencia: 29, descricao: 'Mensal 26/35', vencimento: '2028-07-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 30, referencia: 30, descricao: 'Mensal 27/35', vencimento: '2028-08-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 31, referencia: 31, descricao: 'Mensal 28/35', vencimento: '2028-09-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 32, referencia: 32, descricao: 'Mensal 29/35', vencimento: '2028-10-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 33, referencia: 33, descricao: 'Mensal 30/35', vencimento: '2028-11-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 34, referencia: 34, descricao: 'Mensal 31/35', vencimento: '2028-12-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 35, referencia: 35, descricao: 'Balão Dez/28', vencimento: '2028-12-30', valorProjetado: 5000.00, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'balao' },
        { id: 36, referencia: 36, descricao: 'Mensal 32/35', vencimento: '2029-01-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 37, referencia: 37, descricao: 'Mensal 33/35', vencimento: '2029-02-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 38, referencia: 38, descricao: 'Mensal 34/35', vencimento: '2029-03-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 39, referencia: 39, descricao: 'Mensal 35/35', vencimento: '2029-04-10', valorProjetado: 2066.37, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'parcela' },
        { id: 40, referencia: 40, descricao: 'Financiamento (Caixa)', vencimento: '2029-05-04', valorProjetado: 280000.00, valorPago: 0, dataPagamento: null, inccJuros: 0, status: 'pendente', categoria: 'financiamento' }
    ],

    economias: [
        { id: 1, valor: 4575.25, data: '2026-05-29', observacao: 'Balão', destino: 'pagamento-balao' }
    ],

    itensCompra: [],

    meses: [
        {
            id: '2026-06',
            nome: 'Junho 2026',
            salario: 5497.25,
            reembolso: 799.80,
            cartoesCredito: [
                {
                    nome: 'Cartão 1',
                    parcelas: [
                        { descricao: 'Apple', valor: 19.90, quantParcelas: 'Fixo' },
                        { descricao: 'Academia', valor: 108.58, quantParcelas: 'Fixo' },
                        { descricao: 'IFood', valor: 101.59, quantParcelas: '' },
                        { descricao: 'Multi', valor: 150.97, quantParcelas: '' },
                        { descricao: 'M. Livre', valor: 64.08, quantParcelas: '' },
                        { descricao: 'Mecanico', valor: 124.47, quantParcelas: '' },
                        { descricao: 'Formatura', valor: 113.33, quantParcelas: '' },
                        { descricao: 'Shopping', valor: 206.65, quantParcelas: '' },
                        { descricao: 'Mecanico', valor: 127.28, quantParcelas: '' },
                        { descricao: 'Shopping', valor: 149.90, quantParcelas: '' },
                        { descricao: 'Carro pai', valor: 420.00, quantParcelas: '' },
                        { descricao: 'M. Livre', valor: 252.52, quantParcelas: '' },
                        { descricao: 'Mecanico', valor: 127.28, quantParcelas: '' }
                    ],
                    totalPagar: 1966.55,
                    reembolso: 799.80
                },
                {
                    nome: 'Cartão 2',
                    parcelas: [
                        { descricao: 'Spotfly', valor: 23.90, quantParcelas: 'Fixo' },
                        { descricao: 'HBO', valor: 44.90, quantParcelas: 'Fixo' },
                        { descricao: 'Porta', valor: 121.54, quantParcelas: '5 de 6' },
                        { descricao: 'Celular', valor: 155.44, quantParcelas: '8 de 10' }
                    ],
                    totalPagar: 345.78,
                    reembolso: 0
                }
            ],
            debitosAutomaticos: [
                { descricao: 'URBS', valor: 110.00 },
                { descricao: 'Internet', valor: 99.99 },
                { descricao: 'Faculdade', valor: 90.73 },
                { descricao: 'Consórcio', valor: 250.00 },
                { descricao: 'Netflix', valor: 59.90 },
                { descricao: 'Spotfly', valor: 23.90 }
            ],
            totalCartaoCredito: 2312.33,
            totalDebitosAutomaticos: 634.52,
            divisaoApartamento: 1781.79,
            sobraMes: 1914.19,
            gastosFixos: 634.52,
            gastosVariaveis: 0,
            gastosPessoaisDisponiveis: 0,
            gastosRealizados: 0
        },
        {
            id: '2026-07',
            nome: 'Julho 2026',
            salario: 2511.51,
            reembolso: 0,
            cartoesCredito: [
                {
                    nome: 'Cartão 1',
                    parcelas: [
                        { descricao: 'Apple', valor: 19.90, quantParcelas: 'Fixo' },
                        { descricao: 'Academia', valor: 108.58, quantParcelas: 'Fixo' },
                        { descricao: 'Cama', valor: 150.97, quantParcelas: '' },
                        { descricao: 'Comida', valor: 129.00, quantParcelas: '' }
                    ],
                    totalPagar: 1208.25,
                    reembolso: 799.8
                },
                {
                    nome: 'Cartão 2',
                    parcelas: [
                        { descricao: 'Spotfly', valor: 23.90, quantParcelas: 'Fixo' },
                        { descricao: 'HBO', valor: 44.90, quantParcelas: 'Fixo' },
                        { descricao: 'Celular', valor: 155.44, quantParcelas: '8 de 10' }
                    ],
                    totalPagar: 345.78,
                    reembolso: 100
                }
            ],
            debitosAutomaticos: [
                { descricao: 'URBS', valor: 150.00 },
                { descricao: 'Internet', valor: 99.99 },
                { descricao: 'Faculdade', valor: 90.73 },
                { descricao: 'Consórcio', valor: 250.00 },
                { descricao: 'Netflix', valor: 59.90 },
                { descricao: 'Spotfly', valor: 23.90 }
            ],
            totalCartaoCredito: 2312.33,
            totalDebitosAutomaticos: 674.52,
            divisaoApartamento: 1817.82,
            sobraMes: 3099.21,
            gastosFixos: 674.52,
            gastosVariaveis: 0,
            gastosPessoaisDisponiveis: 0,
            gastosRealizados: 0
        },
        {
            id: '2026-08',
            nome: 'Agosto 2026',
            salario: 6000.00,
            reembolso: 799.80,
            cartoesCredito: [
                {
                    nome: 'Cartão 1',
                    parcelas: [
                        { descricao: 'Apple', valor: 19.90, quantParcelas: 'Fixo' },
                        { descricao: 'Academia', valor: 108.58, quantParcelas: 'Fixo' },
                        { descricao: 'IFood', valor: 101.59, quantParcelas: '' },
                        { descricao: 'Multi', valor: 150.97, quantParcelas: '' },
                        { descricao: 'M. Livre', valor: 64.08, quantParcelas: '' },
                        { descricao: 'Mecanico', valor: 124.47, quantParcelas: '' },
                        { descricao: 'Formatura', valor: 113.33, quantParcelas: '' },
                        { descricao: 'Shopping', valor: 206.65, quantParcelas: '' },
                        { descricao: 'Mecanico', valor: 127.28, quantParcelas: '' },
                        { descricao: 'Shopping', valor: 149.90, quantParcelas: '' },
                        { descricao: 'M. Livre', valor: 252.52, quantParcelas: '' },
                        { descricao: 'Mecanico', valor: 127.28, quantParcelas: '' }
                    ],
                    totalPagar: 1554.55,
                    reembolso: 799.8
                },
                {
                    nome: 'Cartão 2',
                    parcelas: [
                        { descricao: 'Spotfly', valor: 23.90, quantParcelas: 'Fixo' },
                        { descricao: 'HBO', valor: 44.90, quantParcelas: 'Fixo' },
                        { descricao: 'Porta', valor: 121.54, quantParcelas: '5 de 6' }
                    ],
                    totalPagar: 345.78,
                    reembolso: 0
                }
            ],
            debitosAutomaticos: [
                { descricao: 'URBS', valor: 150.00 },
                { descricao: 'Internet', valor: 99.99 },
                { descricao: 'Credito', valor: 345.78 },
                { descricao: 'Faculdade', valor: 90.73 },
                { descricao: 'Consórcio', valor: 250.00 },
                { descricao: 'Netflix', valor: 59.90 },
                { descricao: 'Spotfly', valor: 23.90 }
            ],
            totalCartaoCredito: 2312.33,
            totalDebitosAutomaticos: 1330.18,
            divisaoApartamento: 1817.82,
            sobraMes: 4917.03,
            gastosFixos: 1330.18,
            gastosVariaveis: 0,
            gastosPessoaisDisponiveis: 0,
            gastosRealizados: 0
        }
    ]
};
