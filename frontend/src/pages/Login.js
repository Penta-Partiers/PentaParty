//@ts-check
import React, { useState, useContext } from 'react';

import { useNavigate } from "react-router-dom";

import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

import { Context } from '../auth/AuthContext';

import { Grid, Typography, Box, TextField, Button } from '@mui/material';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { setUser } = useContext(Context);
    const navigate = useNavigate();

    function handleLoginClick(e) {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // const user = userCredential.user;
            // console.log(user);
            setUser(userCredential.user);
            navigate("/home");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
        });
    }

    function handleEmailChange(event) {
        setEmail(event.target.value);
    }

    function handlePasswordChange(event) {
        setPassword(event.target.value);
    }

    const signInWithGoogle = async () => {
        try {
        await signInWithPopup(auth,googleProvider);
        } catch (err){
          console.error(err);
        }
      };

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
                    height={400}
                    display='flex'
                    flexDirection='column'
                    justifyContent='center'
                    alignItems='center'
                    sx={{ boxShadow: 2, borderRadius: '16px' }}
                >
                    <Typography variant="h4" sx={{ mb: 4 }}>Login</Typography>
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
                        onClick={handleLoginClick}
                        sx={{ mb: 1 }}>
                            Log In
                    </Button>
                    <Button 
                        variant="outlined"
                        href="/signup">
                            Sign Up
                    </Button>
                    <Button onClick={signInWithGoogle}> Signin with google</Button>
                </Box>
            </Grid>
        </Grid>
    )
}