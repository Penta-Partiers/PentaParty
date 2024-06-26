// React
import { useState, useEffect, useContext } from "react";

// Routing
import { useNavigate } from "react-router-dom";

// Material UI
import { Button, Typography } from "@mui/material"
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Database
import { deleteLobby } from "../database/models/lobby";
import { getUser, updateHighScore } from "../database/models/user";

// User Context
import { Context } from "../auth/AuthContext";

// Util
import { compareScores } from "../util/util";

/**
 * This component renders the game summary page, which displays username of
 * the winner(s), as well as a list of each player's score.
 * 
 * ==> Functional requirement: FR22
 */
export default function GameSummary() {
    const { userDb, setUserDb, lobby, isHost } = useContext(Context);

    const [scoresList, setScoresList] = useState(null);
    const [winningPlayers, setWinningPlayers] = useState(null);

    const navigate = useNavigate();

    // Update player high scores and get winning players
    // ==> Functional requirement: FR22
    useEffect(() => {
        if (lobby) {
            let scoresList = Object.entries(lobby.players).map(([playerUuid, playerData]) => (
                {
                    uuid: playerUuid,
                    username: playerData.username,
                    score: playerData.score
                }
            ));
            setScoresList(scoresList);
        }
    }, [lobby]);

    // Get the usernames of the winning players
    // ==> Functional requirement: FR22
    useEffect(() => {
        if (scoresList) {
            // Find the highest score value
            // Reference: https://stackoverflow.com/questions/36941115/how-to-return-the-object-with-highest-value-from-an-array
            let highestScore = Math.max(...scoresList.map(p => p.score));
            let winners = scoresList
                .filter(p => p.score == highestScore)
                .map(p => p.username);
            setWinningPlayers(winners);
        }
    }, [scoresList]);

    // Update high scores in database
    // ==> Functional requirement: FR22
    useEffect(() => {
        async function updateHighScores() {
            // Only host updates the high scores
            if (scoresList && isHost) {
                scoresList.forEach(async player => {
                    await updateHighScore(player.uuid, player.score);
                })
            }
        }
        updateHighScores();
    }, [scoresList]);

    // Redirect back to home page
    // ==> Functional requirement: FR22
    const backClick = async () => {
        // Host deletes the lobby in the database
        if (isHost === "true") {
            await deleteLobby(lobby);
        }
        let updatedUser = await getUser(userDb.uuid);
        setUserDb(updatedUser);
        localStorage.setItem("lobby", null);
        localStorage.setItem("isHost", "false");
        navigate("/home");
    }

    // Display the winner / winners
    // ==> Functional requirement: FR22
    function renderWinners() {
        if (winningPlayers) {
            if (winningPlayers.length > 1) {
                return (
                    <div className="flex flex-col items-center">
                        <Typography variant="h4">Winners</Typography>
                        {winningPlayers.sort(compareScores).map((username, index) => (
                            <div key={index} className="flex space-x-2 items-center">
                                <EmojiEventsIcon sx={{ fontSize: 60 }}/>
                                <Typography variant="h4" className="text-center"><b>{username}</b></Typography>
                            </div>
                        ))}
                    </div>
                )
            }
            else {
                return (
                    <div className="flex flex-col items-center">
                        <Typography variant="h4">Winner</Typography>
                        <div className="flex space-x-2 items-center text-center">
                            <EmojiEventsIcon sx={{ fontSize: 60 }}/>
                            <Typography variant="h4"><b>{winningPlayers[0]}</b></Typography>
                        </div>
                    </div>
                )
            }
        }
    }

    // Render the winner / winners and the list of each player's score
    // ==> Functional requirement: FR22
    return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="flex flex-col items-center space-y-8 w-96">
                {renderWinners()}
                <div className="flex flex-col items-center w-full">
                    <div className="flex justify-between items-center w-full">
                        <Typography variant="h6"><b>Player</b></Typography>
                        <Typography variant="h6"><b>Score</b></Typography>
                    </div>
                    {scoresList && scoresList.sort(compareScores).map((data, index) => (
                        <div key={index} className="flex justify-between items-center w-full">
                            <Typography variant="h6">{data.username}</Typography>
                            <Typography variant="h6">{data.score}</Typography>
                        </div>
                    ))}
                </div>
                <Button variant="outlined" onClick={backClick}>Exit</Button>
            </div>
        </div>
    )
}