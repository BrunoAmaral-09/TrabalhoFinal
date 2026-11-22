function getActiveProfile() {
    const savedPlayer = localStorage.getItem("nexusPlayer");
    const activeSession = sessionStorage.getItem("nexusSession");

    if (!savedPlayer) {
        return null;
    }

    try {
        const player = JSON.parse(savedPlayer);
        return player && activeSession === player.nickname ? player : null;
    } catch (error) {
        localStorage.removeItem("nexusPlayer");
        return null;
    }
}

const profileMenu = document.querySelector("#profile-menu");

if (profileMenu) {
    const profileButton = document.querySelector("#profile-button");
    const profileDropdown = document.querySelector("#profile-dropdown");
    const profileName = document.querySelector("#profile-name");
    const profileNickname = document.querySelector("#profile-nickname");
    const profileInitial = document.querySelector("#profile-initial");
    const profileAction = document.querySelector("#profile-action");
    const activePlayer = getActiveProfile();

    if (activePlayer) {
        profileInitial.textContent = activePlayer.name.trim().charAt(0).toLocaleUpperCase("pt-BR") || "N";
        profileName.textContent = activePlayer.name;
        profileNickname.textContent = `@${activePlayer.nickname}`;
        profileAction.textContent = "Sair";
    } else {
        profileInitial.textContent = "?";
        profileAction.textContent = "Entrar";
    }

    profileButton.addEventListener("click", () => {
        const willOpen = profileDropdown.hidden;
        profileDropdown.hidden = !willOpen;
        profileButton.setAttribute("aria-expanded", String(willOpen));
    });

    profileAction.addEventListener("click", () => {
        if (activePlayer) {
            sessionStorage.removeItem("nexusSession");
            sessionStorage.removeItem("nexusNextGame");
            window.location.href = "index.html";
        } else {
            window.location.href = "cadastro.html";
        }
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest("#profile-menu")) {
            profileDropdown.hidden = true;
            profileButton.setAttribute("aria-expanded", "false");
        }
    });
}
