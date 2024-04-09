// React
import { useState, useContext, useCallback, useEffect } from 'react';

// Routing
import { useNavigate } from "react-router-dom";

// Material UI
import { Grid, Button, Typography, TextField, Alert, Tabs, Tab, CircularProgress, Paper, Box, LinearProgress } from '@mui/material';

// User Context
import { Context } from "../auth/AuthContext";

// Database
import { db } from "../firebase.js";
import { doc, onSnapshot } from "firebase/firestore";
import { getLobbyByCode, joinSpectators, removeLobbyInvite } from '../database/models/lobby';
import { User } from '../database/models/user';

const LOBBY_LIMIT = 24;

/**
 * This component renders the join lobby page, where users can join lobbies
 * by either entering the lobby code, or by accepting a lobby invite from a friend.
 * 
 * ==> Functional Requirements: FR9, FR10
 */
export default function JoinLobby() {
    const {userDb, setUserDb, setLobby, setIsHost} = useContext(Context);

    const [lobbyCode, setLobbyCode] = useState("");
    const [displayError, setDisplayError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [tabIndex, setTabIndex] = useState(0);
    const [lobbyInvitesList, setLobbyInvitesList] = useState(null);
    const [loading, setLoading] = useState(false);

    // Listen to real-time updates for the user
    // Reference: https://stackoverflow.com/questions/59944658/which-react-hook-to-use-with-firestore-onsnapshot
    // ==> Functional Requirements: FR9, FR10
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "user", userDb.uuid), async (doc) => {
            let userUpdate = User.fromFirestore(doc);
            setUserDb(userUpdate);
            localStorage.setItem("userDb", JSON.stringify(userUpdate));
            setLobbyInvitesList(userUpdate.lobbyInvites);
        });
        return () => unsubscribe();
    }, []);

    const navigate = useNavigate();

    // Redirect back to the home page
    const backClick = () => {
        navigate("/home");
    }

    // Save the lobby code text field's value
    // ==> Functional Requirement: FR10
    function handleTextFieldChange(event) {
        setLobbyCode(event.target.value);
    }

    // Shared lobby-joining logic used when both entering the code manually, 
    // or when a lobby invite is accepted
    // ==> Functional Requirements: FR9, FR10
    async function joinLobby(lobbyCode) {
        if (lobbyCode != "") {
            await getLobbyByCode(lobbyCode.toUpperCase())
                .then(async (lobby) => {
                    if (lobby) {
                        let currentNumberOfPlayers = lobby.players.length + lobby.spectators.length;
                        if (currentNumberOfPlayers >= LOBBY_LIMIT) {
                            setDisplayError(true);
                            setErrorMessage("Lobby is full!");
                            if (tabIndex == 1) {
                                await removeLobbyInvite(userDb, lobbyCode);
                            }
                        }
                        setLobby(lobby);
                        setIsHost("false");
                        localStorage.setItem("lobby", JSON.stringify(lobby));
                        localStorage.setItem("isHost", "false");
                        await removeLobbyInvite(userDb, lobbyCode);
                        await joinSpectators(lobby, userDb.uuid, userDb.username);
                        navigate("/lobby/" + lobbyCode.toUpperCase());
                    }
                    else {
                        setDisplayError(true);
                        if (tabIndex == 0) {
                            setErrorMessage("Invalid lobby code!");
                        }
                        else {
                            setErrorMessage("Lobby no longer exists!");
                            await removeLobbyInvite(userDb, lobbyCode);
                        }
                        setLoading(false);
                    }
                })
                .catch((error) => console.log(error));
        }
        else {
            setDisplayError(true);
            setErrorMessage("Invalid lobby code!");
            setLoading(false);
        }
    }

    // Join a lobby by code
    // ==> Functional Requirement: FR10
    async function handleJoinLobbyClick() {
        setLoading(true);
        await joinLobby(lobbyCode);
    }

    // Decline a lobby invite from a friend
    // ==> Functional Requirement: FR9
    async function handleDeclineLobbyInviteClick(lobbyCode) {
        await removeLobbyInvite(userDb, lobbyCode);
    }

    // Decline a lobby invite from a friend
    // ==> Functional Requirement: FR9
    async function handleAcceptLobbyInviteClick(lobbyCode) {
        setLoading(true);
        await joinLobby(lobbyCode);
    }

    // Handles on-click to change tabs
    // ==> Functional Requirement: FR9, FR10
    const handleChange = (event, newTabIndex) => {
        setTabIndex(newTabIndex);
        setDisplayError(false);
    };

    // Renders the corresponding content depending on which tab is currently selected
    // ==> Functional Requirement: FR9, FR10
    const renderTabContent = useCallback(() => {
        let content = null;

        switch (tabIndex) {
            // Join lobby by code tab
            case 0:
                content = (
                    <div className="h-full flex flex-col items-center justify-center space-y-3">
                        {displayError && 
                            <Alert
                                severity="error"
                                onClose={() => setDisplayError(false)}>
                                {errorMessage}
                            </Alert>
                        }
                        <Typography variant="h4">Enter lobby code:</Typography>
                        <TextField 
                            onChange={handleTextFieldChange}
                            className="w-full"
                            sx={{ input: {textAlign: "center", fontSize: 40} }} />
                        <div className="flex justify-center space-x-12">
                            <Button variant="contained" onClick={handleJoinLobbyClick}>Join Lobby</Button>
                        </div>
                    </div>
                )
                break;
            
            // Lobby invites list tab
            case 1:
                if (lobbyInvitesList) {
                    content = (
                        <div className="flex flex-col">
                            {displayError && 
                                <Alert
                                    severity="error"
                                    onClose={() => setDisplayError(false)}>
                                    {errorMessage}
                                </Alert>
                            }
                            <div className="flex flex-col space-y-2">
                                {lobbyInvitesList.map((lobbyCode, index) => (
                                    <Paper elevation={2} key={index} sx={{ height: "fit-content" }}>
                                        <div className="flex items-center justify-between h-fit p-4">
                                            <Typography variant="h5">Room Code: <b>{lobbyCode}</b></Typography>
                                            <div className='flex space-x-2'>
                                                <Button variant="contained" onClick={() => handleAcceptLobbyInviteClick(lobbyCode)}>Join</Button>
                                                <Button variant="outlined" onClick={() => handleDeclineLobbyInviteClick(lobbyCode)}>Decline</Button>
                                            </div>
                                        </div>
                                    </Paper>
                                ))}
                            </div>
                        </div>
                    )
                }
                // Otherwise, display a loading progress circle
                else {
                    content = (
                        <div className="h-full flex justify-center items-center">
                            <CircularProgress />
                        </div>
                    )
                }
                break;

            // Debugging: this shouldn't happen
            default:
                console.error("Invalid tab index selected");
                content = null;
        }

        // For lobby invites tab, add a grey background
        const backgroundColor = (tabIndex == 1) ? "bg-slate-300 border border-slate-300" : "";

        return (
            <div className={"h-80 w-full overflow-auto p-1 " + backgroundColor}>
                {content}
            </div>
        )
    })

    // Renders the join lobby page
    // ==> Functional Requirement: FR9, FR10
    return (
        <div className='h-screen overflow-hidden'>
            { loading && (
                <Box sx={{ width: '100%' }}>
                    <LinearProgress />
                </Box>
            )}
            <Grid
                container
                alignItems="center"
                justifyContent="center"
                sx={{ minHeight: '100vh' }}
            >
                <Grid item xs={5}>
                    <div className="flex flex-col items-center w-full space-y-6">
                        <div className="flex justify-center w-full">
                            <Tabs value={tabIndex} onChange={handleChange} variant='fullWidth' centered className="w-full border">
                                <Tab label="Join Lobby" />
                                <Tab label="Lobby Invites" />
                            </Tabs>
                        </div>
                        { renderTabContent() }
                        <Button variant="outlined" onClick={backClick}>Back</Button>
                    </div>
                </Grid>
            </Grid>
        </div>
    )
}