//@ts-check
// React
import React, { useState, useContext } from 'react';

// Routing
import { useNavigate } from "react-router-dom";

// Firebase
import {  createUserWithEmailAndPassword  } from 'firebase/auth';
import { auth } from '../firebase';

// Authentication
import { Context } from '../auth/AuthContext';

// Material UI
import { Grid, Typography, Box, TextField, Button } from '@mui/material';

// Utilities
import { validateEmail, validatePassword } from '../util/util';

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [invalidPassword, setInvalidPassword] = useState(false);
    const { setUser } = useContext(Context);
    const navigate = useNavigate();

    async function handleSignUpClick(e) {
        e.preventDefault()

        // If email or password is invalid, display an error around the text fields
        if (!validateEmail(email) || !validatePassword(password)) {
            setInvalidEmail(!validateEmail(email));
            setInvalidPassword(!validatePassword(password));
            return;
        }
     
        await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                setUser(userCredential.user);
                navigate("/home");
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage);
            });
    }

    // Update the email and password while the user is typing
    function handleEmailChange(event) {
        setEmail(event.target.value);
    }
    function handlePasswordChange(event) {
        setPassword(event.target.value);
    }

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
                <Box 
                    width={400}
                    height={"auto"}
                    display='flex'
                    flexDirection='column'
                    justifyContent='center'
                    alignItems='center'
                    gap={2}
                    sx={{ py: 4, boxShadow: 2, borderRadius: '16px' }}
                >
                    <Typography variant="h4">Sign Up</Typography>

                    <TextField 
                        label="Email"
                        value={email}
                        onChange={handleEmailChange}
                        error={invalidEmail}
                        helperText={invalidEmail ? "Please enter a valid email." : ""}
                        sx={{ width: '80%' }} />
                    <TextField 
                        label="Password" 
                        type="password" 
                        value={password}
                        error={invalidPassword}
                        helperText={invalidPassword ? "A valid password must have at least 6 characters." : ""}
                        onChange={handlePasswordChange}
                        sx={{ width: '80%' }} />

                    <Button 
                        variant="contained"
                        onClick={handleSignUpClick}
                    >
                            Sign up
                    </Button>
                    <Button 
                        variant="outlined"
                        href="/login">
                            Back to login
                    </Button>
                </Box>
            </Grid>
        </Grid>
    )
}