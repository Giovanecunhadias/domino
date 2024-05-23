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

    function createDomino([a, b], orientation) {
        const domino = document.createElement("div");
        domino.classList.add("domino", orientation); // Adicionar orientação à classe
        domino.id = `domino-${a}-${b}`;

        const img = document.createElement("img");
        img.src = `images/${a}-${b}.jpg`;
        img.alt = `${a}-${b}`;

        domino.appendChild(img);

        domino.dataset.values = `${a},${b}`;
        domino.addEventListener("click", () => {
            moveDominoToBoard(domino);
        });

        return domino;
    }

    function updateGameBoard(board) {
        gameBoard.innerHTML = "";
        board.forEach(({ domino, orientation }) => {
            gameBoard.appendChild(createDomino(domino, orientation));
        });
    }

    function updatePlayerHand(hand) {
        playerHand.innerHTML = "";
        hand.forEach(domino => {
            playerHand.appendChild(createDomino(domino, 'vertical')); // As peças na mão do jogador estão sempre na vertical
        });
    }

    function moveDominoToBoard(domino) {
        const values = domino.dataset.values.split(',').map(Number);
        socket.emit("moveDomino", values);
    }
});
