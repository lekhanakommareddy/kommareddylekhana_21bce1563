const socket = new WebSocket('ws://localhost:3000');
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');

let gameState;

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'INIT' || msg.type === 'UPDATE') {
    gameState = msg.state;
    renderBoard();
    updateStatus();
  } else if (msg.type === 'INVALID_MOVE') {
    alert(msg.reason);
  }
};

function renderBoard() {
  boardElement.innerHTML = '';
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      const piece = gameState.board[row][col];
      if (piece) {
        cell.classList.add(`player${piece.player}`);
        cell.innerText = piece.piece;
      } else {
        cell.classList.add('empty');
      }
      boardElement.appendChild(cell);
    }
  }
}

function updateStatus() {
  const player = gameState.currentTurn + 1;
  statusElement.innerText = `Player ${player}'s turn`;
}

// You can add more interaction logic here, such as allowing players to select and move pieces.
