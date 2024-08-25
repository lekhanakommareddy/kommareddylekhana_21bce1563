const express = require('express');
const WebSocket = require('ws');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// Game state
let gameState = {
  board: Array(5).fill(null).map(() => Array(5).fill(null)),
  players: [],
  currentTurn: 0
};

// Initialize game with two players
function initializeGame() {
  gameState.players = [
    { id: 1, pieces: ['P1', 'P2', 'H1', 'H2', 'P3'] },
    { id: 2, pieces: ['P1', 'P2', 'H1', 'H2', 'P3'] }
  ];
  // Place pieces on the board (initial positions)
  gameState.board[0] = gameState.players[0].pieces.map((p, index) => ({ piece: p, player: 1 }));
  gameState.board[4] = gameState.players[1].pieces.map((p, index) => ({ piece: p, player: 2 }));
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.send(JSON.stringify({ type: 'INIT', state: gameState }));

  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    handleMove(ws, msg);
  });
});

function handleMove(ws, msg) {
  const { player, move } = msg;

  // Validate move (simplified for example)
  if (player !== gameState.currentTurn + 1) {
    ws.send(JSON.stringify({ type: 'INVALID_MOVE', reason: 'Not your turn' }));
    return;
  }

  // Process move (simplified for example)
  const [from, to] = move.split('-');
  const [fromRow, fromCol] = from.split('').map(Number);
  const [toRow, toCol] = to.split('').map(Number);

  const piece = gameState.board[fromRow][fromCol];
  gameState.board[fromRow][fromCol] = null;
  gameState.board[toRow][toCol] = piece;

  // Switch turn
  gameState.currentTurn = 1 - gameState.currentTurn;

  // Broadcast the updated game state to all clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'UPDATE', state: gameState }));
    }
  });
}

initializeGame();

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
