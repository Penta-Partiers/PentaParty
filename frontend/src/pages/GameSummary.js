// Routing
import { useNavigate } from "react-router-dom";

// Material UI
import { Button, Typography } from "@mui/material"
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function GameSummary() {
    const navigate = useNavigate();

    // Temporary results data
    const results = [
        {name: "player_01", score: 10000},
        {name: "player_02", score: 20000},
        {name: "player_03", score: 3000},
        {name: "player_04", score: 2000},
    ]

    // Finds the player with the highest score and returns their name
    function getWinningPlayerName(results) {
        return results.reduce((prev, current) => {
            return (prev && prev.score > current.score) ? prev : current
        }).name;
    }

    // Comparison function for sorting scores in descending order
    function compareScores(a, b) {
        const scoreA = a.score;
        const scoreB = b.score;
        if (scoreA < scoreB) {
            return 1;
        }
        if (scoreA > scoreB) {
            return -1;
        }
        return 0;
    }

    const backClick = () => {
        navigate("/home");
    }

    return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="flex flex-col items-center space-y-8 w-96">
                <div className="flex flex-col items-center">
                    <Typography variant="h4">Winner</Typography>
                    <div className="flex space-x-2 items-center">
                        <EmojiEventsIcon sx={{ fontSize: 60 }}/>
                        <Typography variant="h3"><b>{getWinningPlayerName(results)}</b></Typography>
                    </div>
                </div>
                <div className="flex flex-col items-center w-full">
                    <div className="flex justify-between items-center w-full">
                        <Typography variant="h6"><b>Player</b></Typography>
                        <Typography variant="h6"><b>Score</b></Typography>
                    </div>
                    {results.sort(compareScores).map((data, index) => (
                        <div key={index} className="flex justify-between items-center w-full">
                            <Typography variant="h6">{data.name}</Typography>
                            <Typography variant="h6">{data.score}</Typography>
                        </div>
                    ))}
                </div>
                <Button variant="outlined" onClick={backClick}>Exit</Button>
            </div>
        </div>
    )
}