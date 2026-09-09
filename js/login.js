/* ==========================================
   AUTENTICACAO - Login com conta Google (Supabase Auth)
   Restringe o acesso da interface aos e-mails
   permitidos em AUTH_CONFIG.emailsPermitidos.
   A nuvem (Supabase) tambem bloqueia no servidor
   via Row Level Security (supabase.sql).
   ========================================== */

const Auth = {
    usuario: '',
    config: AUTH_CONFIG,

    estaAutenticado() {
        return !!this.usuario;
    },

    async iniciar() {
        await Storage.preparar();
        this.configurarBotaoGoogle();
        this.configurarBotaoSair();

        if (!window.supabase || !Storage._supabase) {
            this.mostrarErro('Servico de login ainda nao configurado.');
            this.aplicarModo(false);
            return;
        }

        try {
            const { data: { user } } = await Storage._supabase.auth.getUser();
            if (user && user.email) {
                const email = String(user.email).toLowerCase().trim();
                if (this.emailPermitido(email)) {
                    this.usuario = email;
                    Storage._logado = true;
                    this.aplicarModo(true);
                    this.verificarMigracao();
                } else {
                    this.mostrarErro('Acesso negado. Seu e-mail nao esta autorizado para este sistema.');
                    this.aplicarModo(false);
                    try {
                        await Storage._supabase.auth.signOut();
                    } catch (e) {}
                }
            } else {
                this.aplicarModo(false);
            }
        } catch (erro) {
            this.aplicarModo(false);
        }
    },

    emailPermitido(email) {
        return this.config.emailsPermitidos.some(e => String(e).toLowerCase().trim() === email);
    },

    aplicarModo(autenticado) {
        const gate = document.getElementById('authGate');
        if (gate) gate.hidden = autenticado;
        const btnSair = document.getElementById('btnSair');
        if (btnSair) btnSair.hidden = !autenticado;
    },

    configurarBotaoGoogle() {
        const btn = document.getElementById('btnEntrarGoogle');
        if (!btn) return;
        btn.addEventListener('click', () => this.entrarGoogle());
    },

    configurarBotaoSair() {
        const btn = document.getElementById('btnSair');
        if (btn) {
            btn.addEventListener('click', () => this.sair());
        } else {
            const header = document.querySelector('.header-actions');
            if (header) {
                const novo = document.createElement('button');
                novo.id = 'btnSair';
                novo.className = 'btn-sair';
                novo.title = 'Sair da conta';
                novo.textContent = 'Sair';
                novo.hidden = true;
                novo.addEventListener('click', () => this.sair());
                header.appendChild(novo);
            }
        }
    },

    async entrarGoogle() {
        this.mostrarErro('');
        if (!Storage._supabase) {
            this.mostrarErro('Servico de login ainda nao configurado.');
            return;
        }
        try {
            const { error } = await Storage._supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: location.origin + location.pathname }
            });
            if (error) this.mostrarErro('Erro ao entrar com Google: ' + error.message);
        } catch (erro) {
            this.mostrarErro('Erro ao entrar com Google.');
        }
    },

    async sair() {
        try {
            if (Storage._supabase) {
                await Storage._supabase.auth.signOut();
            }
        } catch (e) {}
        Storage._logado = false;
        this.usuario = '';
        location.reload();
    },

    mostrarErro(msg) {
        const el = document.getElementById('authErro');
        if (!el) return;
        el.textContent = msg;
        el.hidden = !msg;
    },

    /**
     * Se a nuvem esta vazia mas ha dados locais, oferece enviar
     */
    async verificarMigracao() {
        const div = document.getElementById('migracaoBanner');
        if (!div) return;
        if (!Storage.haDadosParaMigrar()) return;

        div.hidden = false;
        const btn = document.getElementById('btnMigrarDados');
        if (btn) {
            btn.addEventListener('click', async () => {
                btn.disabled = true;
                btn.textContent = 'Enviando...';
                const total = await Storage.enviarDadosLocaisParaNuvem();
                if (total > 0 && window.Toast) {
                    Toast.success('Dados enviados para a nuvem com sucesso!');
                } else if (window.Toast) {
                    Toast.error('Nada foi enviado.');
                }
                div.hidden = true;
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Auth.iniciar());