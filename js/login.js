/* ==========================================
   AUTENTICACAO - Login com conta Google (Supabase Auth)
   Restringe o acesso da interface aos e-mails
   permitidos em AUTH_CONFIG.emailsPermitidos.
   A nuvem (Supabase) tambem bloqueia no servidor
   via Row Level Security (supabase.sql).
   ========================================== */

const Auth = {
    usuario: '',
    nomeUsuario: '',
    fotoUsuario: '',
    config: AUTH_CONFIG,

    estaAutenticado() {
        return !!this.usuario;
    },

    async iniciar() {
        this.configurarBotaoGoogle();
        this.configurarBotaoSair();

        // Mostra o gate imediatamente (evita flash do conteudo antes da checagem)
        this.aplicarModo(false);

        // Inicializa o cliente Supabase e carrega dados (cache + nuvem se logado)
        await Storage.preparar();

        if (!window.supabase || !Storage._supabase) {
            this.mostrarErro('Servico de login ainda nao configurado.');
            return;
        }

        try {
            const { data: { user } } = await Storage._supabase.auth.getUser();
            if (user && user.email) {
                const email = String(user.email).toLowerCase().trim();
                if (this.emailPermitido(email)) {
                    this.usuario = email;
                    this.nomeUsuario = (user.user_metadata && user.user_metadata.name) || '';
                    this.fotoUsuario = (user.user_metadata && user.user_metadata.avatar_url) || '';
                    Storage._logado = true;
                    this.atualizarUsuario();
                    this.aplicarModo(true);
                    this.verificarMigracao();
                } else {
                    this.mostrarErro('Acesso negado. Seu e-mail nao esta autorizado para este sistema.');
                    Storage._logado = false;
                    this.aplicarModo(false);
                    try {
                        await Storage._supabase.auth.signOut();
                    } catch (e) {}
                }
            } else {
                Storage._logado = false;
                this.aplicarModo(false);
            }
        } catch (erro) {
            Storage._logado = false;
            this.aplicarModo(false);
        }
    },

    emailPermitido(email) {
        return this.config.emailsPermitidos.some(e => String(e).toLowerCase().trim() === email);
    },

    aplicarModo(autenticado) {
        const gate = document.getElementById('authGate');
        if (gate) gate.hidden = autenticado;
        const grupo = document.getElementById('usuarioBox');
        if (grupo) {
            grupo.hidden = !autenticado;
        } else {
            const btnSair = document.getElementById('btnSair');
            if (btnSair) btnSair.hidden = !autenticado;
        }
    },

    atualizarUsuario() {
        const grupo = document.getElementById('usuarioBox');
        if (!grupo) return;
        const av = grupo.querySelector('.user-avatar');
        const nomeEl = grupo.querySelector('.user-name');
        if (av) {
            if (this.fotoUsuario) {
                av.innerHTML = '<img src="' + this.fotoUsuario + '" alt="">';
            } else {
                av.textContent = (this.usuario.charAt(0) || '?').toUpperCase();
            }
        }
        if (nomeEl) nomeEl.textContent = this.nomeUsuario || this.usuario;
    },

    configurarBotaoGoogle() {
        const btn = document.getElementById('btnEntrarGoogle');
        if (!btn) return;
        btn.addEventListener('click', () => this.entrarGoogle());
    },

    configurarBotaoSair() {
        const existing = document.getElementById('btnSair');
        if (existing) {
            existing.addEventListener('click', () => this.sair());
            return;
        }

        const header = document.querySelector('.header-actions');
        if (!header) return;

        const grupo = document.createElement('div');
        grupo.className = 'header-usuario';
        grupo.id = 'usuarioBox';
        grupo.hidden = true;

        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'user-chip';
        chip.title = 'Conta logada';

        const avatar = document.createElement('span');
        avatar.className = 'user-avatar';
        const nomeEl = document.createElement('span');
        nomeEl.className = 'user-name';

        chip.appendChild(avatar);
        chip.appendChild(nomeEl);

        const btn = document.createElement('button');
        btn.id = 'btnSair';
        btn.className = 'btn-sair';
        btn.type = 'button';
        btn.title = 'Sair da conta';
        btn.textContent = 'Sair';
        btn.addEventListener('click', () => this.sair());

        grupo.appendChild(chip);
        grupo.appendChild(btn);
        header.appendChild(grupo);
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

// A inicializacao da autenticacao e orquestrada pelo app.js
// (Auth.iniciar() roda nele, ANTES de renderizar a pagina).