// React
import { useState, useCallback } from 'react';

// Routing
import { useNavigate } from "react-router-dom";

// Material UI
import { Grid, Tabs, Tab, Button, Paper, Typography, TextField, Alert, CircularProgress } from '@mui/material';

// Utilities
import { validateEmail } from '../util/util';

export default function Friends() {
    const [tabIndex, setTabIndex] = useState(0);
    const [addFriendEmail, setAddFriendEmail] = useState("");
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [displaySuccessMessage, setDisplaySuccessMessage] = useState(false);
    const [hasNewFriends, setHasNewFriends] = useState(false);
    const [friendsList, setFriendsList] = useState(
        // Temporary friends list for testing
        [
            { id: 1, name: "friend_01" },
            { id: 2, name: "friend_02" },
            { id: 3, name: "friend_03" },
            { id: 4, name: "friend_04" },
        ]
    );
    const [pendingFriendsList, setPendingFriendsList] = useState(
        // Temporary pending friends list for testing
        [
            { id: 5, name: "friend_05" },
            { id: 6, name: "friend_06" },
            { id: 7, name: "friend_07" },
            { id: 8, name: "friend_08" },
        ]
    );

    const navigate = useNavigate();

    const handleChange = (event, newTabIndex) => {
        setTabIndex(newTabIndex);
    };

    const backClick = () => {
        navigate("/home");
    }

    // TODO: Currently modifies the temporary friends list for testing,
    // later this will interact with the backend/firebase to remove the friend
    function handleRemoveFriendClick(id) {
        setFriendsList(friendsList.filter(friend => friend.id !== id));
    }

    // TODO: Currently modifies the temporary friends and pending friends lists for testing,
    // later this will interact with the backend/firebase to accept the friend request and
    // add them to the user's friends list
    function handleAcceptFriendRequestClick(id) {
        let newFriend = pendingFriendsList.find(friend => friend.id === id)
        setHasNewFriends(true);
        setPendingFriendsList(pendingFriendsList.filter(friend => friend.id !== id));
        console.log([...friendsList, newFriend])
        setFriendsList([...friendsList, newFriend]);
    }

    // TODO: Currently doesn't do anything besides console.log(), later
    // this will interact with the backend/firebase to send the friend request
    function handleAddFriendClick(e) {
        if (!validateEmail(addFriendEmail)) {
            setInvalidEmail(true);
            setDisplaySuccessMessage(false);
        }
        else {
            // TODO: catch any firebase errors if the email doesn't exist in our system

            console.log("Sending friend request to " + addFriendEmail);
            setAddFriendEmail("");
            setDisplaySuccessMessage(true);
            setInvalidEmail(false);
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
                // TODO: If friend requests have been accepted from the pending friends tab,
                // re-fetch friends list from firebase/backend to update the friends list
                if (hasNewFriends) {
                    // TODO: Re-fetch friends list from backend
                    setHasNewFriends(false);
                }

                // If friends list has loaded, render it
                if (friendsList) {
                    content = (
                        <div className="flex flex-col space-y-2">
                            {friendsList.map((friend, index) => (
                                <Paper elevation={2} key={index} sx={{ minHeight: '50px' }}>
                                    <div className="flex items-center justify-between h-[50px] px-8">
                                        <Typography variant="h6" sx={{ overflow: 'auto', maxWidth: '200px' }}>{friend.name}</Typography>
                                        <Button variant="outlined" onClick={() => handleRemoveFriendClick(friend.id)}>Remove</Button>
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
                        {displaySuccessMessage && 
                            <Alert
                                severity="success"
                                onClose={() => setDisplaySuccessMessage(false)}
                            >
                                Friend request sent!
                            </Alert>
                        }
                        <Typography variant="h5">Enter friend email:</Typography>
                        <TextField 
                            className="w-full"
                            value={addFriendEmail}
                            error={invalidEmail}
                            helperText={invalidEmail ? "Please enter a valid email." : ""}
                            onChange={handleAddFriendTextFieldChange} />
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
                            {pendingFriendsList.map((friend, index) => (
                                <Paper elevation={2} key={index} sx={{ minHeight: '50px' }}>
                                    <div className="flex items-center justify-between h-[50px] px-8">
                                        <Typography variant="h6" sx={{ overflow: 'auto', maxWidth: '200px' }}>{friend.name}</Typography>
                                        <Button variant="outlined" onClick={() => handleAcceptFriendRequestClick(friend.id)}>Accept</Button>
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

        return (
            <div className="h-80 w-[75%] overflow-auto p-1">
                {content}
            </div>
        )
    }, [tabIndex, friendsList, addFriendEmail, invalidEmail, displaySuccessMessage, pendingFriendsList, hasNewFriends])

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
                        <Tabs value={tabIndex} onChange={handleChange} variant='fullWidth' centered className="w-full">
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