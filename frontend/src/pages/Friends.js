// React
import { useState, useCallback, useContext, useEffect } from 'react';

// User Context
import { Context } from "../auth/AuthContext";

// Database
import { db } from "../firebase.js";
import { doc, onSnapshot } from "firebase/firestore";
import { User, addFriend, addPendingFriend, getUser, getUuidByEmail, removeFriend, removePendingFriend } from '../database/models/user';

// Routing
import { useNavigate } from "react-router-dom";

// Material UI
import { Grid, Tabs, Tab, Button, Paper, Typography, TextField, Alert, CircularProgress } from '@mui/material';

// Utilities
import { validateEmail } from '../util/util';

export default function Friends() {
    const {userDb, setUserDb} = useContext(Context);

    const [tabIndex, setTabIndex] = useState(0);
    const [addFriendEmail, setAddFriendEmail] = useState("");
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [displaySuccessMessage, setDisplaySuccessMessage] = useState(false);
    const [friendsList, setFriendsList] = useState(null);
    const [pendingFriendsList, setPendingFriendsList] = useState(null);
    const [loadingAddFriendResult, setLoadingAddFriendResult] = useState(false);
    const [displayAddFriendError, setDisplayAddFriendError] = useState(false);
    const [addFriendErrorMessage, setAddFriendErrorMessage] = useState("");

    // Listen to real-time updates for the user
    // Reference: https://stackoverflow.com/questions/59944658/which-react-hook-to-use-with-firestore-onsnapshot
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "user", userDb.uuid), async (doc) => {
            let userUpdate = User.fromFirestore(doc);
            setUserDb(userUpdate);

            let friendsRenderList = await Promise.all(userUpdate.friends.map(async (friendUuid) => {
                return await getUser(friendUuid)
                    .then((friend) => ({ uuid: friend.uuid, username: friend.username }))
                    .catch((error) => console.log(error));
            }));
            setFriendsList(friendsRenderList);

            let pendingFriendsRenderList = await Promise.all(userUpdate.pendingFriends.map(async (pendingFriendUuid) => {
                return await getUser(pendingFriendUuid)
                    .then((pendingFriend) => ({ uuid: pendingFriend.uuid, username: pendingFriend.username }))
                    .catch((error) => console.log(error));
            }));
            setPendingFriendsList(pendingFriendsRenderList);
        });
        return () => unsubscribe();
    }, []);

    const navigate = useNavigate();

    const handleChange = (event, newTabIndex) => {
        setTabIndex(newTabIndex);
    };

    const backClick = () => {
        navigate("/home");
    }

    async function handleRemoveFriendClick(friendUuid) {
        // Remove friend from current user's friends list
        await removeFriend(userDb, friendUuid);

        // Remove current user from friend's friends list
        await getUser(friendUuid)
            .then(async (friend) => await removeFriend(friend, userDb.uuid));
    }

    async function handleAcceptFriendRequestClick(requesterUuid) {
        // Add requester to current user's friends list and clear them from their pending list
        await addFriend(userDb, requesterUuid);
        await removePendingFriend(userDb, requesterUuid);

        // Add the current user to the requester's friends list and clear them from their pending list
        await getUser(requesterUuid)
            .then(async (requester) => {
                await addFriend(requester, userDb.uuid);
                await removePendingFriend(requester, userDb.uuid);
            });
    }

    async function handleDeclineFriendRequestClick(requesterUuid) {
        await removePendingFriend(userDb, requesterUuid);
    }

    async function handleAddFriendClick(e) {
        // Display an error alert if email is not a properly-formatted email
        if (!validateEmail(addFriendEmail)) {
            setInvalidEmail(true);
            setDisplaySuccessMessage(false);
        }
        else {
            // Prevent user from sending a friend request to themself
            if (addFriendEmail == userDb.email) {
                setAddFriendEmail("");
                setInvalidEmail(false);
                setDisplayAddFriendError(true);
                setAddFriendErrorMessage("Can't send friend request to yourself!");
                return;
            }
            setLoadingAddFriendResult(true);
            // Check if the email exists in our database, and if it does, send them a friend request
            await getUuidByEmail(addFriendEmail)
                .then(async (pendingFriendUuid) => {
                    // If email does not exist in our database, display an error alert and clear the textfield
                    if (!pendingFriendUuid) {
                        setAddFriendEmail("");
                        setDisplayAddFriendError(true);
                        setInvalidEmail(false);
                        setAddFriendErrorMessage("User not found!");
                    }
                    // Prevent user from sending a friend request to an existing friend
                    else if (userDb.friends.find(f => f == pendingFriendUuid)) {
                        setAddFriendEmail("");
                        setDisplayAddFriendError(true);
                        setInvalidEmail(false);
                        setAddFriendErrorMessage("User already in friends list!");
                    }
                    else {
                        await addPendingFriend(userDb, pendingFriendUuid)
                        .then(() => {
                            // Clear the email text field and display a success message
                            setAddFriendEmail("");
                            setDisplaySuccessMessage(true);
                            setInvalidEmail(false);
                        })
                        .catch((e) => console.log(e));
                    }
                    setLoadingAddFriendResult(false);
                })
                .catch((e) => console.log(e));
        }
    }

    function handleAddFriendTextFieldChange(event) {
        setAddFriendEmail(event.target.value);
    }

    // Renders the corresponding content depending on which tab is currently selected
    const renderTabContent = useCallback(() => {
        let content = null;

        switch (tabIndex) {
            // Friends List tab content
            case 0:
                // If friends list has loaded, render it
                if (friendsList) {
                    content = (
                        <div className="flex flex-col space-y-2">
                            {friendsList.map((friend, index) => (
                                <Paper elevation={2} key={index} sx={{ height: "fit-content" }}>
                                    <div className="flex items-center justify-between h-fit p-4">
                                        <Typography variant="h6" sx={{ overflow: 'auto', maxWidth: '200px' }}>{friend.username}</Typography>
                                        <Button variant="outlined" onClick={() => handleRemoveFriendClick(friend.uuid)}>Remove</Button>
                                    </div>
                                </Paper>
                            ))}
                        </div>
                    )
                }
                // Otherwise, display a loading progress circle
                else {
                    content = (
                        <div className="h-full flex justify-center items-center">
                            <CircularProgress />
                        </div>
                    )
                }

                break;

            // Add Friend tab content
            case 1:
                content = (
                    <div className="h-full flex flex-col items-center justify-center space-y-3">
                        {loadingAddFriendResult &&
                            <CircularProgress />
                        }
                        {displaySuccessMessage && 
                            <Alert
                                severity="success"
                                onClose={() => setDisplaySuccessMessage(false)}
                            >
                                Friend request sent!
                            </Alert>
                        }
                        {displayAddFriendError &&
                            <Alert
                                severity="error"
                                onClose={() => setDisplayAddFriendError(false)}>
                                {addFriendErrorMessage}
                            </Alert>
                        }
                        <Typography variant="h5">Enter friend email:</Typography>
                        <TextField 
                            className="w-full"
                            value={addFriendEmail}
                            error={invalidEmail}
                            helperText={invalidEmail ? "Please enter a valid email." : ""}
                            onChange={handleAddFriendTextFieldChange}
                            sx={{ input: {textAlign: "center", fontSize: 30} }} />
                        <Button variant="contained" onClick={handleAddFriendClick}>Send Request</Button>
                    </div>
                )
                break;

            // Pending Friends tab content
            case 2:
                // If pending friends list has loaded, render it
                if (pendingFriendsList) {
                    content = (
                        <div className="flex flex-col space-y-2">
                            {pendingFriendsList.map((pendingFriend, index) => (
                                <Paper elevation={2} key={index} sx={{ height: "fit-content" }}>
                                    <div className="flex items-center justify-between h-fit p-4">
                                        <Typography variant="h6" sx={{ overflow: 'auto', maxWidth: '200px' }}>{pendingFriend.username}</Typography>
                                        <div className='flex space-x-2'>
                                            <Button variant="contained" onClick={() => handleAcceptFriendRequestClick(pendingFriend.uuid)}>Accept</Button>
                                            <Button variant="outlined" onClick={() => handleDeclineFriendRequestClick(pendingFriend.uuid)}>Decline</Button>
                                        </div>
                                    </div>
                                </Paper>
                            ))}
                        </div>
                    )
                }
                // Otherwise, display a loading progress circle
                else {
                    content = (
                        <div className="h-full flex justify-center items-center">
                            <CircularProgress />
                        </div>
                    )
                }
                break;
            
            // Debugging: this shouldn't happen
            default:
                console.error("Invalid tab index selected");
                content = null;
        }

        // For the friends list and pending friends list, add a grey background
        const backgroundColor = (tabIndex == 0 || tabIndex == 2) ? "bg-slate-300 border border-slate-300" : "";

        return (
            <div className={"h-80 w-full overflow-auto p-1 " + backgroundColor}>
                {content}
            </div>
        )
    }, [tabIndex, friendsList, 
        addFriendEmail, invalidEmail, 
        displaySuccessMessage, pendingFriendsList, 
        displayAddFriendError, loadingAddFriendResult])

    return (
        <Grid
            container
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: '100vh' }}
        >
            <Grid item xs={5}>
                <div className="flex flex-col items-center w-full space-y-6">
                    <div className="flex justify-center w-full">
                        <Tabs value={tabIndex} onChange={handleChange} variant='fullWidth' centered className="w-full border">
                            <Tab label="Friends List" />
                            <Tab label="Add Friend" />
                            <Tab label="Pending Friends" />
                        </Tabs>
                    </div>
                    { renderTabContent() }
                    <Button variant="outlined" onClick={backClick}>Back</Button>
                </div>
            </Grid>
        </Grid>
    )
}