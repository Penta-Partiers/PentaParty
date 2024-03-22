// React
import { useState } from 'react';

// Routing
import { useLocation, useNavigate } from 'react-router-dom';

// Material UI
import { Grid, Button, Paper, Typography, Modal } from '@mui/material';

export default function Lobby() {
    const {state} = useLocation();
    const navigate = useNavigate();

    const [isHost, setIsHost] = useState(state.isHost)
    const [roomCode, setRoomCode] = useState("ABC123");
    const [modalOpen, setModalOpen] = useState(false);

    const playersList = [
        "player_01",
        "player_02",
        "player_03",
        "player_04",
    ];

    const spectatorsList = [
        "spectator_01",
        "spectator_02",
        "spectator_03",
        "spectator_04",
        "spectator_05",
        "spectator_06",
        "spectator_07",
        "spectator_08",
    ];

    const friendsList = [
        "friend_01",
        "friend_02",
        "friend_03",
        "friend_04",
        "friend_05",
        "friend_06",
        "friend_07",
    ]

    return (
        <Grid
            container
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: '100vh' }}
        >
            <Grid item xs={7}>
                <div className='flex flex-col items-center w-full p-2 space-y-8'>
                    <Typography variant='h4'><b>Room Code:</b> {roomCode}</Typography>

                    <Modal
                        open={modalOpen}
                        onClose={() => setModalOpen(false)}
                        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <div className='flex flex-col items-center bg-white w-96 h-fit p-6 space-y-4'>
                            <Typography variant="h4"><b>Invite</b></Typography>
                            <div className='flex flex-col items-center bg-slate-300 h-80 w-full p-2 overflow-auto space-y-2 border border-slate-300'>
                                {friendsList.map((name, index) => (
                                    <Paper elevation="2" key={index} sx={{ minHeight: "50px", width: "100%" }}>
                                        <div className="flex items-center justify-between h-[50px] px-3">
                                            <Typography variant="subtitle1" sx={{ overflow: 'auto', maxWidth: '200px' }}>{name}</Typography>
                                            <Button variant="outlined" size='small'>Invite</Button>
                                        </div>
                                    </Paper>
                                ))}
                            </div>
                            <Button variant="contained" onClick={() => setModalOpen(false)}>Done</Button>
                        </div>
                    </Modal>

                    <div className='flex justify-center w-full space-x-4'>
                        <div className='flex flex-col items-center w-1/2 space-y-2 p-2'>
                            <Typography variant="h5"><b>Players</b></Typography>
                            <div className='flex flex-col items-center h-80 w-full bg-slate-300 overflow-auto p-2 space-y-2 border border-slate-300'>
                                {playersList.map((name, index) => (
                                    <Paper elevation="2" key={index} sx={{ minHeight: "50px", width: "100%" }}>
                                        <div className='flex items-center justify-center h-full'>
                                            <Typography variant="h6">{name}</Typography>
                                        </div>
                                    </Paper>
                                ))}
                            </div>
                            <Button variant="contained">Join Players</Button>
                        </div>
                        <div className='flex flex-col items-center w-1/2 space-y-2 p-2'>
                            <Typography variant="h5"><b>Spectators</b></Typography>
                            <div className='flex flex-col items-center h-80 w-full bg-slate-300 overflow-auto p-2 space-y-2 border border-slate-300'>
                                {spectatorsList.map((name, index) => (
                                    <Paper elevation="2" key={index} sx={{ minHeight: "50px", width: "100%" }}>
                                        <div className='flex items-center justify-center h-full'>
                                            <Typography variant="h6">{name}</Typography>
                                        </div>
                                    </Paper>
                                ))}
                            </div>
                            <Button variant="contained">Join Spectators</Button>
                        </div>
                    </div>

                    <div className='flex items-center justify-between w-full'>
                        <div className="w-[100px]">
                            <Button variant="outlined" fullWidth="true" onClick={() => setModalOpen(true)}>Invite</Button>
                        </div>
                        <div className="w-[100px]">
                            {isHost && <Button variant="contained" size="large" fullWidth="true">Start</Button>}
                        </div>
                        <div className="w-[100px]">
                            <Button variant="outlined" fullWidth="true" onClick={() => navigate("/home")}>Leave</Button>
                        </div>
                    </div>
                </div>
            </Grid>
        </Grid>
    )
}