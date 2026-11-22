const savedPlayer = localStorage.getItem("nexusPlayer");
const activeSession = sessionStorage.getItem("nexusSession");
let player = null;

if (savedPlayer) {
    try {
        player = JSON.parse(savedPlayer);
    } catch (error) {
        localStorage.removeItem("nexusPlayer");
    }
}

if (!player || !player.name || !player.nickname || activeSession !== player.nickname) {
    window.location.replace("cadastro.html");
} else {
    startTicTacToe(player);
}

function startTicTacToe(registeredPlayer) {
    const cells = [...document.querySelectorAll("[data-cell]")];
    const status = document.querySelector("#game-status");
    const scoreXElement = document.querySelector("#score-x");
    const scoreOElement = document.querySelector("#score-o");
    const scoreDrawElement = document.querySelector("#score-draw");
    const welcome = document.querySelector(".player-welcome");
    const newRoundButton = document.querySelector("#new-round-button");
    const resetScoreButton = document.querySelector("#reset-score-button");
    const scoreKey = `nexusTicTacToeScore-${registeredPlayer.nickname}`;

    let board = Array(9).fill("");
    let currentPlayer = "X";
    let gameFinished = false;
    let scores = { X: 0, O: 0, draw: 0 };

    try {
        const savedScores = JSON.parse(localStorage.getItem(scoreKey));
        if (savedScores) {
            scores = {
                X: Number(savedScores.X) || 0,
                O: Number(savedScores.O) || 0,
                draw: Number(savedScores.draw) || 0,
            };
        }
    } catch (error) {
        localStorage.removeItem(scoreKey);
    }

    welcome.textContent = `Boa sorte, ${registeredPlayer.nickname}!`;
    updateScores();

    function updateScores() {
        scoreXElement.textContent = String(scores.X);
        scoreOElement.textContent = String(scores.O);
        scoreDrawElement.textContent = String(scores.draw);
    }

    function saveScores() {
        localStorage.setItem(scoreKey, JSON.stringify(scores));
    }

    function winningLine() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6],
        ];
        return lines.find(([a, b, c]) =>
            board[a] && board[a] === board[b] && board[a] === board[c]);
    }

    function playCell(cell, index) {
        if (gameFinished || board[index]) {
            return;
        }

        board[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer === "X" ? "cell-x" : "cell-o");
        cell.setAttribute("aria-label", `Casa ${index + 1}: jogador ${currentPlayer}`);

        const winnerLine = winningLine();
        if (winnerLine) {
            gameFinished = true;
            scores[currentPlayer] += 1;
            winnerLine.forEach((winningIndex) => cells[winningIndex].classList.add("winning-cell"));
            status.textContent = `Jogador ${currentPlayer} venceu!`;
            saveScores();
            updateScores();
            return;
        }

        if (board.every(Boolean)) {
            gameFinished = true;
            scores.draw += 1;
            status.textContent = "Empate!";
            saveScores();
            updateScores();
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        status.textContent = `Vez do jogador ${currentPlayer}`;
    }

    function newRound() {
        board = Array(9).fill("");
        currentPlayer = "X";
        gameFinished = false;
        status.textContent = "Vez do jogador X";
        cells.forEach((cell, index) => {
            cell.textContent = "";
            cell.className = "";
            cell.setAttribute("aria-label", `Casa ${index + 1}`);
        });
    }

    cells.forEach((cell, index) => {
        cell.addEventListener("click", () => playCell(cell, index));
    });
    newRoundButton.addEventListener("click", newRound);
    resetScoreButton.addEventListener("click", () => {
        scores = { X: 0, O: 0, draw: 0 };
        saveScores();
        updateScores();
        newRound();
    });
}
