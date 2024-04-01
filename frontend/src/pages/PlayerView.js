// React
import { useState, useEffect, useContext } from 'react';

// Material UI
import { Grid, Box, Typography, Button } from '@mui/material';

// Components
import GameBoard from '../components/GameBoard';

// Custom hooks / game logic
import { useGame } from '../tetris/useGame';

// User Context
import { Context } from "../auth/AuthContext";

// Database
import { db } from "../firebase.js";
import { doc, onSnapshot, collection } from "firebase/firestore";
import { Lobby as LobbyDb, deleteLobby, inviteFriendToLobby, 
    joinPlayers, joinSpectators, leaveLobby, startGameForLobby,
    LOBBY_STATUS_OPEN, LOBBY_STATUS_FULL,
    LOBBY_STATUS_ONGOING, LOBBY_STATUS_END, LOBBY_PLAYER_STATUS_NOT_STARTED, 
    startPlayerIndividualGame, 
    LOBBY_PLAYER_STATUS_END,
    isGameFinished, endGameForLobby, popPendingShapes, popShapeQueue, PlayerHelper, pushPendingRows, popPendingRows} from '../database/models/lobby';

// Routing
import { useNavigate, useLocation } from 'react-router-dom';

// Util
import { compareScores } from '../util/util.js';

export default function PlayerView() {
    const { userDb, lobby } = useContext(Context);
    const {state} = useLocation();
    const { isHost } = state;
    const navigate = useNavigate();
    const { startGame, 
            board, 
            currentColor, 
            gameStatus, 
            dispatchBoardState, 
            removedRowsCount,
            setRemovedRowsCount } = useGame();

    const [playerScores, setPlayerScores] = useState(null);
    const [shapeQueue, setShapeQueue] = useState([]);
    const [pendingRows, setPendingRows] = useState(0);
    const [playerUuids, setPlayerUuids] = useState(null);

    // Listen to real-time updates from the lobby
    // Reference: https://stackoverflow.com/questions/59944658/which-react-hook-to-use-with-firestore-onsnapshot
    useEffect(() => {
        let docRef = doc(db, "lobby", lobby.uuid)

        const unsubscribe = onSnapshot(docRef, async (doc) => {
            let lobbyUpdate = LobbyDb.fromFirestore(doc);

            if (playerUuids == null) {
                setPlayerUuids(Object.keys(lobbyUpdate.players));
            }

            // Update local copy of scoreboard
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
            if (lobbyUpdate.status == LOBBY_STATUS_ONGOING && lobbyUpdate.players[userDb.uuid].status == LOBBY_PLAYER_STATUS_NOT_STARTED) {
                startGame(lobbyUpdate, userDb.uuid);
                await startPlayerIndividualGame(lobbyUpdate, userDb.uuid);
            }
            // If the game has ended, redirect to the game summary page
            else if (lobbyUpdate.status == LOBBY_STATUS_END) {
                navigate("/game-summary", { state: { isHost: isHost, lobby: lobbyUpdate, scoresList: scoresList } });
            }
            // If the host is a player, check if the game is  
            else if (isHost && await isGameFinished(lobbyUpdate)) {
                await endGameForLobby(lobbyUpdate);
            }
            // Don't take any more action if your game has ended
            if (lobbyUpdate.players[userDb.uuid].status == LOBBY_PLAYER_STATUS_END) {
                return;
            }

            // If there are new shapes in the player's shape queue, add them to a local
            // shape queue and update the database by popping the shapes that were read
            if (lobbyUpdate.playerPendingShapes[userDb.uuid].length > 0) {
                let poppedShapes = lobbyUpdate.playerPendingShapes[userDb.uuid];
                popShapeQueue(lobby, userDb.uuid, poppedShapes.length);
                let updatedShapeQueue = [...shapeQueue]
                updatedShapeQueue.push(...poppedShapes);
                setShapeQueue(updatedShapeQueue);
            }

            // TODO: If a player has any pending rows,
            // - take a local copy
            // - decrement the database pending rows for the user id
            // - add incomplete rows to board
            if (lobbyUpdate.playerPendingRows[userDb.uuid] > 0) {
                let pendingRows = lobbyUpdate.playerPendingRows[userDb.uuid];
                popPendingRows(lobby, userDb.uuid, pendingRows);
                setPendingRows((rows) => rows + pendingRows);
            }
        });
        return () => unsubscribe();
    }, [playerUuids]);

    // Process local shape queue
    useEffect(() => {
        if (shapeQueue.length > 0) {
            let newShapeQueue = [...shapeQueue];
            console.log("newShapeQueue: ", newShapeQueue);
            let poppedElement = newShapeQueue.shift();
            console.log("popped element: ", poppedElement);
            let widget = PlayerHelper.objectToNestedArray(poppedElement)
            console.log("converted widget: ", widget);
            dispatchBoardState({ type: 'pushSpectatorShape', widget: widget });
            setShapeQueue(newShapeQueue);
        }
    }, [shapeQueue]);

    // If the player has completed rows, broadcast them to the other players so that
    // they create incomplete rows on their boards
    useEffect(() => {
        if (playerUuids) {
            console.log("playerUuids: ", playerUuids)
            if (removedRowsCount > 0) {
                for (var playerUuid of playerUuids) {
                    console.log("player uuid: ", playerUuid)
                    if (playerUuid != userDb.uuid) {
                        pushPendingRows(lobby, playerUuid, removedRowsCount);
                    }
                }
                setRemovedRowsCount(0);
            }
        }
    }, [playerUuids, removedRowsCount])

    // If another player has completed rows, add incomplete rows to this player's board
    useEffect(() => {
        if (pendingRows > 0) {
            console.log("received pending rows!")
            dispatchBoardState({ type: 'addIncompleteRows', rowCount: pendingRows });
            setPendingRows(0);
        }
    }, [pendingRows])

    return (
        <div className="min-h-screen flex justify-center items-center">
            <Grid
                container
                spacing={3}
                justifyContent="center"
                alignItems="flex-start"
            >
                <Grid item>
                    <GameBoard boardState={board} currentColor={currentColor} gameStatus={gameStatus} />
                </Grid>
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
                                // TODO: change color or something based on each player's state
                                <div key={playerScoreData.uuid} className="flex justify-between w-full">
                                    <div><b>{playerScoreData.username}:</b></div>
                                    <div>{playerScoreData.score}</div>
                                </div>
                            )
                        })}
                    </Box>
                </Grid>
            </Grid>
        </div>
    )
}