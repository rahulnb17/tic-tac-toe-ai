const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { connectDB, getGameCollection } = require('./db');
const { alphaBetaPruning } = require('./alpha-beta');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static('public'));

// Connect to DB
connectDB();

// Helper: Check if there's a winner
function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // 'X' or 'O'
    }
  }
  return null;
}

wss.on('connection', (ws) => {
  console.log('New client connected');

  let opponent = null;

  // Try to find an available opponent
  wss.clients.forEach((client) => {
    if (client !== ws && !client.opponent) {
      opponent = client;
    }
  });

  ws.opponent = opponent;
  if (opponent) opponent.opponent = ws;

  ws.on('message', async (message) => {
    const data = JSON.parse(message);

    try {
      if (data.type === 'move') {
        const { board } = data.payload;

        const winner = checkWinner(board);
        if (winner) {
          console.log(`Game already over. ${winner} won.`);
          return;
        }

        // Forward move to opponent
        if (ws.opponent && ws.opponent.readyState === WebSocket.OPEN) {
          ws.opponent.send(message);
        }

        // Save move to MongoDB
        const moveCollection = getGameCollection();
        await moveCollection.insertOne(data.payload);

      } else if (data.type === 'ai-move') {
        const { board } = data.payload;
        const winner = checkWinner(board);
        if (winner) return;

        const move = alphaBetaPruning([...board], 9, -Infinity, Infinity, true);
        const aiMove = {
          board: [...board],
          move,
          player: 'O',
        };

        board[move] = 'O';

        ws.send(JSON.stringify({ type: 'ai-move', payload: aiMove }));
      }
    } catch (err) {
      console.error("Error handling message:", err);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    if (ws.opponent) {
      ws.opponent.send(JSON.stringify({
        type: 'game',
        payload: { status: 'opponent-left' }
      }));
      ws.opponent.opponent = null;
    }
  });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
