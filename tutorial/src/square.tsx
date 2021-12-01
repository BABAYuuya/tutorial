import React from "react";

export type SquareState = 'O'|'X'|null

type SquareProps = {
    value: SquareState
    onClick: ()=>void
}

export const Square = (props: SquareProps) =>(
    <button className='square' onClick={props.onClick}>
        {props.value}
    </button>
)
