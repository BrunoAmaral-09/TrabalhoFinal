const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const authError = document.querySelector("#auth-error");
const loginTab = document.querySelector("#login-tab");
const registerTab = document.querySelector("#register-tab");
const loginPanel = document.querySelector("#login-panel");
const registerPanel = document.querySelector("#register-panel");
const authTitle = document.querySelector("#auth-title");
const authDescription = document.querySelector("#auth-description");

function showMessage(message) {
    authError.textContent = message;
    authError.hidden = false;
}

function clearMessage() {
    authError.textContent = "";
    authError.hidden = true;
}

function showTab(tab) {
    const showLogin = tab === "login";
    loginTab.classList.toggle("active", showLogin);
    registerTab.classList.toggle("active", !showLogin);
    loginTab.setAttribute("aria-selected", String(showLogin));
    registerTab.setAttribute("aria-selected", String(!showLogin));
    loginPanel.hidden = !showLogin;
    registerPanel.hidden = showLogin;
    authTitle.textContent = showLogin ? "Entre na NEXUS" : "Crie sua conta";
    authDescription.textContent = showLogin
        ? "Entre com sua conta para jogar e salvar seu recorde."
        : "Cadastre seus dados para liberar os jogos da NEXUS.";
    clearMessage();
}

function readAccounts() {
    const savedAccounts = localStorage.getItem("nexusAccounts");
    if (!savedAccounts) {
        return [];
    }

    const accounts = JSON.parse(savedAccounts);
    if (!Array.isArray(accounts)) {
        throw new Error("Os dados das contas estao invalidos.");
    }
    return accounts;
}

function enterGame(player) {
    localStorage.setItem("nexusPlayer", JSON.stringify({
        name: player.name,
        nickname: player.nickname,
    }));
    sessionStorage.setItem("nexusSession", player.nickname);
    const nextGame = sessionStorage.getItem("nexusNextGame");
    window.location.href = nextGame === "velha.html" ? "velha.html" : "cobrinha.html";
}

loginTab.addEventListener("click", () => showTab("login"));
registerTab.addEventListener("click", () => showTab("register"));

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearMessage();

    const nickname = document.querySelector("#login-nickname").value.trim();
    const password = document.querySelector("#login-password").value;

    try {
        const account = readAccounts().find((savedAccount) =>
            savedAccount.nickname.toLocaleLowerCase("pt-BR") === nickname.toLocaleLowerCase("pt-BR")
            && savedAccount.password === password);

        if (account) {
            enterGame(account);
        } else {
            showMessage("Nickname ou senha incorretos. Confira seus dados ou crie um cadastro.");
        }
    } catch (error) {
        showMessage("Nao foi possivel acessar as contas salvas neste navegador.");
    }
});

registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearMessage();

    const player = {
        name: document.querySelector("#player-name").value.trim(),
        nickname: document.querySelector("#player-nickname").value.trim(),
        password: document.querySelector("#register-password").value,
    };

    if (!player.name || !player.nickname || player.password.length < 6) {
        showMessage("Preencha todos os campos e use uma senha com pelo menos 6 caracteres.");
        return;
    }

    try {
        const accounts = readAccounts();
        const nicknameExists = accounts.some((account) =>
            account.nickname.toLocaleLowerCase("pt-BR") === player.nickname.toLocaleLowerCase("pt-BR"));

        if (nicknameExists) {
            showTab("login");
            document.querySelector("#login-nickname").value = player.nickname;
            showMessage("Esse nickname ja tem cadastro. Entre com sua senha.");
            document.querySelector("#login-password").focus();
            return;
        }

        accounts.push(player);
        localStorage.setItem("nexusAccounts", JSON.stringify(accounts));
        enterGame(player);
    } catch (error) {
        showMessage("Nao foi possivel salvar seu cadastro neste navegador. Verifique as configuracoes de armazenamento.");
    }
});
