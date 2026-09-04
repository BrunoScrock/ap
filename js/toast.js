/* ==========================================
   TOAST - Sistema de notificações
   ========================================== */

const Toast = {
    container: null,

    inicializar() {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    },

    /**
     * Ícones SVG por tipo
     */
    icone(tipo) {
        if (tipo === 'success') {
            return `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
        }
        if (tipo === 'error') {
            return `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
        }
        if (tipo === 'warning') {
            return `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
        }
        return `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#1a3a5f" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    },

    /**
     * Exibe uma notificação toast
     * @param {string} mensagem - Texto da mensagem
     * @param {string} tipo - 'success' | 'error' | 'warning' | 'info'
     * @param {number} duracao - Milissegundos até fechar (0 = não fecha)
     */
    mostrar(mensagem, tipo = 'info', duracao = 3500) {
        this.inicializar();

        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.innerHTML = `
            ${this.icone(tipo)}
            <div class="toast-message">${mensagem}</div>
            <button class="toast-close" aria-label="Fechar">&times;</button>
        `;

        this.container.appendChild(toast);

        // Animação de entrada
        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('show'));
        });

        // Fechar manualmente
        const fechar = () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        };
        toast.querySelector('.toast-close').addEventListener('click', fechar);

        // Fechar automaticamente
        if (duracao > 0) {
            setTimeout(fechar, duracao);
        }
    },

    success(mensagem, duracao) { this.mostrar(mensagem, 'success', duracao); },
    error(mensagem, duracao) { this.mostrar(mensagem, 'error', duracao); },
    warning(mensagem, duracao) { this.mostrar(mensagem, 'warning', duracao); },
    info(mensagem, duracao) { this.mostrar(mensagem, 'info', duracao); }
};
