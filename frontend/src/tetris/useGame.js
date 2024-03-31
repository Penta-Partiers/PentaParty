// React
import { useEffect, useState, useCallback } from 'react';

// Custom hooks
import { useInterval } from './useInterval';
import { useBoard, checkEndGame } from './useBoard';
import { endPlayerIndividualGame, updateBoard, updateScore } from '../database/models/lobby';

const SCORE_MULTIPLIER = 100;
export const GAME_STATUS_NOT_STARTED = "not started";
export const GAME_STATUS_ONGOING = "ongoing";
export const GAME_STATUS_ENDED = "end";

export function useGame() {
    const [{ board, currentColor }, dispatchBoardState] = useBoard();
    const [gameInProgress, setGameInProgress] = useState(false);
    const [score, setScore] = useState(0);
    const [tickSpeed, setTickSpeed] = useState(null);
    const [userInput, setUserInput] = useState([]);
    const [lobby, setLobby] = useState(null);
    const [playerUuid, setPlayerUuid] = useState("");
    const [gameStatus, setGameStatus] = useState(GAME_STATUS_NOT_STARTED);

    // TODO in the future: custom hook for managing player interactions?
    //  - stuff like adding incomplete rows when another player completes a row
    //  - Or maybe just a useEffect

    const startGame = (lobby, playerUuid) => {
        console.log("game started!"); // Debug
        setScore(0);
        // setGameInProgress(true);
        setGameStatus(GAME_STATUS_ONGOING);
        setTickSpeed(1000);
        dispatchBoardState({ type: 'start' });
        setLobby(lobby);
        setPlayerUuid(playerUuid);
    }

    // Continuously run the game loop (if it's been started)
    useInterval(async () => {
        if (gameStatus == GAME_STATUS_ENDED) {
            // console.log("game is over!") // Debug
            return;
        }
        dispatchBoardState({ type: 'lower' });
        await pushBoardUpdate();
    }, tickSpeed);

    // Continually check the board state to see if the game is over
    useEffect(endGameCheck, [board]);

    function endGameCheck() {
        if (checkEndGame(board)) {
            // setGameInProgress(false);
            setGameStatus(GAME_STATUS_ENDED);
        }
    }

    useEffect(() => {
        async function endGame() {
            if (gameStatus == GAME_STATUS_ENDED) {
                await endPlayerIndividualGame(lobby, playerUuid);
            }
        }
        endGame();
    }, [gameStatus]);

    // Using useCallback() for the event listeners below so that React doesn't
    // add multiple copies of the same event listener

    const keyDownEventListener = useCallback((e) => {
        if ((e.key === "a" || e.key === "s" || e.key === "d" || e.key === "j" || e.key === "l") && userInput.indexOf(e.key) === -1) {
            setUserInput(userInput.push(e.key));
        }
    }, [])

    const keyUpEventListener = useCallback((e) => {
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
            dispatchBoardState({ type: 'rotate', direction: 1 });
        } else if (e.key === "j") {
            dispatchBoardState({ type: 'rotate', direction: -1 });
        }
        setUserInput(userInput.splice(userInput.indexOf(e.key), 1));     
    }, [])

    // Add the event listeners when the game is started, and remove
    // them when the game finishes
    useEffect(() => {
        if (gameStatus == GAME_STATUS_ONGOING) {
            window.addEventListener('keyup', keyUpEventListener);
            window.addEventListener('keydown', keyDownEventListener);
        }
        else {
            window.removeEventListener('keyup', keyUpEventListener);
            window.removeEventListener('keydown', keyDownEventListener);
        }
    }, [gameStatus, keyUpEventListener, keyDownEventListener])

    // Whenever the board changes, update the score (if possible)
    useEffect(() => {updatePlayerScore()}, [board, score, checkCompleteRows]);

    async function updatePlayerScore() {
        if (lobby != null) {
            let newScore = score + checkCompleteRows(board)
            setScore(newScore);
            await updateScore(lobby, playerUuid, newScore);
        }
    }

    function checkCompleteRows(board) {
        var removedRows = []

        // Iterate from top to bottom
        for (let i = 0; i < board.length; i++) {
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

        return removedRows.length * SCORE_MULTIPLIER;
    }

    async function pushBoardUpdate() {
        await updateBoard(lobby, playerUuid, board);
    }

    return { startGame, board, score, currentColor, gameStatus, dispatchBoardState };
}