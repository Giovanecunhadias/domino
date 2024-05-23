const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

let gameState = {
    board: [],
    players: {},
    currentPlayer: null,
};

io.on('connection', (socket) => {
    console.log('Novo jogador conectado: ' + socket.id);

    socket.on('joinGame', (playerName) => {
        gameState.players[socket.id] = {
            id: socket.id,
            name: playerName,
            hand: [],
        };

        if (Object.keys(gameState.players).length === 2) {
            startGame();
        }

        io.emit('updateGameState', gameState);
    });

    socket.on('moveDomino', (domino) => {
        if (socket.id === gameState.currentPlayer) {
            gameState.board.push(domino);
            gameState.players[socket.id].hand = gameState.players[socket.id].hand.filter(d => d.toString() !== domino.toString());

            gameState.currentPlayer = Object.keys(gameState.players).find(id => id !== socket.id);

            io.emit('updateGameState', gameState);
        }
    });

    socket.on('disconnect', () => {
        delete gameState.players[socket.id];
        if (Object.keys(gameState.players).length < 2) {
            gameState = {
                board: [],
                players: {},
                currentPlayer: null,
            };
        }
        io.emit('updateGameState', gameState);
        console.log('Jogador desconectado: ' + socket.id);
    });
});

function startGame() {
    const dominoes = [
        [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
        [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
        [2, 2], [2, 3], [2, 4], [2, 5], [2, 6],
        [3, 3], [3, 4], [3, 5], [3, 6],
        [4, 4], [4, 5], [4, 6],
        [5, 5], [5, 6],
        [6, 6]
    ];

    const shuffledDominoes = dominoes.sort(() => 0.5 - Math.random());
    const playerIds = Object.keys(gameState.players);
    gameState.players[playerIds[0]].hand = shuffledDominoes.slice(0, 7);
    gameState.players[playerIds[1]].hand = shuffledDominoes.slice(7, 14);

    gameState.currentPlayer = playerIds[0];
}

app.use(express.static('public'));

server.listen(PORT, () => {
    console.log(`Servidor ouvindo na porta ${PORT}`);
});
