import { Grid, CircularProgress } from '@mui/material';

// Displays a loading progress circle while user data is being fetched or processed
// Functional Requirement: FR1, FR2
export default function Loading() {
    return (
        <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: '100vh' }}
        >
            <Grid item xs={3}>
                <CircularProgress />
            </Grid>
        </Grid>
    )
}