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
    isGameFinished, endGameForLobby, popPendingShapes, popShapeQueue, PlayerHelper} from '../database/models/lobby';

// Routing
import { useNavigate, useLocation } from 'react-router-dom';

export default function PlayerView() {
    const { userDb, lobby, setLobby } = useContext(Context);
    const {state} = useLocation();
    const { isHost } = state;
    const navigate = useNavigate();
    const { startGame, board, score, currentColor, gameStatus, dispatchBoardState } = useGame();

    const [playerScores, setPlayerScores] = useState(null);
    const [shapeQueue, setShapeQueue] = useState([]);

    // Listen to real-time updates from the lobby
    // Reference: https://stackoverflow.com/questions/59944658/which-react-hook-to-use-with-firestore-onsnapshot
    useEffect(() => {
        let docRef = doc(db, "lobby", lobby.uuid)

        const unsubscribe = onSnapshot(docRef, async (doc) => {
            let lobbyUpdate = LobbyDb.fromFirestore(doc);
            // console.log(lobbyUpdate);

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

            console.log("lobbyUpdate shape queue: ", lobbyUpdate.playerPendingShapes[userDb.uuid]);
            if (lobbyUpdate.playerPendingShapes[userDb.uuid].length > 0) {
                let poppedShapes = lobbyUpdate.playerPendingShapes[userDb.uuid];
                popShapeQueue(lobby, userDb.uuid, poppedShapes.length);
                let updatedShapeQueue = [...shapeQueue]
                updatedShapeQueue.push(...poppedShapes);
                setShapeQueue(updatedShapeQueue);
                console.log("updated shape queue: ", updatedShapeQueue);
            }
            
            // Start the game upon loading the page
            if (lobbyUpdate.status == LOBBY_STATUS_ONGOING && lobbyUpdate.players[userDb.uuid].status == LOBBY_PLAYER_STATUS_NOT_STARTED) {
                startGame(lobbyUpdate, userDb.uuid);
                await startPlayerIndividualGame(lobbyUpdate, userDb.uuid);
            }
            // TODO: check if all but one boards are done, and if so, end the game
            else if (lobbyUpdate.status == LOBBY_STATUS_END) {
                navigate("/game-summary", { state: { isHost: isHost, lobby: lobbyUpdate, scoresList: scoresList } });
            }
            else if (await isGameFinished(lobbyUpdate)) {
                await endGameForLobby(lobbyUpdate);
            }
        });
        return () => unsubscribe();
    }, []);

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
                        {playerScores && playerScores.map((playerScoreData) => {
                            return (
                                // TODO: change color or something based on each player's state
                                <div key={playerScoreData.uuid} className="flex justify-between w-full">
                                    <div><b>{playerScoreData.username}:</b></div>
                                    <div>{playerScoreData.score}</div>
                                </div>
                            )
                        })}
                    </Box>
                    <Button onClick={startGame}>Start Game</Button>
                </Grid>
            </Grid>
        </div>
    )
}