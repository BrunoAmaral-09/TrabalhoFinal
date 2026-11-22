function getActivePlayer() {
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

const activePlayer = getActivePlayer();

document.querySelectorAll("[data-play]").forEach((button) => {
    button.addEventListener("click", () => {
        const game = button.dataset.game || "cobrinha.html";
        if (activePlayer) {
            window.location.href = game;
        } else {
            sessionStorage.setItem("nexusNextGame", game);
            window.location.href = "cadastro.html";
        }
    });
});

document.querySelectorAll(".favorite-button").forEach((button) => {
    button.addEventListener("click", () => {
        const isFavorite = button.getAttribute("aria-pressed") === "true";
        button.setAttribute("aria-pressed", String(!isFavorite));
        button.textContent = isFavorite ? "♡" : "♥";
        button.setAttribute(
            "aria-label",
            `${isFavorite ? "Adicionar" : "Remover"} Cyber Rush ${isFavorite ? "aos" : "dos"} favoritos`,
        );
    });
});
