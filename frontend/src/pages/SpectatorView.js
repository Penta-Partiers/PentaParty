// React
import { useState, useEffect } from "react"

// Material UI
import { Grid, Typography, Button } from '@mui/material';

// Components
import GameBoard from '../components/GameBoard';
import Widget from "../components/Widget";

import { useWidget } from "../tetris/useWidget";

export default function SpectatorView() {
    // TODO: Temporary, will get board state from websocket server later
    const [board, setBoard] = useState(() => {
        var board = new Array(25);
        for (let i = 0; i < board.length; i++) {
            board[i] = new Array(13).fill(0);
        }
        return board;
    });

    const [widget, onWidgetClick, onClearClick] = useWidget();

    const [seconds, setSeconds] = useState(30);

    // Decrement the timer every second
    useEffect(() => {
        if (seconds > 0) {
            setTimeout(() => setSeconds(seconds - 1), 1000);
        }
        else {
            // TODO: submit the widget's shape if it's valid

            // Reset timer
            setSeconds(30);
        }
    }, [seconds])

    return (
        <Grid
            container
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: '100vh' }}
            columnGap={20}
        >
            <Grid item>
                <GameBoard boardState={board} currentColor={"red"} />
            </Grid>
            <Grid item>
                <div className="flex flex-col items-center space-y-4 w-full">
                    <div className="flex flex-col items-center mb-8">
                        <Typography variant="h5">You are assigned to:</Typography>
                        <Typography variant="h3">player_01</Typography>
                    </div>
                    <div>
                        <Typography variant="h5">0:{seconds < 10 ? 0 : <span />}{seconds}</Typography>
                    </div>
                    <Widget widget={widget} onSquareClick={onWidgetClick}/>
                    <div className="flex justify-center items-center w-full space-x-3">
                        <Button variant="outlined" onClick={onClearClick}>Clear</Button>
                        <Button variant="contained">Submit</Button>
                    </div>
                </div>
            </Grid>
        </Grid>
    )
}