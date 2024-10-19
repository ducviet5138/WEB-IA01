import { useState } from 'react';

type SquareProps = {
  value: string | null;
  onSquareClick: () => void;
  className?: string;
};

function Square({ value, onSquareClick, className }: SquareProps) {
  return (
    <button className={`square ${className}`} onClick={onSquareClick}>
      {value}
    </button>
  );
}

type BoardProps = {
  xIsNext: boolean;
  squares: (string | null)[];
  onPlay: (nextSquares: (string | null)[], location: [number, number]) => void;
};

function Board({ xIsNext, squares, onPlay }: BoardProps) {
  function handleClick(i: number) {
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    const row = Math.floor(i / 3);
    const col = i % 3;
    onPlay(nextSquares, [row, col]);
  }

  const { winner, line } = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (squares.every(square => square !== null)) {
    status = 'The game is a draw';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  const drawBoard = () => {
    const board = [];
    
    for (let row = 0; row < 3; row++) {
      const squaresInRow = [];
      for (let col = 0; col < 3; col++) {
        const index = row * 3 + col;
        const highlight = line && line.includes(index) ? 'highlight' : '';
        squaresInRow.push(
          <Square key={index} value={squares[index]} onSquareClick={() => handleClick(index)} className={highlight} />
        );
      }
      board.push(
        <div key={row} className="board-row">
          {squaresInRow}
        </div>
      );
    }

    return board;
  }

  return (
    <>
      <div className="status">{status}</div>
      {drawBoard()}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState<{ squares: (string | null)[], location: [number, number] | null }[]>([{ squares: Array(9).fill(null), location: null }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares: (string | null)[], location: [number, number]) {
    const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, location }];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((step, move) => {
    if (move === 0) return null;
    const desc = move ?
      `Go to move #${move} (${step.location?.[0]}, ${step.location?.[1]})` :
      'Go to game start';
    if (move === currentMove) {
      return (
        <li key={move}>
          <span>You are at move #{move} ({step.location?.[0]}, {step.location?.[1]})</span>
        </li>
      );
    } else {
      return (
        <li key={move}>
          <button onClick={() => jumpTo(move)}>{desc}</button>
        </li>
      );
    }
  });

  const sortedMoves = isAscending ? moves : moves.slice().reverse();

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares.squares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <button onClick={() => setIsAscending(!isAscending)}>
          {isAscending ? 'Sort Descending' : 'Sort Ascending'}
        </button>
        <p>History</p>
        <ul>{sortedMoves}</ul>
      </div>
    </div>
  );
}

function calculateWinner(squares: (string | null)[]): { winner: string | null, line: number[] | null } {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return { winner: null, line: null };
}