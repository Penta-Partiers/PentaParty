// React
import { useState, useEffect, useContext } from 'react';

// Material UI
import { Grid, Box, Typography, CircularProgress } from '@mui/material';

// Components
import GameBoard from '../components/GameBoard';

// Custom hooks / game logic
import { GAME_STATUS_ENDED, GAME_STATUS_NOT_STARTED, useGame } from '../tetris/useGame';

// User Context
import { Context } from "../auth/AuthContext";

// Database
import { db } from "../firebase.js";
import { doc, onSnapshot } from "firebase/firestore";
import { Lobby as LobbyDb,
    LOBBY_STATUS_ONGOING, LOBBY_STATUS_END, LOBBY_PLAYER_STATUS_NOT_STARTED, 
    startPlayerIndividualGame, 
    LOBBY_PLAYER_STATUS_END,
    isGameFinished, endGameForLobby, popShapeQueue, 
    PlayerHelper, pushPendingRows, popPendingRows, 
    setPendingShapesSize } from '../database/models/lobby';

// Routing
import { useNavigate } from 'react-router-dom';

// Util
import { compareScores } from '../util/util.js';

/**
 * This component renders the player page, where players will drop and
 * move shapes in their board.
 * 
 * ==> Functional requirements: FR13, FR14, FR21, FR22, FR25, FR26, FR27
 */
