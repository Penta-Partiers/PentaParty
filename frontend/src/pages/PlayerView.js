import { Grid, Box, Typography, Button } from '@mui/material';

import GameBoard from '../components/GameBoard';
import { useGame } from '../tetris/useGame';

export default function PlayerView() {
    const { startGame, board, score, currentColor } = useGame();

    return (
        <div className="min-h-screen flex justify-center items-center">
            <Grid
                container
                spacing={3}
                justifyContent="center"
                alignItems="flex-start"
            >
                <Grid item>
                    {board && <GameBoard boardState={board} currentColor={currentColor} />}
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