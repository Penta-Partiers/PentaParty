// React
import { useState, useContext } from 'react';

// Routing
import { useNavigate } from "react-router-dom";

// Material UI
import { Grid, Button, Typography, TextField, Alert } from '@mui/material';

// User Context
import { Context } from "../auth/AuthContext";

// Database
import { getLobbyByCode, joinSpectators } from '../database/models/lobby';

export default function JoinLobby() {
    const {userDb, setLobby} = useContext(Context);

    const [lobbyCode, setLobbyCode] = useState("");
    const [displayError, setDisplayError] = useState(false);

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
                        setLobby(lobby);
                        await joinSpectators(lobby, userDb.uuid, userDb.username);
                        navigate("/lobby/" + lobbyCode.toUpperCase(), { state: { isHost: false } });
                    }
                    else {
                        setDisplayError(true);
                    }
                })
                .catch((error) => console.log(error));
        }
    }

    return (
        <Grid
            container
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: '100vh' }}
        >
            <Grid item xs={5}>
                <div className="h-full flex flex-col items-center justify-center space-y-8">
                    {displayError && 
                        <Alert
                            severity="error"
                            onClose={() => setDisplayError(false)}>
                            Invalid lobby code!
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
                </div>
            </Grid>
        </Grid>
    )
}