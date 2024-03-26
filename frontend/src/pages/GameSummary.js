// Material UI
import { Button, Typography } from "@mui/material"
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function GameSummary() {
    const results = [
        {name: "player_01", score: 10000},
        {name: "player_02", score: 1000},
        {name: "player_03", score: 3000},
        {name: "player_04", score: 2000},
    ]

    return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="flex flex-col items-center space-y-8 w-96">
                <div className="flex flex-col items-center">
                    <Typography variant="h4">Winner</Typography>
                    <div className="flex space-x-2 items-center">
                        <EmojiEventsIcon sx={{ fontSize: 60 }}/>
                        <Typography variant="h3"><b>player_01</b></Typography>
                    </div>
                </div>
                <div className="flex flex-col items-center w-full">
                    <div className="flex justify-between items-center w-full">
                        <Typography variant="h6"><b>Player</b></Typography>
                        <Typography variant="h6"><b>Score</b></Typography>
                    </div>
                </div>
                <Button variant="outlined">Exit</Button>
            </div>
        </div>
    )
}