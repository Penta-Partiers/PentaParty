import { Grid, Box, Typography } from '@mui/material';

import GameBoard from '../components/GameBoard';

export default function PlayerView() {
    // Temporary variable for testing the scoreboard display
    const playerScores = [
        ["player_01", 1000],
        ["player_02", 2000],
        ["player_03", 3000],
        ["player_04", 4000],
    ];

    return (
        <div className="min-h-screen flex justify-center items-center">
            <Grid
                container
                spacing={3}
                justifyContent="center"
                alignItems="flex-start"
            >
                <Grid item>
                    <GameBoard />
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
                        sx={{ boxShadow: 3, borderRadius: '16px' }}
                    >
                        <Typography variant="h4">Scoreboard</Typography>
                        {playerScores.map((data, index) => (
                            <div key={index} className="flex justify-between gap-3">
                                <div><b>{data[0]}:</b></div>
                                <div>{data[1]}</div>
                            </div>
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </div>
    )
}