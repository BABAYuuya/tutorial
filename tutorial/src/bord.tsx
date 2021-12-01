import React from "react";
import { SquareState, Square } from "./square";

export type BordState = [SquareState, SquareState, SquareState, SquareState, SquareState, SquareState, SquareState, SquareState, SquareState]

type BordProps = {
    squares: BordState,
    onClick: (i: number) => void
}

export const Board = (props: BordProps) => {
    const renderSquare = (i: number) => (
        <Square value={props.squares[i]} onClick={() => props.onClick(i)} />
    );
    return (
        <div>
            <div className='board-row'>
                {renderSquare(0)}
                {renderSquare(1)}
                {renderSquare(2)}
            </div>
            <div className='board-row'>
                {renderSquare(3)}
                {renderSquare(4)}
                {renderSquare(5)}
            </div>
            <div className='board-row'>
                {renderSquare(6)}
                {renderSquare(7)}
                {renderSquare(8)}
            </div>
        </div>
    );
};

