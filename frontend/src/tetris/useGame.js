// React
import { useEffect, useState } from 'react';

// Custom hooks
import { useInterval } from './useInterval';
import { useBoard } from './useBoard';

export function useGame() {
    const [{ board, currentColor }, dispatchBoardState] = useBoard();
    const [gameInProgress, setGameInProgress] = useState(false);
    const [score, setScore] = useState(0);
    const [tickSpeed, setTickSpeed] = useState(null);
    const [userInput, setUserInput] = useState([]);

    // TODO in the future: custom hook for managing player interactions?
    //  - stuff like adding incomplete rows when another player completes a row
    //  - Or maybe just a useEffect

    const startGame = () => {
        console.log("game started!"); // Debug
        setScore(0);
        setGameInProgress(true);
        setTickSpeed(1000);
        dispatchBoardState({ type: 'start' });
        window.addEventListener('keyup', keyUpEventListener);
        window.addEventListener('keydown', keyDownEventListener);
    }

    // Continuously run the game loop (if it's been started)
    useInterval(() => {
        if (!gameInProgress) {
            return;
        }
        dispatchBoardState({ type: 'lower' });
    }, tickSpeed);

    // Continually check the board state to see if the game is over
    useEffect(endGameCheck, [board]);

    function endGameCheck() {
        if (checkEndGame(board)) {
            setGameInProgress(false);
            window.removeEventListener('keyup', keyUpEventListener);
            window.removeEventListener('keydown', keyDownEventListener);
        }
    }

    function checkEndGame(board) {
        // Check all of the spaces in the top three rows (to allow room for shapes to spawn)
        for (let j = 0; j < board[0].length; j++) {
            if (board[0][j] === 1 || board[1][j] === 1 || board[2][j] === 1) {
                return true
            }
        }
        return false
    }

    // Whenever the board changes, update the score (if possible)
    useEffect(updateScore, [board]);

    function updateScore() {
        setScore(score + checkCompleteRows(board));
    }

    function checkCompleteRows(board) {
        var removedRows = []

        // Iterate from top to bottom
        for (let i = board.length - 1; i >= 0; i--) {
            for (let j = 0; j < board[i].length; j++) {
                // If a row is incomplete, we check the next row
                if (board[i][j] !== 1) {
                    break
                }

                // If the entire row is filled with 1s, we have a complete row
                if (j === board[i].length - 1) {
                    removedRows.unshift(i)
                    dispatchBoardState({ type: 'removeRow', row: i })
                }
            }
        }

        if (removedRows.length > 0) {
            dispatchBoardState({ type: 'lowerRows', rows: removedRows });
        }

        return removedRows.length * 100;
    }

    function keyDownEventListener(e) {
        if ((e.key === "a" || e.key === "s" || e.key === "d" || e.key === "j" || e.key === "l") && userInput.indexOf(e.key) === -1) {
            setUserInput(userInput.push(e.key));
        }
    }

    function keyUpEventListener(e) {
        if (userInput.indexOf(e.key) === -1) {
            return
        }

        // Choose what action to take
        if (e.key === "a") {
            dispatchBoardState({ type: 'translate', direction: -1 });
        } else if (e.key === "s") {
            dispatchBoardState({ type: 'translate', direction: 0 });
        } else if (e.key === "d") {
            dispatchBoardState({ type: 'translate', direction: 1 });
        } else if (e.key === "l") {
            dispatchBoardState({ type: 'rotate', direction: -1 });
        } else if (e.key === "j") {
            dispatchBoardState({ type: 'rotate', direction: 1 });
        }
        setUserInput(userInput.splice(userInput.indexOf(e.key), 1));
    }

    return { startGame, board, score, currentColor };
}