// React
import { useState, useCallback } from 'react';

// Routing
import { useNavigate } from "react-router-dom";

// Material UI
import { Grid, Tabs, Tab, Button, Paper, Typography, TextField, Alert, CircularProgress } from '@mui/material';

export default function JoinLobby() {
    const [lobbyCode, setLobbyCode] = useState("");
    const navigate = useNavigate();

    const backClick = () => {
        navigate("/home");
    }

    function handleTextFieldChange(event) {
        setLobbyCode(event.target.value);
    }

    function handleJoinLobbyClick(e) {
        // TODO: Verify valid lobby code
        navigate("/lobby/" + lobbyCode, { state: { isHost: false } });
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
                    <Typography variant="h4">Enter lobby code:</Typography>
                    <TextField 
                        onChange={handleTextFieldChange}
                        className="w-full" />
                    <div className="flex justify-center space-x-12">
                        <Button variant="outlined" onClick={backClick}>Back</Button>
                        <Button variant="contained" onClick={handleJoinLobbyClick}>Join Lobby</Button>
                    </div>
                </div>
            </Grid>
        </Grid>
    )
}