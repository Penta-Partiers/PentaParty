import { Grid, Box } from '@mui/material';

import GameBoard from '../components/GameBoard';

export default function PlayerView() {
    return (
        <div className="min-h-screen flex justify-center items-center">
            <Grid
                container
                spacing={1}
                justifyContent="center"
                alignItems="flex-start"
            >
                <Grid item>
                    <GameBoard />
                </Grid>
                <Grid item>
                    {/* Temporary, scoreboard will be a separate component later */}
                    <Box width={200} height={200} className="border border-solid border-black">
                        (scores go here eventually)
                    </Box>
                </Grid>
            </Grid>
        </div>
    )
}