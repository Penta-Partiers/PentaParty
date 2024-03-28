// Material UI
import { Grid, Box, Typography, Button } from '@mui/material';

// Components
import GameBoard from '../components/GameBoard';

// Custom hooks / game logic
import { useGame } from '../tetris/useGame';

// Websockets
import useWebSocket from 'react-use-websocket';

// Environment variables
import { getEnvOrExit } from '../config.js';

export default function PlayerView() {
    const { startGame, board, score, currentColor } = useGame();

    const wsPort = getEnvOrExit("REACT_APP_WS_PORT");

    // TODO: set up websocket connection
    const { sendJsonMessage, readyState } = useWebSocket(
        "ws://localhost:" + wsPort,
        {
            onOpen: () => {
                console.log("WebSocket connection established!");
            },
        }
    )

    return (
        <div className="min-h-screen flex justify-center items-center">
            <Grid
                container
                spacing={3}
                justifyContent="center"
                alignItems="flex-start"
            >
                <Grid item>
                    <GameBoard boardState={board} currentColor={currentColor} />
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
                        <div className="flex justify-between w-full">
                            <div><b>Player:</b></div>
                            <div>{score}</div>
                        </div>
                    </Box>
                    <Button onClick={startGame}>Start Game</Button>
                </Grid>
            </Grid>
        </div>
    )
}