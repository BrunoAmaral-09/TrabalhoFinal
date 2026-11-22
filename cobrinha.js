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

if (player && player.name && player.nickname && activeSession === player.nickname) {
    startSnakeGame(player);
} else {
    window.location.replace("cadastro.html");
}

function startSnakeGame(registeredPlayer) {
    const canvas = document.querySelector("#snake-canvas");
    const context = canvas.getContext("2d");
    const scoreElement = document.querySelector("#score");
    const bestScoreElement = document.querySelector("#best-score");
    const overlay = document.querySelector("#game-overlay");
    const overlayTitle = document.querySelector("#overlay-title");
    const overlayMessage = document.querySelector("#overlay-message");
    const startButton = document.querySelector("#start-button");
    const pauseButton = document.querySelector("#pause-button");
    const welcome = document.querySelector(".player-welcome");

    const tileSize = 20;
    const columns = canvas.width / tileSize;
    const rows = canvas.height / tileSize;
    const bestScoreKey = `nexusSnakeBest-${registeredPlayer.nickname}`;
    let bestScore = Number(localStorage.getItem(bestScoreKey)) || 0;
    let snake;
    let food;
    let direction;
    let nextDirection;
    let score;
    let gameTimer = null;
    let isRunning = false;
    let hasStarted = false;

    welcome.textContent = `Boa sorte, ${registeredPlayer.nickname}!`;
    bestScoreElement.textContent = String(bestScore);

    function resetGame() {
        snake = [
            { x: 8, y: 10 },
            { x: 7, y: 10 },
            { x: 6, y: 10 },
        ];
        direction = { x: 1, y: 0 };
        nextDirection = { x: 1, y: 0 };
        score = 0;
        scoreElement.textContent = "0";
        placeFood();
        drawGame();
    }

    function placeFood() {
        do {
            food = {
                x: Math.floor(Math.random() * columns),
                y: Math.floor(Math.random() * rows),
            };
        } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
    }

    function drawGame() {
        context.fillStyle = "#0b0b16";
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.strokeStyle = "rgba(168, 85, 247, 0.08)";
        context.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += tileSize) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, canvas.height);
            context.stroke();
        }
        for (let y = 0; y <= canvas.height; y += tileSize) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(canvas.width, y);
            context.stroke();
        }

        context.fillStyle = "#29e7d2";
        context.shadowColor = "#29e7d2";
        context.shadowBlur = 16;
        context.beginPath();
        context.arc(food.x * tileSize + tileSize / 2, food.y * tileSize + tileSize / 2, 7, 0, Math.PI * 2);
        context.fill();

        snake.forEach((segment, index) => {
            context.fillStyle = index === 0 ? "#d9a6ff" : "#9b51e0";
            context.shadowColor = "#a855f7";
            context.shadowBlur = index === 0 ? 14 : 8;
            context.beginPath();
            context.roundRect(
                segment.x * tileSize + 2,
                segment.y * tileSize + 2,
                tileSize - 4,
                tileSize - 4,
                6,
            );
            context.fill();
        });
        context.shadowBlur = 0;
    }

    function finishGame() {
        stopGame();
        overlayTitle.textContent = "Fim de jogo!";
        overlayMessage.textContent = `Voce fez ${score} ponto${score === 1 ? "" : "s"}. Tente bater seu recorde!`;
        startButton.textContent = "Jogar novamente";
        overlay.hidden = false;
    }

    function stopGame() {
        if (gameTimer !== null) {
            window.clearInterval(gameTimer);
            gameTimer = null;
        }
        isRunning = false;
        pauseButton.disabled = true;
        pauseButton.textContent = "Pausar";
    }

    function tick() {
        direction = nextDirection;
        const head = {
            x: snake[0].x + direction.x,
            y: snake[0].y + direction.y,
        };
        const ateFood = head.x === food.x && head.y === food.y;
        const body = ateFood ? snake : snake.slice(0, -1);
        const hitWall = head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows;
        const hitSnake = body.some((segment) => segment.x === head.x && segment.y === head.y);

        if (hitWall || hitSnake) {
            finishGame();
            return;
        }

        snake.unshift(head);
        if (ateFood) {
            score += 10;
            scoreElement.textContent = String(score);
            if (score > bestScore) {
                bestScore = score;
                bestScoreElement.textContent = String(bestScore);
                localStorage.setItem(bestScoreKey, String(bestScore));
            }
            placeFood();
        } else {
            snake.pop();
        }

        drawGame();
    }

    function startGame() {
        if (gameTimer !== null) {
            window.clearInterval(gameTimer);
        }
        resetGame();
        hasStarted = true;
        overlay.hidden = true;
        isRunning = true;
        pauseButton.disabled = false;
        pauseButton.textContent = "Pausar";
        gameTimer = window.setInterval(tick, 115);
    }

    function changeDirection(name) {
        const directions = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 },
        };
        const requestedDirection = directions[name];
        if (requestedDirection
            && !(requestedDirection.x === -direction.x && requestedDirection.y === -direction.y)) {
            nextDirection = requestedDirection;
        }
    }

    document.addEventListener("keydown", (event) => {
        const keys = {
            ArrowUp: "up",
            w: "up",
            ArrowDown: "down",
            s: "down",
            ArrowLeft: "left",
            a: "left",
            ArrowRight: "right",
            d: "right",
        };
        const requestedDirection = keys[event.key] || keys[event.key.toLowerCase()];
        if (requestedDirection && isRunning) {
            event.preventDefault();
            changeDirection(requestedDirection);
        }
    });

    document.querySelectorAll("[data-direction]").forEach((button) => {
        button.addEventListener("click", () => changeDirection(button.dataset.direction));
    });

    startButton.addEventListener("click", () => {
        if (hasStarted && !isRunning && !pauseButton.disabled) {
            overlay.hidden = true;
            isRunning = true;
            pauseButton.textContent = "Pausar";
            gameTimer = window.setInterval(tick, 115);
        } else {
            startGame();
        }
    });
    document.querySelector("#restart-button").addEventListener("click", startGame);

    pauseButton.addEventListener("click", () => {
        if (isRunning) {
            if (gameTimer !== null) {
                window.clearInterval(gameTimer);
                gameTimer = null;
            }
            isRunning = false;
            overlayTitle.textContent = "Jogo pausado";
            overlayMessage.textContent = "Quando estiver pronto, continue sua partida.";
            startButton.textContent = "Continuar";
            overlay.hidden = false;
            pauseButton.textContent = "Continuar";
        } else if (!pauseButton.disabled) {
            overlay.hidden = true;
            isRunning = true;
            pauseButton.textContent = "Pausar";
            gameTimer = window.setInterval(tick, 115);
        }
    });

    resetGame();
}
