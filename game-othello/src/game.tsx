import React, { useState } from "react";
import { Board, RowBoardState } from "./board";
import { SquareState } from "./square";


//1盤面の情報。待ったボタンの実装時、手番と盤面を持つ？
type BoardState = {
    squares: RowBoardState
    xIsNext: boolean
    stepNumber: number
}

type GameState = {
    white: number
    black: number
}

const BOARD_RANGE = [0, 1, 2, 3, 4, 5, 6, 7] as const;
//方向の設定。DIRECTIONKEYを元にDIRECTIONを読み出す。
const DIRECTION = {
    upleft: { x: -1, y: -1 },
    up: { x: -1, y: 0 },
    upright: { x: -1, y: 1 },
    left: { x: 0, y: -1 },
    right: { x: 0, y: 1 },
    downleft: { x: 1, y: -1 },
    down: { x: 1, y: 0 },
    downright: { x: 1, y: 1 }
} as const

type Direction = typeof DIRECTION;
type DirectionKey = keyof Direction;

const DIRECTIONKEY: DirectionKey[] = ['upleft', 'up', 'upright', 'left', 'right', 'downleft', 'down', 'downright']

type LineData = {
    x: number,
    y: number
}

export const Game = () => {

    const [boardState, setBoardstate] = useState<BoardState>({
        squares: [[null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, 'O', 'X', null, null, null],
        [null, null, null, 'X', 'O', null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null]],
        stepNumber: 0,
        xIsNext: true
    })
    const [gameState, setGameState] = useState<GameState>({
        white: 2,
        black: 2
    })
    const currentBoard = boardState;
    const winner = false
    const handleClick = (i: number, j: number) => {
        const directionList = checkCanPut(boardState, i, j);
        const stoneList: LineData[][] = []
        if (directionList.length !== 0) {
            for (const key of directionList) {
                //TODO:要リファクタリング
                const list: LineData[] = chechLine(boardState, i, j, key);
                if (list.length !== 0) {
                    stoneList.push(list);
                }
            }
        }
        const returnStoneList: LineData[][] = [];
        for (let i = 0; i < stoneList.length; i++) {
            const returnStone = checkReturnLine(currentBoard, stoneList[i]);
            if (returnStone.length !== 0) {
                returnStoneList.push(returnStone);
            }
        }

        if (winner || currentBoard.squares[i][j] || returnStoneList.length === 0) {
            return {
                squares: currentBoard.squares[i][j],
                xIsNext: currentBoard.xIsNext,
                stepNumber: currentBoard.stepNumber + 1
            }
        }

        const next: BoardState = (({ squares, xIsNext, stepNumber }) => {
            const nextSquares = squares.slice() as RowBoardState;
            nextSquares[i][j] = xIsNext ? 'X' : 'O';
            for (let i = 0; i < returnStoneList.length; i++) {
                for (let j = 0; j < returnStoneList[i].length; j++) {
                    nextSquares[returnStoneList[i][j].x][returnStoneList[i][j].y] = xIsNext ? 'X' : 'O';
                }
            }
            return {
                squares: nextSquares,
                xIsNext: !xIsNext,
                stepNumber: stepNumber + 1
            }
        })(currentBoard);

        setBoardstate(next)
        setGameState(calculaterBoard(next.squares))
    }
    //メインの画面出力。
    return (
        <div className="game">
            <div className="game-board">
                <Board
                    squares={boardState.squares}
                    onClick={(i: number, j: number) => handleClick(i, j)}
                />
            </div>
            <div className='game-info'>
                <div>{`手番数:${boardState.stepNumber}`}</div>
                <div>{`X:${gameState.black} O:${gameState.white}`}</div>
            </div>
        </div>
    );
};


const calculaterBoard = (squares: RowBoardState) => {
    let value: GameState = {
        white: 0,
        black: 0,
    }
    for (let i = 0; i < BOARD_RANGE.length; i++) {
        for (let j = 0; j < BOARD_RANGE.length; j++) {
            if (squares[i][j] === 'O') {
                value.white++;
            } else if (squares[i][j] === 'X') {
                value.black++;
            }
        }
    }
    return value;
}

//周囲全方向１マスのサーチ->反対属性のマスの有無
const checkCanPut = (currentBoard: BoardState, i: number, j: number) => {
    //渡ってきた石の属性取得
    const putStone = currentBoard.xIsNext ? 'X' : 'O';
    let directionList: DirectionKey[] = [];
    let searchDirection: DirectionKey[] = DIRECTIONKEY;
    let boardEdge: string = "";
    //Board端判定
    if (i === 0) {
        boardEdge += "UP";
    } else if (i === 7) {
        boardEdge += "DOWN";
    }
    if (j === 0) {
        boardEdge += "LEFT";
    } else if (j === 7) {
        boardEdge += "RIGHT";
    }
    const remove: DirectionKey[] = [];
    switch (boardEdge) {
        case "UP": remove.push("up", "upleft", "upright");
            break;
        case "DOWN": remove.push("downleft", "down", "downright");
            break;
        case "RIGHT": remove.push("upright", "right", "downright");
            break;
        case "LEFT": remove.push("upleft", "left", "downleft");
            break;
        case "UPRIGHT": remove.push("up", "upleft", "upright", "right", "downright");
            break;
        case "DOWNRIGHT": remove.push("down", "downleft", "downright", "right", "upright");
            break;
        case "UPLEFT": remove.push("up", "upleft", "upright", "left", "downleft");
            break;
        case "DOWNLEFT": remove.push("down", "downleft", "downright", "left", "upleft");
            break;
    }

    searchDirection = DIRECTIONKEY.filter((n) => { return !remove.includes(n); });
    for (const key of searchDirection) {
        if ((currentBoard.squares[i + (DIRECTION[key].x)][j + (DIRECTION[key].y)]) === 'O' && putStone === 'X') {
            directionList.push(key);
        } else if (currentBoard.squares[i + (DIRECTION[key].x)][j + (DIRECTION[key].y)] === 'X' && putStone === 'O') {
            directionList.push(key);
        }
    }
    return directionList;
}

//指定した場所が置ける場所かどうか
//引数：ボードの盤面、石を置く位置、方向
const chechLine = (currentBoard: BoardState, i: number, j: number, direction: DirectionKey) => {
    let directionX = i + DIRECTION[direction].x;
    let directionY = j + DIRECTION[direction].y;
    const line: LineData[] = [];
    let loop: boolean = true;
    while (loop) {
        line.push({ x: directionX, y: directionY });
        directionX += DIRECTION[direction].x;
        directionY += DIRECTION[direction].y;

        if (directionX === -1) {
            loop = false;
        } else if (directionX === 8) {
            loop = false;
        } else if (directionY === -1) {
            loop = false;
        } else if (directionY === 8) {
            loop = false;
        }

    };
    return line;
}

const checkReturnLine = (currentBoard: BoardState, stoneLine: LineData[]) => {
    for (let i = 0; i < stoneLine.length; i++) {
        let test1: SquareState = currentBoard.squares[stoneLine[i].x][stoneLine[i].y];
        let test2: SquareState = (currentBoard.xIsNext ? 'X' : 'O');
        if (test1 === test2) {
            return stoneLine.slice(0, i);
        }
    }
    return stoneLine = [];
};
