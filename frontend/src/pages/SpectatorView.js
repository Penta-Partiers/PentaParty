// React
import { useState, useEffect, useContext } from "react"

// Material UI
import { Grid, Typography, Button } from '@mui/material';

// Components
import GameBoard from '../components/GameBoard';
import Widget from "../components/Widget";

// Custom hooks / game logic
import { clearWidget, useWidget, validateShape } from "../tetris/useWidget";

// User Context
import { Context } from "../auth/AuthContext";

// Database
import { db } from "../firebase.js";
import { doc, onSnapshot } from "firebase/firestore";
import { Lobby as LobbyDb, LOBBY_STATUS_END, LOBBY_PLAYER_STATUS_NOT_STARTED,
    isGameFinished, PlayerHelper, pushPendingShapes, 
    endGameForLobby, getShapeQueueSize, LOBBY_PLAYER_STATUS_ONGOING} from '../database/models/lobby';

// Routing
import { useNavigate, useLocation } from 'react-router-dom';

export default function SpectatorView() {
    const { lobby, isHost } = useContext(Context);
    const navigate = useNavigate();
    // const {state} = useLocation();
    // const { isHost } = state;

    const [board, setBoard] = useState(() => {
        var board = new Array(25);
        for (let i = 0; i < board.length; i++) {
            board[i] = new Array(13).fill(0);
        }
        return board;
    });

    const [widget, setWidget, onWidgetClick, onClearClick] = useWidget();

    const [assignedPlayerUuid, setAssignedPlayerUuid] = useState("");
    const [assignedPlayerUsername, setAssignedPlayerUsername] = useState("");
    const [players, setPlayers] = useState(null);

    // Listen to real-time updates from the lobby
    // Reference: https://stackoverflow.com/questions/59944658/which-react-hook-to-use-with-firestore-onsnapshot
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "lobby", lobby.uuid), async (doc) => {
            let lobbyUpdate = LobbyDb.fromFirestore(doc);

            // Redirect to game summary page upon game end
            if (lobbyUpdate == null || lobbyUpdate.status == LOBBY_STATUS_END) {
                localStorage.setItem("lobby", JSON.stringify(lobbyUpdate));
                navigate("/game-summary");
            }

            let playersData = Object.entries(lobbyUpdate.players).map(([playerUuid, playerData]) => (
                {
                    uuid: playerUuid,
                    username: playerData.username,
                    score: playerData.score,
                    status: playerData.status
                }
            ));
            setPlayers(playersData);
            
            // End the game if all players are done
            if (isHost == "true" && await isGameFinished(lobbyUpdate)) {
                await endGameForLobby(lobbyUpdate);
            }

            // Pick a random player if none is currently assigned, and make sure their game is still ongoing
            if (assignedPlayerUuid == "") {
                let playerUuids = playersData
                    .filter((player) => (player.status == LOBBY_PLAYER_STATUS_ONGOING || player.status == LOBBY_PLAYER_STATUS_NOT_STARTED))
                    .map((player) => player.uuid);
                let playerCount = playerUuids.length;
                let assignedUuid = playerUuids[Math.floor(Math.random() * playerCount)];
            
                setAssignedPlayerUuid(assignedUuid);
                setAssignedPlayerUsername(lobbyUpdate.players[assignedUuid].username);

                let boardStateUpdate = PlayerHelper.objectToNestedArray(lobbyUpdate.playerBoards[assignedUuid])
                setBoard(boardStateUpdate);
            }
            // Watch the board state of the assigned player
            else {
                let boardStateUpdate = PlayerHelper.objectToNestedArray(lobbyUpdate.playerBoards[assignedPlayerUuid])
                setBoard(boardStateUpdate);
            }
        });
        return () => unsubscribe();
    }, [assignedPlayerUuid, players]);

    const [timerCount, setTimerCount] = useState(0);

    useEffect(() => {
        async function updateTimer() {
            if (assignedPlayerUuid != "") {
                let shapeQueueSize = await getShapeQueueSize(lobby, assignedPlayerUuid)
    
                // Change amount of time based on the buffer size
                if (shapeQueueSize < 5) {
                    setTimerCount(10);
                } else if (shapeQueueSize < 15) {
                    setTimerCount(20);
                } else if (shapeQueueSize < 30) {
                    setTimerCount(30);
                } else {
                    setTimerCount(60);
                }
            }
        }

        updateTimer();
    }, [assignedPlayerUuid])

    // Decrement the timer every second
    useEffect(() => {
        let timer;
        if (assignedPlayerUuid != "") {
            if (timerCount > 0) {
                timer = setTimeout(() => {
                    setTimerCount(prevCount => prevCount - 1);
                }, 1000);
            }
            else if (timerCount === 0) {
                if (validateShape(widget)) {
                    submitShape();
                } else {
                    // TODO: display some sort of message to the player
                    console.log("invalid shape");
                }
                setAssignedPlayerUuid("");
                setAssignedPlayerUsername("");
                setWidget(clearWidget());
            }
        }

        return () => clearTimeout(timer);
    }, [assignedPlayerUuid, timerCount])

    async function submitShape() {
        await pushPendingShapes(lobby, assignedPlayerUuid, widget);
    }

    return (
        <Grid
            container
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: '100vh' }}
            columnGap={20}
        >
            <Grid item>
                <GameBoard boardState={board} currentColor={"red"} />
            </Grid>
            <Grid item>
                <div className="flex flex-col items-center space-y-4 w-full">
                    <div className="flex flex-col items-center mb-8">
                        <Typography variant="h5">You are assigned to:</Typography>
                        <Typography variant="h3">{assignedPlayerUsername}</Typography>
                    </div>
                    <div>
                        <Typography variant="h5">0:{timerCount < 10 ? 0 : <span />}{timerCount}</Typography>
                    </div>
                    <Widget widget={widget} onSquareClick={onWidgetClick}/>
                    <div className="flex justify-center items-center w-full space-x-3">
                        <Button variant="outlined" onClick={onClearClick}>Clear</Button>
                    </div>
                </div>
            </Grid>
        </Grid>
    )
}