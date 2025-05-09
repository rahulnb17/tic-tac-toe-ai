 
function getAvailableMoves(board) {
    const moves = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') moves.push(i);
    }
    return moves;
  }
  
  function checkWinner(board) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }
  
  function evaluate(board) {
    const winner = checkWinner(board);
    if (winner === 'X') return -1;
    if (winner === 'O') return 1;
    return 0;
  }
  
  function isTerminal(board) {
    return getAvailableMoves(board).length === 0 || checkWinner(board) !== null;
  }
  
  function alphaBetaPruning(board, depth, alpha, beta, isMaximizing) {
    if (isTerminal(board) || depth === 0) {
      return evaluate(board);
    }
  
    const moves = getAvailableMoves(board);
  
    if (isMaximizing) {
      let maxEval = -Infinity;
      let bestMove = null;
      for (let move of moves) {
        board[move] = 'O';
        let eval = alphaBetaPruning(board, depth - 1, alpha, beta, false);
        board[move] = '';
        if (eval > maxEval) {
          maxEval = eval;
          bestMove = move;
        }
        alpha = Math.max(alpha, eval);
        if (beta <= alpha) break;
      }
      return bestMove;
    } else {
      let minEval = Infinity;
      for (let move of moves) {
        board[move] = 'X';
        let eval = alphaBetaPruning(board, depth - 1, alpha, beta, true);
        board[move] = '';
        minEval = Math.min(minEval, eval);
        beta = Math.min(beta, eval);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }
  
  module.exports = { alphaBetaPruning };
