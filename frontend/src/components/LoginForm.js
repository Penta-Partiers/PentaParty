import { Box, TextField, Typography, Button } from '@mui/material';

export default function LoginForm() {
    return (
        <Box 
            width={400}
            height={400}
            display='flex'
            flexDirection='column'
            justifyContent='center'
            alignItems='center'
            sx={{ boxShadow: 2, borderRadius: '16px' }}
        >
            <Typography variant="h4" sx={{ mb: 4 }}>Login</Typography>
            <TextField label="Username" sx={{ width: '80%', mb: 2 }} />
            <TextField label="Password" type="password" sx={{ width: '80%', mb: 3 }} />
            <Button variant="contained" sx={{ mb: 1 }}>Login</Button>
            <Button variant="outlined">Sign Up</Button>
        </Box>
    )
}