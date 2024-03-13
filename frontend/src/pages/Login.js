import { Grid, Typography } from '@mui/material';
import LoginForm from '../components/LoginForm';

export default function Login() {
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
                <Typography variant="h2" textAlign={"center"} sx={{ my: 2 }}>PentaParty</Typography>
                <LoginForm />
            </Grid>
        </Grid>
    )
}