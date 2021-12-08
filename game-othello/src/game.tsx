import React, { useState } from "react";
import { Board, RowBoardState } from "./board";
import { SquareState } from "./square";

//盤面の石の数を管理する型
type GameState = {
    white: number
    black: number
}
//ゲーム終了に必要なデータの型
type ExitConditions = {
    winner: boolean
    black: number
    white: number
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
const DIRECTION_KEY: DirectionKey[] = (Object.keys(DIRECTION)) as DirectionKey[];

type LineData = {
    x: number,
    y: number
};

export const Game = () => {
    //初期盤面のstate
    const initBoardState: RowBoardState = (
        [[null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, 'O', 'X', null, null, null],
        [null, null, null, 'X', 'O', null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null]]
    );
    const initGameState: GameState = {
        black: 2,
        white: 2
    };
    //盤面情報を管理するhooks
    const [boardState, setBoardstate] = useState<RowBoardState>(initBoardState);
    const [gameState, setGameState] = useState<GameState>({
        white: 2,
        black: 2
    });
    const [stepNumber, setStepNumber] = useState<number>(1);
    const [xIsNext, setXIsNext] = useState<boolean>(true);
    const [passState, setPassState] = useState<boolean>(false);
    const [winnerState, setWinnerState] = useState<boolean>(false);

    //ゲームリセット処理
    const initBoard = () => {
        setBoardstate(initBoardState);
        setGameState(initGameState);
        setWinnerState(false);
        setPassState(false);
        setXIsNext(true);
    };
    //手番パス処理
    const passAcion = () => {
        if (passState) {
            setWinnerState(true);
        };

        setBoardstate(boardState);
        setStepNumber(stepNumber + 1);
        setPassState(true);
        setXIsNext(!xIsNext);
    };
    //セルが押された際の処理
    const handleClick = (i: number, j: number) => {
        const directionList = checkCanPut(boardState, i, j, xIsNext);
        const stoneList: LineData[][] = [];

        if (directionList.length !== 0) {
            for (const key of directionList) {
                //TODO:要リファクタリング
                const list: LineData[] = checkLine(boardState, i, j, key);
                if (list.length !== 0) {
                    stoneList.push(list);
                };
            };
        };

        const returnStoneList: LineData[][] = [];
        for (let i = 0; i < stoneList.length; i++) {
            const returnStone = checkReturnLine(boardState, stoneList[i], xIsNext);
            if (returnStone.length !== 0) {
                returnStoneList.push(returnStone);
            };
        };

        if (winnerState || boardState[i][j] || returnStoneList.length === 0) {
            return;
        };
        //盤面に石の配置、反転等を反映する。
        const next: RowBoardState = (( squares:RowBoardState ) => {
            const nextSquares = squares.slice() as RowBoardState;
            nextSquares[i][j] = xIsNext ? 'X' : 'O';
            for (let i = 0; i < returnStoneList.length; i++) {
                for (let j = 0; j < returnStoneList[i].length; j++) {
                    nextSquares[returnStoneList[i][j].x][returnStoneList[i][j].y] = xIsNext ? 'X' : 'O';
                };
            };
            return nextSquares;
        })(boardState);
        //盤面にある石の数を計算する。
        const stoneValue: GameState = calculaterBoard(next);
        //終了条件
        if ((stoneValue.black + stoneValue.white) === 64) {
            setWinnerState(true);
        };
        setStepNumber(stepNumber + 1);
        setXIsNext(!xIsNext);
        setBoardstate(next);
        setGameState(stoneValue);
    };
    return (
        <div className="game">
            <div className="game-board">
                <Board
                    squares={boardState}
                    onClick={(i: number, j: number) => handleClick(i, j)}
                />
            </div>
            <div className='game-info'>
                <div>{`手番数:${stepNumber}`}</div>
                <div>{`X:${gameState.black} O:${gameState.white}`}</div>
                <button onClick={() => initBoard()}>{"ボードリセット"}</button>
                <button onClick={() => passAcion()}>{"PASS"}</button>
                <FinishGame
                    winner={winnerState}
                    black={gameState.black}
                    white={gameState.white}
                />
            </div>
        </div>
    );
};

//ゲーム終了の画面表示
const FinishGame = (props: ExitConditions) => {
    if (props.winner) {
        let result: string = "";
        if (props.black === props.white) {
            result = "引き分け";
        } else if (props.black > props.white) {
            result = 'Xの勝ち';
        } else {
            result = 'Oの勝ち'
        };

        return (
            <div>{`ゲームは終了しました。結果は${result}です！`}</div>
        );
    } else {
        return null;
    };
};
//board上のO及びXの数を出力
const calculaterBoard = (squares: RowBoardState) => {
    let value: GameState = {
        white: 0,
        black: 0,
    };

    for (let i = 0; i < BOARD_RANGE.length; i++) {
        for (let j = 0; j < BOARD_RANGE.length; j++) {
            if (squares[i][j] === 'O') {
                value.white++;
            } else if (squares[i][j] === 'X') {
                value.black++;
            };
        };
    };
    return value;
};

//周囲全方向１マスを調べ、反対属性の石が置かれたDIRECTIONKEYを返す。
const checkCanPut = (currentBoard: RowBoardState, i: number, j: number, xIsNext: boolean) => {
    //渡ってきた石の属性取得
    const putStone = xIsNext ? 'X' : 'O';
    let directionList: DirectionKey[] = [];
    let searchDirection: DirectionKey[] = DIRECTION_KEY;
    let boardEdge: string = "";
    //Board端判定
    if (i === 0) {
        boardEdge += "UP";
    } else if (i === 7) {
        boardEdge += "DOWN";
    };
    if (j === 0) {
        boardEdge += "LEFT";
    } else if (j === 7) {
        boardEdge += "RIGHT";
    };

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
    };

    searchDirection = DIRECTION_KEY.filter((n) => { return !remove.includes(n); });
    for (const key of searchDirection) {
        if ((currentBoard[i + (DIRECTION[key].x)][j + (DIRECTION[key].y)]) === 'O' && putStone === 'X') {
            directionList.push(key);
        } else if (currentBoard[i + (DIRECTION[key].x)][j + (DIRECTION[key].y)] === 'X' && putStone === 'O') {
            directionList.push(key);
        }
    }
    return directionList;
};

//指定した場所が置ける場所かどうか
//引数：ボードの盤面、石を置く位置、方向
const checkLine = (currentBoard: RowBoardState, i: number, j: number, direction: DirectionKey) => {
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
};

//石を反転できるかを調べる処理。
const checkReturnLine = (currentBoard: RowBoardState, stoneLine: LineData[], xIsNext: boolean) => {
    for (let i = 0; i < stoneLine.length; i++) {
        let stoneList: SquareState = currentBoard[stoneLine[i].x][stoneLine[i].y];
        let putStone: SquareState = (xIsNext ? 'X' : 'O');
        if (stoneList === putStone) {
            return stoneLine.slice(0, i);
        }
    }
    return stoneLine = [];
};
