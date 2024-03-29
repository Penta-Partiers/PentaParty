// React
import { useState, useContext, useCallback } from 'react';

// Routing
import { useNavigate } from "react-router-dom";

// Material UI
import { Grid, Button, Typography, TextField, Alert, Tabs, Tab, CircularProgress, Paper } from '@mui/material';

// User Context
import { Context } from "../auth/AuthContext";

// Database
import { getLobbyByCode, joinSpectators } from '../database/models/lobby';

const LOBBY_LIMIT = 24;

export default function JoinLobby() {
    const {userDb, setLobby} = useContext(Context);

    const [lobbyCode, setLobbyCode] = useState("");
    const [displayError, setDisplayError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [tabIndex, setTabIndex] = useState(0);
    const [lobbyInvitesList, setLobbyInvitesList] = useState([
        { hostUuid: "123", hostUsername: "Host username", lobbyCode: "ABC123" }
    ]);

    const navigate = useNavigate();

    const backClick = () => {
        navigate("/home");
    }

    function handleTextFieldChange(event) {
        setLobbyCode(event.target.value);
    }

    async function handleJoinLobbyClick(e) {
        if (lobbyCode != "") {
            await getLobbyByCode(lobbyCode.toUpperCase())
                .then(async (lobby) => {
                    if (lobby) {
                        let currentNumberOfPlayers = lobby.players.length + lobby.spectators.length;
                        if (currentNumberOfPlayers >= LOBBY_LIMIT) {
                            setDisplayError(true);
                            setErrorMessage("Lobby is full!");
                        }
                        setLobby(lobby);
                        await joinSpectators(lobby, userDb.uuid, userDb.username);
                        navigate("/lobby/" + lobbyCode.toUpperCase(), { state: { isHost: false } });
                    }
                    else {
                        setDisplayError(true);
                        setErrorMessage("Invalid lobby code!");
                    }
                })
                .catch((error) => console.log(error));
        }
        else {
            setDisplayError(true);
            setErrorMessage("Invalid lobby code!");
        }
    }

    // Handles on-click to change tabs
    const handleChange = (event, newTabIndex) => {
        setTabIndex(newTabIndex);
    };

    // Renders the corresponding content depending on which tab is currently selected
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
                        <div className="flex flex-col space-y-2">
                            {lobbyInvitesList.map((lobbyInvite, index) => (
                                <Paper elevation={2} key={index} sx={{ height: "fit-content" }}>
                                    <div className="flex items-center justify-between h-fit p-4">
                                        <div className="flex flex-col">
                                            <Typography variant="subtitle1">{lobbyInvite.hostUsername}</Typography>
                                            <Typography variant="h5">Room Code: <b>{lobbyInvite.lobbyCode}</b></Typography>
                                        </div>
                                        <div className='flex space-x-2'>
                                            <Button variant="contained">Join</Button>
                                            <Button variant="outlined">Decline</Button>
                                        </div>
                                    </div>
                                </Paper>
                            ))}
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

    return (
        <Grid
            container
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: '100vh' }}
        >
            <Grid item xs={5}>
                {/* <div className="h-full flex flex-col items-center justify-center space-y-8">
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
                        className="w-[60%]"
                        sx={{ input: {textAlign: "center", fontSize: 40} }} />
                    <div className="flex justify-center space-x-12">
                        <Button variant="outlined" onClick={backClick}>Back</Button>
                        <Button variant="contained" onClick={handleJoinLobbyClick}>Join Lobby</Button>
                    </div>
                </div> */}
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
    )
}