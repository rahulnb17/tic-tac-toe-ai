const socket = new WebSocket('ws://localhost:3000');
const boardEl = document.getElementById('board');
let board = ['', '', '', '', '', '', '', '', ''];

// Check for winner
function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // 'X' or 'O'
    }
  }
  return null;
}

// Render board
function renderBoard() {
  const winner = checkWinner(board);
  boardEl.innerHTML = '';

  if (winner) {
    boardEl.innerHTML = `<h2>${winner} Wins!</h2>`;
    return;
  }

  board.forEach((val, idx) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.textContent = val;

    if (!val) {
      cell.addEventListener('click', () => makeMove(idx));
    }

    boardEl.appendChild(cell);
  });
}

// Handle user move
function makeMove(index) {
  if (board[index] !== '' || checkWinner(board)) return;

  board[index] = 'X';

  // Send move to server
  socket.send(JSON.stringify({
    type: 'move',
    payload: { board: [...board], player: 'X' }
  }));

  renderBoard(); // Re-render after move

  // Let AI play after small delay
  setTimeout(() => {
    socket.send(JSON.stringify({
      type: 'ai-move',
      payload: { board: [...board] }
    }));
  }, 500);
}

// Handle messages from server
socket.onmessage = (e) => {
  const data = JSON.parse(e.data);

  if (data.type === 'move') {
    board = data.payload.board;
  } else if (data.type === 'ai-move') {
    const { move } = data.payload;
    board[move] = 'O';
  }

  renderBoard();
};

renderBoard();
