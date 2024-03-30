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
import { doc, onSnapshot } from "firebase/firestore";
import { Lobby as LobbyDb, deleteLobby, inviteFriendToLobby, 
    joinPlayers, joinSpectators, leaveLobby, startGameForLobby,
    LOBBY_STATUS_OPEN, LOBBY_STATUS_FULL,
    LOBBY_STATUS_ONGOING, LOBBY_STATUS_END, LOBBY_PLAYER_STATUS_NOT_STARTED, 
    startPlayerIndividualGame, 
    LOBBY_PLAYER_STATUS_END,
    isGameFinished, endGameForLobby, popPendingShapes} from '../database/models/lobby';

// Routing
import { useNavigate, useLocation } from 'react-router-dom';

export default function PlayerView() {
    const { userDb, lobby, setLobby } = useContext(Context);
    const {state} = useLocation();
    const { isHost } = state;
    const navigate = useNavigate();
    const { startGame, board, score, currentColor, gameStatus, dispatchBoardState } = useGame();

    const [playerScores, setPlayerScores] = useState(null);

    async function popFromShapeQueue(widget) {
        console.log("popFromShapeQueue: ", widget);
        dispatchBoardState({ type: 'pushSpectatorShape', widget: widget });
        await popPendingShapes(lobby, userDb.uuid);
    }

    // Listen to real-time updates from the lobby
    // Reference: https://stackoverflow.com/questions/59944658/which-react-hook-to-use-with-firestore-onsnapshot
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "lobby", lobby.uuid), async (doc) => {
            doc.docChanges().forEach((change) => {
                console.log("change.doc.data(): ", change.doc.data())
            })

            let lobbyUpdate = LobbyDb.fromFirestore(doc);
            setLobby(lobbyUpdate);

            let scoresList = Object.entries(lobbyUpdate.players).map(([playerUuid, playerData]) => (
                {
                    uuid: playerUuid,
                    username: playerData.username,
                    score: playerData.score,
                    status: playerData.status
                }
            ));
            setPlayerScores(scoresList);

            while (lobbyUpdate.players[userDb.uuid].pendingShapes.length > 0) {
                console.log("shape queue length before shift: ", lobbyUpdate.players[userDb.uuid].pendingShapes.length)
                let widget = lobbyUpdate.players[userDb.uuid].pendingShapes.shift();
                console.log("shape queue length after shift: ", lobbyUpdate.players[userDb.uuid].pendingShapes.length)
                await popFromShapeQueue(widget);
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
                endGameForLobby(lobbyUpdate);
            }
        });
        return () => unsubscribe();
    }, []);

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