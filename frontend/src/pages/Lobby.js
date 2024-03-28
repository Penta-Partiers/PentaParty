// React
import { useState, useContext, useEffect } from 'react';

// Database
import { doc, onSnapshot } from "firebase/firestore";
import { Lobby as LobbyDb, deleteLobby, joinPlayers, joinSpectators, leaveLobby, startGameForLobby } from '../database/models/lobby';
import { db } from "../firebase.js";

// User Context
import { Context } from "../auth/AuthContext";

// Routing
import { useLocation, useNavigate } from 'react-router-dom';

// Material UI
import { Grid, Button, Paper, Typography, Modal, Alert } from '@mui/material';

const MAX_PLAYERS = 4;

export default function Lobby() {
    const {userDb, lobby, setLobby} = useContext(Context);

    const {state} = useLocation();
    const navigate = useNavigate();

    const [isHost, setIsHost] = useState(state.isHost)
    const [modalOpen, setModalOpen] = useState(false);
    const [displayError, setDisplayError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const friendsList = [
        "friend_01",
        "friend_02",
        "friend_03",
        "friend_04",
        "friend_05",
        "friend_06",
        "friend_07",
    ]

    // Listen to real-time updates from the lobby
    // Reference: https://stackoverflow.com/questions/59944658/which-react-hook-to-use-with-firestore-onsnapshot
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "lobby", lobby.uuid), (doc) => {
            let lobbyUpdate = LobbyDb.fromFirestore(doc);
            setLobby(lobbyUpdate);

            // Once game has started, redirect players and spectators accordingly
            if (lobbyUpdate && lobbyUpdate.started) {
                console.log("game started!");
                if (lobbyUpdate.players.find(p => p.uuid == userDb.uuid)) {
                    navigate("/player");
                }
                else {
                    navigate("/spectator");
                }
            }
        });
        return () => unsubscribe();
    }, []);

    async function handleJoinPlayersClick() {
        if (lobby.players.length >= MAX_PLAYERS) {
            console.log("Max number of players reached, cannot join.");
            setDisplayError(true);
            setErrorMessage("Max number of players reached!");
            return;
        }
        else {
            await joinPlayers(lobby, userDb.uuid, userDb.username);
        }
    }

    async function handleJoinSpectatorsClick() {
        await joinSpectators(lobby, userDb.uuid, userDb.username);
    }

    async function handleLeaveClick() {
        if (isHost) {
            await deleteLobby(lobby)
                .then(() => {
                    setLobby(null);
                    navigate("/home");
                })
                .catch((e) => console.log(e));
        }
        else {
            await leaveLobby(lobby, userDb.uuid)
                .then(() => {
                    setLobby(null);
                    navigate("/home");
                })
                .catch((e) => console.log(e));
        }
    }

    async function handleStartGameClick() {
        if (lobby.players.length > 0 && lobby.players.length <= 4 && lobby.spectators.length >= 1) {
            await startGameForLobby(lobby);
        }
        else {
            setDisplayError(true);
            setErrorMessage("Invalid lobby arrangement!");
        }
    }

    return (
        <Grid
            container
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: '100vh' }}
        >
            <Grid item xs={7}>
                <div className='flex flex-col items-center w-full p-2 space-y-8'>
                    {displayError &&
                        <Alert severity="error" onClose={() => setDisplayError(false)}>
                            {errorMessage}
                        </Alert>
                    }

                    <Typography variant='h4'><b>Room Code:</b> {lobby ? lobby.code : <></>}</Typography>

                    <Modal
                        open={modalOpen}
                        onClose={() => setModalOpen(false)}
                        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <div className='flex flex-col items-center bg-white w-96 h-fit p-6 space-y-4'>
                            <Typography variant="h4"><b>Invite</b></Typography>
                            <div className='flex flex-col items-center bg-slate-300 h-80 w-full p-2 overflow-auto space-y-2 border border-slate-300'>
                                {friendsList.map((name, index) => (
                                    <Paper elevation={2} key={index} sx={{ minHeight: "50px", width: "100%" }}>
                                        <div className="flex items-center justify-between h-[50px] px-3">
                                            <Typography variant="subtitle1" sx={{ overflow: 'auto', maxWidth: '200px' }}>{name}</Typography>
                                            <Button variant="outlined" size='small'>Invite</Button>
                                        </div>
                                    </Paper>
                                ))}
                            </div>
                            <Button variant="contained" onClick={() => setModalOpen(false)}>Done</Button>
                        </div>
                    </Modal>

                    <div className='flex justify-center w-full space-x-4'>
                        <div className='flex flex-col items-center w-1/2 space-y-2 p-2'>
                            <Typography variant="h5"><b>Players</b></Typography>
                            <div className='flex flex-col items-center h-80 w-full bg-slate-300 overflow-auto p-2 space-y-2 border border-slate-300'>
                                {lobby && lobby.players.map((player, index) => (
                                    <Paper elevation="2" key={index} sx={{ minHeight: "50px", width: "100%" }}>
                                        <div className='flex items-center justify-center h-full'>
                                            <Typography variant="h6">{player.username}</Typography>
                                        </div>
                                    </Paper>
                                ))}
                            </div>
                            <Button variant="contained" onClick={handleJoinPlayersClick}>Join Players</Button>
                        </div>
                        <div className='flex flex-col items-center w-1/2 space-y-2 p-2'>
                            <Typography variant="h5"><b>Spectators</b></Typography>
                            <div className='flex flex-col items-center h-80 w-full bg-slate-300 overflow-auto p-2 space-y-2 border border-slate-300'>
                                {lobby && lobby.spectators.map((spectator, index) => (
                                    <Paper elevation="2" key={index} sx={{ minHeight: "50px", width: "100%" }}>
                                        <div className='flex items-center justify-center h-full'>
                                            <Typography variant="h6">{spectator.username}</Typography>
                                        </div>
                                    </Paper>
                                ))}
                            </div>
                            <Button variant="contained" onClick={handleJoinSpectatorsClick}>Join Spectators</Button>
                        </div>
                    </div>

                    <div className='flex items-center justify-between w-full'>
                        <div className="w-[100px]">
                            <Button variant="outlined" fullWidth="true" onClick={() => setModalOpen(true)}>Invite</Button>
                        </div>
                        <div className="w-[100px]">
                            {isHost && 
                                <Button variant="contained" size="large" fullWidth="true" onClick={handleStartGameClick}>Start</Button>
                            }
                        </div>
                        <div className="w-[100px]">
                            <Button variant="outlined" fullWidth="true" onClick={handleLeaveClick}>Leave</Button>
                        </div>
                    </div>
                </div>
            </Grid>
        </Grid>
    )
}