import { Grid, Box, Typography } from '@mui/material';

import GameBoard from '../components/GameBoard';
import { useGame } from '../tetris/useGame';

const NUM_ROWS = 25;
const NUM_COLS = 13;

export default function PlayerView() {
    [
        startGame,
        board,
        score,
        gameEnded,
        onKeyDown,
        onKeyUp,
    ] = useGame();

    // Temporary variable for testing the scoreboard display
    const playerScores = [
        ["player_01", 10000],
        ["player_02", 2000],
        ["player_03", 3000],
        ["player_04", 4000],
    ];

    // Temporary variable for testing the board and setting colors
    // const board = new Array(NUM_ROWS)
    // for (let i = 0; i < board.length; i++) {
    //     board[i] = new Array(NUM_COLS).fill(0)
    // }
    // board[0][0] = 2;
    // board[0][1] = 1;

    return (
        <div className="min-h-screen flex justify-center items-center">
            <Grid
                container
                spacing={3}
                justifyContent="center"
                alignItems="flex-start"
            >
                <Grid item>
                    {!gameEnded && <GameBoard boardState={board} />}
                    {gameEnded && <div>Game has ended!</div>}
                </Grid>
                <Grid item>
                    <Box 
                        width={250} 
                        height={250} 
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        gap={1}
                        sx={{ boxShadow: 3, borderRadius: '16px', p: 4 }}
                    >
                        <Typography variant="h4">Scoreboard</Typography>
                        {playerScores.map((data, index) => (
                            <div key={index} className="flex justify-between w-full">
                                <div><b>{data[0]}:</b></div>
                                <div>{data[1]}</div>
                            </div>
                        ))}
                    </Box>
                    <Button onClick={startGame}>Start Game</Button>
                </Grid>
            </Grid>
        </div>
    )
}