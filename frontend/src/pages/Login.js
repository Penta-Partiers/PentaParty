//@ts-check
// React
import React, { useState, useContext } from 'react';

// Routing
import { useNavigate } from "react-router-dom";

// Firebase
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { User, createUser, getUser } from "../database/models/user";

// Authentication
import { Context } from '../auth/AuthContext';

// Material UI
import { Grid, Typography, Box, TextField, Button, Alert, Divider } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

export default function Login() {
    const { setUser, setUserDb } = useContext(Context);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayErrorMessage, setDisplayErrorMessage] = useState(false);

    const navigate = useNavigate();

    function handleLoginClick(e) {
        e.preventDefault();

        signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            await getUser(userCredential.user.uid)
                .then((userDb) => {
                    setUser(userCredential.user);
                    setUserDb(userDb);
                    navigate("/home");
                })
                .catch((error) => console.log(error));
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)

            // If the credentials are invalid, display the error alert
            setDisplayErrorMessage(true);
        });
    }

    // Update the email and password while the user is typing
    function handleEmailChange(event) {
        setEmail(event.target.value);
    }
    function handlePasswordChange(event) {
        setPassword(event.target.value);
    }

    const signInWithGoogle = async () => {
        try {
            signInWithPopup(auth, googleProvider)
            .then(async (userCredential) => {
                await getUser(userCredential.user.uid)
                    .then(async (userDb) => {
                        // User hasn't been added to db yet, so do that first
                        if (userDb == null) {
                            userDb = new User(userCredential.user.uid, userCredential.user.email, userCredential.user.displayName);
                            await createUser(userDb)
                                .then(() => {
                                    setUser(userCredential.user);
                                    setUserDb(userDb);
                                    navigate("/home");
                                })
                                .catch((error) => console.log(error));
                        }
                        // Otherwise, User already exists in the database
                        else {
                            setUser(userCredential.user);
                            setUserDb(userDb);
                            navigate("/home");
                        }
                    })
                    .catch((error) => console.log(error));
            })
        } 
        catch (err) {
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
                    height={"auto"}
                    display='flex'
                    flexDirection='column'
                    justifyContent='center'
                    alignItems='center'
                    gap={2}
                    sx={{ py: 4, boxShadow: 2, borderRadius: '16px' }}
                >
                    <Typography variant="h4">Login</Typography>

                    {displayErrorMessage &&
                        <Alert 
                            severity='error'
                            onClose={() => setDisplayErrorMessage(false)}
                            sx={{ width: '72%' }}
                        >
                            Invalid credentials. Please enter a valid email and password.
                        </Alert>
                    }

                    <TextField 
                        label="Email"
                        value={email}
                        onChange={handleEmailChange}
                        
                        sx={{ width: '80%' }} />
                    <TextField 
                        label="Password" 
                        type="password" 
                        value={password}
                        onChange={handlePasswordChange}
                        sx={{ width: '80%' }} />

                    <Button 
                        variant="contained" 
                        onClick={handleLoginClick}
                        sx={{}}>
                            Log In
                    </Button>
                    <Button 
                        variant="outlined"
                        href="/signup">
                            Sign Up
                    </Button>

                    <Divider sx={{ width: '80%' }} />

                    <Button variant="outlined" startIcon={<GoogleIcon />} onClick={signInWithGoogle}>Sign In with Google</Button>
                </Box>
            </Grid>
        </Grid>
    )
}