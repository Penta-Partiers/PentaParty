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

/**
 * Custom React hook to handle general game logic
 * 
 * ==> Functional Requirements: FR13, FR14, FR16, FR17, FR19, FR20, FR21, FR26, FR28
 */
export function useGame() {
    const [{ board, currentColor, shapeQueue }, dispatchBoardState] = useBoard();
    const [score, setScore] = useState(0);
    const [tickSpeed, setTickSpeed] = useState(null);
    const [userInput, setUserInput] = useState([]);
    const [lobby, setLobby] = useState(null);
    const [playerUuid, setPlayerUuid] = useState("");
    const [gameStatus, setGameStatus] = useState(GAME_STATUS_NOT_STARTED);
    const [removedRowsCount, setRemovedRowsCount] = useState(0);

    // Start the game for a player
    // ==> Functional Requirement: FR13, FR14
    const startGame = (lobby, playerUuid) => {
        setScore(0);
        setGameStatus(GAME_STATUS_ONGOING);
        setTickSpeed(1000);
        dispatchBoardState({ type: 'start' });
        setLobby(lobby);
        setPlayerUuid(playerUuid);
    }

    // Resume the game for a player if they reconnect after being disconnected
    // ==> Functional Requirement: FR13, FR14
    const resumeGame = (lobby, playerUuid, board, score, status) => {
        setGameStatus(status);
        setTickSpeed(1000);
        setScore(score);
        setLobby(lobby);
        setPlayerUuid(playerUuid);
        if (status == GAME_STATUS_ONGOING) {
            dispatchBoardState({ type: 'resume', board: board });
        }
        else {
            dispatchBoardState({ type: 'ended', board: board });
        }
    }

    // Continuously run the game loop (if it's been started)
    // ==> Functional Requirement: FR14
    useInterval(async () => {
        if (gameStatus == GAME_STATUS_ENDED) {
            return;
        }
        dispatchBoardState({ type: 'lower' });
        await pushBoardUpdate();
    }, tickSpeed);

    // Continually check the board state to see if the game is over
    // ==> Functional Requirement: FR21
    useEffect(endGameCheck, [board]);

    // Function to check the board state to see if the game is over
    // ==> Functional Requirement: FR21
    function endGameCheck() {
        if (board) {
            if (checkEndGame(board)) {
                // setGameInProgress(false);
                setGameStatus(GAME_STATUS_ENDED);
            }
        }
    }

    // If the game has ended for a player, update their status in the database
    // ==> Functional Requirement: FR21
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

    // Handle key down input for translation and rotation
    // ==> Functional Requirements: FR16, FR17
    const keyDownEventListener = useCallback((e) => {
        if ((e.key === "a" || e.key === "s" || e.key === "d" || e.key === "j" || e.key === "l") && userInput.indexOf(e.key) === -1) {
            setUserInput(userInput.push(e.key));
        }
    }, [])

    // Upon key up input, translate / rotate the shape accordingly
    // ==> Functional Requirement: FR16, FR17
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
    // ==> Functional Requirement: FR16, FR17
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
    // ==> Functional Requirement: FR26
    useEffect(() => {updatePlayerScore()}, [board, score, checkCompleteRows, gameStatus]);

    // Update the player's score in the database
    // ==> Functional Requirement: FR26
    async function updatePlayerScore() {
        if (board) {
            if (gameStatus != GAME_STATUS_ENDED) {
                if (lobby != null) {
                    let newScore = score + checkCompleteRows(board)
                    setScore(newScore);
                    await updateScore(lobby, playerUuid, newScore);
                }
            }
        }   
    }

    // If the board has complete rows, remove them and make the remaining
    // incomplete rows drop down
    // ==> Functional Requirement: FR19, FR20
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

        setRemovedRowsCount(removedRows.length);

        return removedRows.length * SCORE_MULTIPLIER;
    }

    // Update the player's board state in the database
    // ==> Functional Requirement: FR28
    async function pushBoardUpdate() {
        await updateBoard(lobby, playerUuid, board);
    }

    return { startGame, resumeGame, board, score, currentColor, gameStatus, dispatchBoardState, removedRowsCount, setRemovedRowsCount, shapeQueue };
}