import React, { useState } from 'react';
import { Board, BordState } from "./bord";
import "./index.css";

//ある一場面の情報。手番の情報と盤面を持つ
type Step = {
    squares: BordState
    xIsNext: boolean
}
//ゲーム全体の状況。stepを複数持っている。
type GameState = {
    readonly history: Step[]
    readonly stepNumber: number
}

export const Game = () => {
    const [gameState, setGameState] = useState<GameState>({
        history: [
            {
                squares: [null, null, null, null, null, null, null, null, null],
                xIsNext: true,
            },
        ],
        stepNumber: 0
    })
    const handleClick = (i: number) => {
        if (winner || current.squares[i]) {
            return;
        }

        const next: Step = (({ squares, xIsNext }) => {
            const nextSquares = squares.slice() as BordState;
            nextSquares[i] = xIsNext ? 'X' : 'O';
            return {
                squares: nextSquares,
                xIsNext: !xIsNext,
            }
        })(current)

        setGameState(
            ({ history, stepNumber }) => {
                const newHistory = history.slice(0, stepNumber + 1).concat(next)
                return {
                    history: newHistory,
                    stepNumber: newHistory.length - 1,
                }
            }
        )
    }
    const jumpTo = (move: number) => {
        setGameState(previous => ({
            ...previous,
            stepNumber: move,
        }));
    }

    //現在の盤面情報
    const current = gameState.history[gameState.stepNumber]
    const winner = calculateWinner(current.squares)
    const moves = gameState.history.map((step, move) => {
        const desc = move ? `go to move # ${move}` : `go to game start`;
        return (
            <li key={move}>
                <button onClick={() => jumpTo(move)}>{desc}</button>
            </li>
        );
    });
    let status: string;
    if (winner) {
        status = `Winner:${winner}`;
    } else {
        status = `Next Player:${current.xIsNext ? "X" : "O"}`;
    }

    return (
        <div className='game'>
            <div className='game-board'>
                <Board
                    squares={current.squares}
                    onClick={(i: number) => handleClick(i)} />
            </div>
            <div className='game-info'>
                <div>{status}</div>
                <div>{moves}</div>
            </div>
        </div>
    );

};

const calculateWinner = (squares: BordState) => {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[b] === squares[c]) {
            return squares[a];
        }
    }
    return null;
};

