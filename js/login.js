/* ==========================================
   AUTENTICACAO - Login com conta Google
   Restringe o acesso da interface aos e-mails
   permitidos em AUTH_CONFIG.emailsPermitidos.
   ========================================== */

const Auth = {
    config: AUTH_CONFIG,

    estaAutenticado() {
        return !!localStorage.getItem(this.config.chaveSessao);
    },

    iniciar() {
        this.aplicarModo();
        this.inicializarGIS();
    },

    aplicarModo() {
        const gate = document.getElementById('authGate');
        if (gate) gate.hidden = this.estaAutenticado();
        if (this.estaAutenticado()) {
            this.adicionarBotaoSair();
        }
    },

    inicializarGIS() {
        if (window.google && google.accounts && google.accounts.id) {
            this.iniciarGoogle();
        } else {
            window.onGoogleLibraryLoad = () => this.iniciarGoogle();
        }
    },

    iniciarGoogle() {
        google.accounts.id.initialize({
            client_id: this.config.clientId,
            callback: (resposta) => this.handleCredentialResponse(resposta),
            auto_select: false,
            ux_mode: 'popup'
        });
        const area = document.getElementById('gsi-button-area');
        if (area) {
            google.accounts.id.renderButton(area, {
                theme: 'outline',
                size: 'large',
                shape: 'pill',
                text: 'continue_with',
                width: 280
            });
        }
    },

    handleCredentialResponse(resposta) {
        const payload = this.decodificarJWT(resposta ? resposta.credential : '');
        if (!payload || !payload.email) {
            this.mostrarErro('Nao foi possivel validar o login. Tente novamente.');
            return;
        }
        const email = String(payload.email).toLowerCase().trim();
        const permitido = this.config.emailsPermitidos.some(
            e => String(e).toLowerCase().trim() === email
        );
        if (permitido) {
            localStorage.setItem(this.config.chaveSessao, email);
            this.mostrarErro('');
            this.aplicarModo();
            if (window.Toast) Toast.success('Bem-vindo(a), acesso liberado!');
        } else {
            this.mostrarErro('Acesso negado. Seu e-mail nao esta autorizado para este sistema.');
            if (window.google && google.accounts && google.accounts.id) {
                google.accounts.id.cancel();
            }
        }
    },

    decodificarJWT(token) {
        try {
            const parte = String(token).split('.')[1] || '';
            const base64 = parte.replace(/-/g, '+').replace(/_/g, '/');
            const bytes = atob(base64);
            const json = bytes
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('');
            return JSON.parse(decodeURIComponent(json));
        } catch (erro) {
            return null;
        }
    },

    mostrarErro(msg) {
        const el = document.getElementById('authErro');
        if (!el) return;
        el.textContent = msg;
        el.hidden = !msg;
    },

    adicionarBotaoSair() {
        if (document.getElementById('btnSair')) return;
        const header = document.querySelector('.header-actions');
        if (!header) return;
        const btn = document.createElement('button');
        btn.id = 'btnSair';
        btn.className = 'btn-sair';
        btn.title = 'Sair da conta';
        btn.textContent = 'Sair';
        btn.addEventListener('click', () => this.sair());
        header.appendChild(btn);
    },

    sair() {
        localStorage.removeItem(this.config.chaveSessao);
        if (window.google && google.accounts && google.accounts.id) {
            google.accounts.id.disableAutoSelect();
        }
        location.reload();
    }
};

document.addEventListener('DOMContentLoaded', () => Auth.iniciar());