export default function PlayerView() {
    const { userDb, lobby, isHost, setLobby } = useContext(Context);
    const navigate = useNavigate();
    const { startGame, 
            resumeGame,
            board, 
            currentColor, 
            gameStatus, 
            dispatchBoardState, 
            removedRowsCount,
            setRemovedRowsCount,
            shapeQueue } = useGame();

    const [playerScores, setPlayerScores] = useState(null);
    const [localShapeQueue, setLocalShapeQueue] = useState([]);
    const [pendingRows, setPendingRows] = useState(0);
    const [playerUuids, setPlayerUuids] = useState(null);

    // Listen to real-time updates from the lobby
    // Reference: https://stackoverflow.com/questions/59944658/which-react-hook-to-use-with-firestore-onsnapshot
    // ==> Functional Requirements: FR13, FR14, FR21, FR22, FR25, FR26, FR27
    useEffect(() => {
        let docRef = doc(db, "lobby", lobby.uuid)

        const unsubscribe = onSnapshot(docRef, async (doc) => {
            if (userDb) {
                let lobbyUpdate = LobbyDb.fromFirestore(doc);

                // Redirect to game summary page upon game end
                // ==> Functional Requirement: FR22
                if (lobbyUpdate == null || lobbyUpdate.status == LOBBY_STATUS_END) {
                    setLobby(lobbyUpdate);
                    localStorage.setItem("lobby", JSON.stringify(lobbyUpdate));
                    navigate("/game-summary");
                }

                // If a player disconnects then reconnects, resume their game
                // ==> Functional Requirement: FR14
                if (lobbyUpdate.players[userDb.uuid].status != LOBBY_PLAYER_STATUS_NOT_STARTED && gameStatus == GAME_STATUS_NOT_STARTED) {
                    let board = PlayerHelper.objectToNestedArray(lobbyUpdate.playerBoards[userDb.uuid]);
                    let score = lobbyUpdate.players[userDb.uuid].score;
                    let status = lobbyUpdate.players[userDb.uuid].status;
                    resumeGame(lobbyUpdate, userDb.uuid, board, score, status);
                }

                if (playerUuids == null) {
                    setPlayerUuids(Object.keys(lobbyUpdate.players));
                }

                // Update local copy of scoreboard
                // ==> Functional Requirement: FR26
                let scoresList = Object.entries(lobbyUpdate.players).map(([playerUuid, playerData]) => (
                    {
                        uuid: playerUuid,
                        username: playerData.username,
                        score: playerData.score,
                        status: playerData.status
                    }
                ));
                setPlayerScores(scoresList);

                // Start the game upon loading the page
                // ==> Functional Requirement: FR14
                if (lobbyUpdate.status == LOBBY_STATUS_ONGOING && lobbyUpdate.players[userDb.uuid].status == LOBBY_PLAYER_STATUS_NOT_STARTED) {
                    startGame(lobbyUpdate, userDb.uuid);
                    await startPlayerIndividualGame(lobbyUpdate, userDb.uuid);
                }
                // If the host is a player, check if the game is over for all players
                // ==> Functional Requirement: FR21
                else if (isHost == "true" && await isGameFinished(lobbyUpdate)) {
                    await endGameForLobby(lobbyUpdate);
                }
                // Don't take any more action if your game has ended
                // ==> Functional Requirement: FR21
                if (lobbyUpdate.players[userDb.uuid].status == LOBBY_PLAYER_STATUS_END) {
                    return;
                }

                // If there are new shapes in the player's shape queue, add them to a local
                // shape queue and update the database by popping the shapes that were read
                // ==> Functional Requirement: FR25
                if (lobbyUpdate.playerPendingShapes[userDb.uuid].length > 0) {
                    let poppedShapes = lobbyUpdate.playerPendingShapes[userDb.uuid];
                    popShapeQueue(lobby, userDb.uuid, poppedShapes.length);
                    let updatedShapeQueue = [...localShapeQueue]
                    updatedShapeQueue.push(...poppedShapes);
                    setLocalShapeQueue(updatedShapeQueue);
                }

                // If there are any pending rows, store a local count of the rows needed to be 
                // added and pop the value in the database
                // ==> Functional Requirement: FR27
                if (lobbyUpdate.playerPendingRows[userDb.uuid] > 0) {
                    let pendingRows = lobbyUpdate.playerPendingRows[userDb.uuid];
                    popPendingRows(lobby, userDb.uuid, pendingRows);
                    setPendingRows((rows) => rows + pendingRows);
                }
            }
        });
        return () => unsubscribe();
    }, [playerUuids, userDb, gameStatus]);

    // Process local shape queue
    // ==> Functional Requirement: FR25
    useEffect(() => {
        if (localShapeQueue.length > 0) {
            let newShapeQueue = [...localShapeQueue];
            let poppedElement = newShapeQueue.shift();
            let widget = PlayerHelper.objectToNestedArray(poppedElement)
            dispatchBoardState({ type: 'pushSpectatorShape', widget: widget });
            setLocalShapeQueue(newShapeQueue);
        }
    }, [localShapeQueue]);

    // If the player has completed rows, broadcast them to the other players so that
    // they create incomplete rows on their boards
    // ==> Functional Requirement: FR27
    useEffect(() => {
        if (playerUuids) {
            if (removedRowsCount > 0) {
                for (var playerUuid of playerUuids) {
                    if (playerUuid != userDb.uuid) {
                        pushPendingRows(lobby, playerUuid, removedRowsCount);
                    }
                }
                setRemovedRowsCount(0);
            }
        }
    }, [playerUuids, removedRowsCount])

    // If another player has completed rows, add incomplete rows to this player's board
    // ==> Functional Requirement: FR27
    useEffect(() => {
        if (pendingRows > 0) {
            dispatchBoardState({ type: 'addIncompleteRows', rowCount: pendingRows });
            setPendingRows(0);
        }
    }, [pendingRows])

    // Whenever the shape queue length changes, update the database with the new length
    // ==> Functional Requirement: FR25
    useEffect(() => {
        async function updateShapeQueueSize() {
            if (lobby && userDb) {
                await setPendingShapesSize(lobby, userDb.uuid, shapeQueue.length);
            }
        }
        updateShapeQueueSize();
    }, [shapeQueue, lobby, userDb])

    // Render the game board
    // ==> Functional Requirement: FR13, FR14
    return (
        <div className="min-h-screen flex justify-center items-center">
            {
                userDb
                ? (
                    <Grid
                        container
                        spacing={3}
                        justifyContent="center"
                        alignItems="flex-start"
                    >
                        {board && 
                            <Grid item>
                                <GameBoard boardState={board} currentColor={currentColor} gameStatus={gameStatus} />
                            </Grid>
                        }
                        <Grid item>
                            <Box 
                                width={250} 
                                height={250} 
                                display="flex"
                                flexDirection="column"
                                justifyContent="center"
                                alignItems="center"
                                gap={1}
                                sx={{ boxShadow: 3, borderRadius: '16px', p: 4 }}
                            >
                                <Typography variant="h4">Scoreboard</Typography>
                                {playerScores && playerScores.sort(compareScores).map((playerScoreData) => {
                                    return (
                                        <div key={playerScoreData.uuid} className="flex justify-between w-full">
                                            <div><b>{playerScoreData.username}:</b></div>
                                            <div>{playerScoreData.score}</div>
                                        </div>
                                    )
                                })}
                            </Box>
                            {
                                (gameStatus == GAME_STATUS_ENDED) &&
                                (
                                    <Box
                                        width={250} 
                                        display="flex"
                                        flexDirection="column"
                                        justifyContent="center"
                                        alignItems="center"
                                        sx={{ mt: 2 }}
                                    >
                                        <Typography variant="h5"><b>Your game is over!</b></Typography>
                                        <Typography variant="body1" className="text-center">Waiting for other players to finish...</Typography>
                                    </Box>
                                )
                            }
                        </Grid>
                    </Grid>
                )
                : (
                    <CircularProgress />
                )
            }
        </div>
    )
}