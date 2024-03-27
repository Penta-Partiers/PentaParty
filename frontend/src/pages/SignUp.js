//@ts-check
// React
import React, { useState, useContext } from 'react';

// Routing
import { useNavigate } from "react-router-dom";

// Firebase
import {  createUserWithEmailAndPassword  } from 'firebase/auth';
import { auth } from '../firebase';
import { User, createUser } from "../database/models/user";

// Authentication
import { Context } from '../auth/AuthContext';

// Material UI
import { Grid, Typography, Box, TextField, Button } from '@mui/material';

// Utilities
import { validateEmail, validatePassword } from '../util/util';

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [invalidPassword, setInvalidPassword] = useState(false);
    const [emailHelperText, setEmailHelperText] = useState("Please enter a valid email.");

    const { setUser, setUserDb } = useContext(Context);
    const navigate = useNavigate();

    async function handleSignUpClick(e) {
        e.preventDefault()

        // If email or password is invalid, display an error around the text fields
        if (!validateEmail(email) || !validatePassword(password)) {
            setInvalidEmail(!validateEmail(email));
            setInvalidPassword(!validatePassword(password));
            setEmailHelperText("Please enter a valid email.");
            return;
        }
     
        await createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                setUser(userCredential.user);
                let userDb = new User(userCredential.user.uid, email, username);
                setUserDb(userDb);
                await createUser(userDb)
                    .then(() => navigate("/login"))
                    .catch((error) => console.log(error));
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage);
                setInvalidEmail(true);
                setEmailHelperText("This email is already in use.");
            });
    }

    // Update the email, username, and password while the user is typing
    function handleEmailChange(event) {
        setEmail(event.target.value);
    }
    function handleUsernameChange(event) {
        setUsername(event.target.value);
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
                        helperText={invalidEmail ? emailHelperText : ""}
                        sx={{ width: '80%' }} />
                    <TextField
                        label="Username"
                        value={username}
                        onChange={handleUsernameChange}
                        sx={{ width: '80%' }}/>
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