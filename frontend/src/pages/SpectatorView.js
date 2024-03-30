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
import { Lobby as LobbyDb, deleteLobby, inviteFriendToLobby, 
    joinPlayers, joinSpectators, leaveLobby, startGameForLobby,
    LOBBY_STATUS_OPEN, LOBBY_STATUS_FULL,
    LOBBY_STATUS_ONGOING, LOBBY_STATUS_END, LOBBY_PLAYER_STATUS_NOT_STARTED, 
    startPlayerIndividualGame, 
    LOBBY_PLAYER_STATUS_END,
    isGameFinished, PlayerHelper, pushPendingShapes} from '../database/models/lobby';

// Routing
import { useNavigate, useLocation } from 'react-router-dom';

export default function SpectatorView() {
    const { userDb, lobby, setLobby } = useContext(Context);
    const navigate = useNavigate();
    const {state} = useLocation();
    const { isHost } = state;

    // TODO: Temporary, will get board state from websocket server later
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
    const [playerScores, setPlayerScores] = useState(null);

    // Listen to real-time updates from the lobby
    // Reference: https://stackoverflow.com/questions/59944658/which-react-hook-to-use-with-firestore-onsnapshot
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "lobby", lobby.uuid), async (doc) => {
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
            
            // Redirect to game summary page upon game end
            if (lobbyUpdate.status == LOBBY_STATUS_END) {
                navigate("/game-summary", { state: { isHost: isHost, lobby: lobbyUpdate, scoresList: scoresList } });
            }

            // Pick a random player if none is currently assigned
            if (assignedPlayerUuid == "") {
                let playerUuids = Object.keys(lobbyUpdate.players);
                let playerCount = playerUuids.length;
                setAssignedPlayerUuid(playerUuids[Math.floor(Math.random() * playerCount)]);
                setAssignedPlayerUsername(lobbyUpdate.players[assignedPlayerUuid]?.username);

                // Start timer
                setSeconds(15);
            }
            // Watch the board state of the assigned player
            else {
                setBoard(PlayerHelper.objectToNestedArray(lobbyUpdate.players[assignedPlayerUuid].board));
            }
        });
        return () => unsubscribe();
    }, []);

    const [seconds, setSeconds] = useState(15);

    // Decrement the timer every second
    useEffect(() => {
        if (assignedPlayerUuid == "") {
            return;
        }
        else {
            if (seconds > 0) {
                setTimeout(() => setSeconds(seconds - 1), 1000);
            }
            else {
                if (validateShape(widget)) {
                    submitShape();
                }
                else {
                    // TODO: display some sort of message to the player
                    console.log("Invalid shape!")
                }
    
                setAssignedPlayerUuid("");
                setAssignedPlayerUsername("");
                setWidget(clearWidget());
            }
        }
    }, [assignedPlayerUuid, seconds])

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
                        <Typography variant="h5">0:{seconds < 10 ? 0 : <span />}{seconds}</Typography>
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