// React
import { useContext } from "react";

// User Context
import { Context } from "../auth/AuthContext";

// Routing
import { useNavigate } from "react-router-dom";

// Authentication
import { signOut, getAuth } from "firebase/auth";

// Database
import { Lobby, createLobby } from "../database/models/lobby";

// Util
import { generateLobbyCode } from "../util/util";

// Material UI
import { Typography, Button } from '@mui/material';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import VideogameAssetOutlinedIcon from '@mui/icons-material/VideogameAssetOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';

export default function Home() {
    const {userDb, setLobby} = useContext(Context);

    const navigate = useNavigate();

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth)
            .then(() => navigate("/login"))
            .catch((error) => console.error(error));
    }

    const mainButtonsList = [
        {
            icon: <AddBoxOutlinedIcon sx={{ fontSize: 70 }}/>,
            label: "Create Lobby",
            onClick: async () => {
                console.log("clicked create lobby button")
                // TODO: figure out how to send invites to friends
                var lobbyCode = generateLobbyCode();
                let lobby = new Lobby(lobbyCode, userDb.uuid, null, null, [{uuid: userDb.uuid, username: userDb.username}], false);
                await createLobby(lobby)
                    .then(() => {
                        setLobby(lobby);
                        navigate("/lobby/" + lobbyCode, { state: { isHost: true } });
                    })
                    .catch((e) => console.log(e));
            },
        },
        {
            icon: <VideogameAssetOutlinedIcon sx={{ fontSize: 70 }}/>,
            label: "Join Lobby",
            onClick: () => {
                navigate("/join-lobby");
            },
        },
        {
            icon: <PeopleOutlineIcon sx={{ fontSize: 70 }}/>,
            label: "Friends",
            onClick: () => {
                navigate("/friends");
            },
        }
    ]

    return (
        <div className="h-screen flex items-center justify-center">
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
    )
}