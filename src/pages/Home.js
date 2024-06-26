// React
import { useState, useContext } from "react";

// User Context
import { Context } from "../auth/AuthContext";

// Routing
import { useNavigate } from "react-router-dom";

// Authentication
import { signOut, getAuth } from "firebase/auth";

// Database
import { Lobby, createLobby, isLobbyCodeExist, joinSpectators } from "../database/models/lobby";

// Util
import { generateLobbyCode } from "../util/util";

// Material UI
import { Typography, Button, LinearProgress, Box } from '@mui/material';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import VideogameAssetOutlinedIcon from '@mui/icons-material/VideogameAssetOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';

/**
 * This component renders the home page, where users can:
 *  - see their highest score,
 *  - create a new lobby,
 *  - go to the join lobby page,
 *  - or go to the friends page.
 * 
 * ==> Functional Requirements: FR2, FR3, FR4, FR5, FR6, FR8, FR9, FR10
 */
export default function Home() {
    const {userDb, setLobby, setIsHost} = useContext(Context);

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Signs the user out of PentaParty
    // ==> Functional Requirement: FR2
    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth)
            .then(() => navigate("/login"))
            .catch((error) => console.error(error));
    }

    // Define each button's icon, label, and on-click behaviour
    // ==> Functional Requirements: FR3, FR4, FR5, FR8, FR9, FR10
    const mainButtonsList = [
        // Create Lobby button
        // ==> Functional Requirement: FR8
        {
            icon: <AddBoxOutlinedIcon sx={{ fontSize: 70 }}/>,
            label: "Create Lobby",
            onClick: async () => {
                setLoading(true);
                
                var lobbyCode = generateLobbyCode();
                while ((await isLobbyCodeExist(lobbyCode)) == true) {
                    lobbyCode = generateLobbyCode();
                }

                let lobby = new Lobby(lobbyCode, userDb.uuid);

                await createLobby(lobby)
                    .then(async () => {
                        setLobby(lobby);
                        setIsHost("true");
                        localStorage.setItem("lobby", JSON.stringify(lobby));
                        localStorage.setItem("isHost", "true");
                        await joinSpectators(lobby, userDb.uuid, userDb.username);
                        setLoading(false);
                        navigate("/lobby/" + lobbyCode);
                    })
                    .catch((e) => {
                        console.log(e);
                        setLoading(false);
                    });
            },
        },
        // Join Lobby button
        // ==> Functional Requirements: FR9, FR10
        {
            icon: <VideogameAssetOutlinedIcon sx={{ fontSize: 70 }}/>,
            label: "Join Lobby",
            onClick: () => {
                navigate("/join-lobby");
            },
        },
        // Friends button
        // ==> Functional Requirements: FR3, FR4, FR5
        {
            icon: <PeopleOutlineIcon sx={{ fontSize: 70 }}/>,
            label: "Friends",
            onClick: () => {
                navigate("/friends");
            },
        }
    ]

    // Renders the home page
    // ==> Functional Requirements: FR3, FR4, FR5, FR8, FR9, FR10
    return (
        <div className="h-screen overflow-hidden">
            { loading && (
                <Box sx={{ width: '100%' }}>
                    <LinearProgress />
                </Box>
            )}
            <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center space-y-10">
                    <div className="flex flex-col items-center">
                        <Typography variant="h4">Highest Score</Typography>
                        <Typography variant="h2">{userDb ? userDb.highScore : 0}</Typography>
                    </div>
                    <div className="flex justify-center space-x-20">
                        {mainButtonsList.map((data, index) => (
                            <div key={index} className="flex flex-col items-center space-y-2">
                                <Button 
                                    variant="outlined" 
                                    onClick={data.onClick}
                                    sx={{ borderRadius: 4 }} 
                                    className="w-[100px] aspect-square flex items-center justify-center">
                                    {data.icon}
                                </Button>
                                <Typography variant="subtitle1">{data.label}</Typography>
                            </div>
                        ))}
                    </div>
                    <Button variant="outlined" onClick={handleSignOut}>Sign Out</Button>
                </div>
            </div>
        </div>
    )
}