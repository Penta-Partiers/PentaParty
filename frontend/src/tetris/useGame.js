import { useEffect, useState } from 'react';

import { useInterval } from './useInterval';
import { Shape, checkCompleteRows, checkEndGame, generateTetromino } from './tetris';

export function useGame() {
    const [board, setBoard] = useState(null);
    const [score, setScore] = useState(0);
    const [shapeQueue, setShapeQueue] = useState([]);
    const [currentShape, setCurrentShape] = useState(null);
    const [userInput, setUserInput] = useState([]);
    const [gameEnded, setGameEnded] = useState(false);

    // Whenever the board changes, update the score (if possible)
    useEffect(updateScore, [board]);

    function updateScore() {
        setScore(score + checkCompleteRows(board));
    }

    useEffect(endGame, [board]);

    function endGame() {
        if (checkEndGame(board)) {
            setGameEnded(true);
        }
    }

    function updateShape() {
        if (!gameEnded) {
            if (currentShape.lowerShape(board)) {
                setCurrentShape(getNextShape(board, shapeQueue))
            }
        }
    }

    function getNextShape(board, sq) {
        if (sq.length === 0) {
            return generateTetromino(board)
        } else {
            return setShapeQueue(sq.shift())
        }
    }

    function onKeyDown(e) {
        if ((e.key === "a" || e.key === "s" || e.key === "d" || e.key === "j" || e.key === "l") && userInput.indexOf(e.key) === -1) {
            setUserInput(userInput.push(e.key));
        }
    }

    function onKeyUp(e) {
        if (userInput.indexOf(e.key) === -1) {
            return
        }

        // Choose what action to take
        if (e.key === "a") {
            if (currentShape.translateShape(board, -1)) {
                setCurrentShape(getNextShape(board, shapeQueue));
            }
        } else if (e.key === "s") {
            if (currentShape.translateShape(board, 0)) {
                setCurrentShape(getNextShape(board, shapeQueue));
            }
        } else if (e.key === "d") {
            if (currentShape.translateShape(board, 1)) {
                setCurrentShape(getNextShape(board, shapeQueue));
            }
        } else if (e.key === "j") {
            setCurrentShape(currentShape.rotateShape(board, -1));
        } else if (e.key === "l") {
            setCurrentShape(currentShape.rotateShape(board, 1));
        }
        userInput.splice(userInput.indexOf(e.key), 1)
    }

    const startGame = () => {
        setBoard(initializeBoard());
        useInterval(updateShape, 1000);
    }
    

    return [
        startGame,
        board,
        score,
        gameEnded,
        onKeyDown,
        onKeyUp,
    ]
}

function initializeBoard() {
    var board = new Array(25);
    for (let i = 0; i < board.length; i++) {
        board[i] = new Array(13).fill(0);
    }

    return board;
}