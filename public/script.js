document.addEventListener("DOMContentLoaded", () => {
    const socket = io();

    const loginContainer = document.getElementById("login");
    const gameContainer = document.getElementById("game-container");
    const playerNameInput = document.getElementById("player-name");
    const joinButton = document.getElementById("join-button");
    const gameBoard = document.getElementById("game-board");
    const playerHand = document.getElementById("player-hand");
    const currentPlayerName = document.getElementById("current-player-name");

    let playerId = null;

    joinButton.addEventListener("click", () => {
        const playerName = playerNameInput.value;
        if (playerName) {
            socket.emit("joinGame", playerName);
            loginContainer.style.display = "none";
            gameContainer.style.display = "block";
        }
    });

    socket.on("updateGameState", (gameState) => {
        updateGameBoard(gameState.board);
        updatePlayerHand(gameState.players[playerId]?.hand || []);
        currentPlayerName.textContent = gameState.players[gameState.currentPlayer]?.name || '';
    });

    socket.on("connect", () => {
        playerId = socket.id;
    });

    function createDomino([a, b]) {
        const domino = document.createElement("div");
        domino.classList.add("domino");

        const half1 = document.createElement("div");
        const half2 = document.createElement("div");

        half1.classList.add("half");
        half2.classList.add("half");

        for (let i = 0; i < a; i++) {
            const dot = document.createElement("div");
            dot.classList.add("dot");
            half1.appendChild(dot);
        }

        for (let i = 0; i < b; i++) {
            const dot = document.createElement("div");
            dot.classList.add("dot");
            half2.appendChild(dot);
        }

        domino.appendChild(half1);
        domino.appendChild(half2);

        domino.dataset.values = `${a},${b}`;
        domino.addEventListener("click", () => {
            moveDominoToBoard(domino);
        });

        return domino;
    }

    function updateGameBoard(board) {
        gameBoard.innerHTML = "";
        board.forEach(domino => {
            gameBoard.appendChild(createDomino(domino));
        });
    }

    function updatePlayerHand(hand) {
        playerHand.innerHTML = "";
        hand.forEach(domino => {
            playerHand.appendChild(createDomino(domino));
        });
    }

    function moveDominoToBoard(domino) {
        const values = domino.dataset.values.split(',').map(Number);
        socket.emit("moveDomino", values);
    }
});
