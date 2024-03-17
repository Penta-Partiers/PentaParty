//@ts-check
import React, { useState, useContext } from 'react';

import { useNavigate } from "react-router-dom";

import { Context } from '../auth/AuthContext';

import {  createUserWithEmailAndPassword  } from 'firebase/auth';
import { auth } from '../firebase';

import { Grid, Typography, Box, TextField, Button } from '@mui/material';

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { setUser } = useContext(Context);
    const navigate = useNavigate();

    async function handleSignUpClick(e) {
        e.preventDefault()
     
      await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // const user = userCredential.user;
            // console.log(user);
            setUser(userCredential.user);
            navigate("/home");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
        });
    }

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
            <Box 
                    width={400}
                    height={400}
                    display='flex'
                    flexDirection='column'
                    justifyContent='center'
                    alignItems='center'
                    sx={{ boxShadow: 2, borderRadius: '16px' }}
                >
                    <Typography variant="h4" sx={{ mb: 4 }}>Sign Up</Typography>
                    <TextField 
                        label="Email"
                        value={email}
                        onChange={handleEmailChange}
                        sx={{ width: '80%', mb: 2 }} />
                    <TextField 
                        label="Password" 
                        type="password" 
                        value={password}
                        onChange={handlePasswordChange}
                        sx={{ width: '80%', mb: 3 }} />
                    <Button 
                        variant="contained"
                        onClick={handleSignUpClick}
                        sx={{ mb: 1 }}>
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