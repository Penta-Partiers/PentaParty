// React
import { useState, useEffect, useCallback } from "react"

// Material UI
import { Grid, Box, Typography, Button } from '@mui/material';

// Components
import GameBoard from '../components/GameBoard';
import Widget from "../components/Widget";

export default function SpectatorView() {
    const [board, setBoard] = useState(() => {
        var board = new Array(25);
        for (let i = 0; i < board.length; i++) {
            board[i] = new Array(13).fill(0);
        }
        return board;
    });

    const [widget, setWidget] = useState(() => {
        var widget = new Array(5);
        for (let i = 0; i < widget.length; i++) {
            widget[i] = new Array(5).fill(0)
        }
        return widget;
    });

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

    // Toggle widget squares empty/filled on click
    function handleWidgetClick(row, col) {
        let newWidget = [...widget]

        if (newWidget[row][col] == 1) {
            newWidget[row][col] = 0
        }
        else {
            newWidget[row][col] = 1
        }

        if (validateShape()) {
            setWidget(newWidget);
        }
        else {
            if (newWidget[row][col] == 1) {
                newWidget[row][col] = 0
            }
            else {
                newWidget[row][col] = 1
            }
            setWidget(newWidget);
        }
    }

    function validateShape() {
        var count = 0
        var firstPoint = -1
        // Ensure number of squares is valid
        for (let i = 0; i < widget.length; i++) {
            for (let j = 0; j < widget[0].length; j++) {
                if (widget[i][j] === 1) {
                    if (firstPoint === -1) {
                        firstPoint = [i, j]
                    }
                    count++
                }
            }
        }

        if (count > 5 || count === 0) {
            return false
        }

        // Ensure they are all contiguous
        var visited = new Set()
        var notVisited = [firstPoint]
        while (notVisited.length > 0) {
            var currentSquare = notVisited.shift()
            var currentI = currentSquare[0]
            var currentJ = currentSquare[1]
            if (visited.has(currentSquare.toString())) {
                continue
            }

            // Mark as visited
            visited.add(currentSquare.toString())

            // If this square is selected, add the neighbours to the queue and decrement the counter
            if (widget[currentI][currentJ] === 1) {
                count--
                
                if (currentI - 1 >= 0) {
                    notVisited.push([currentI - 1, currentJ])
                }
                if (currentI + 1 < widget.length) {
                    notVisited.push([currentI + 1, currentJ])
                }
                if (currentJ - 1 >= 0) {
                    notVisited.push([currentI, currentJ - 1])
                }
                if (currentJ + 1 < widget.length) {
                    notVisited.push([currentI, currentJ + 1])
                }
            }
        }

        // If the count isn't zero, then there is a disconnected square on the widget and the shape is invalid
        if (count != 0) {
            return false
        }
        
        return true
    }

    function clearWidget() {
        var clearedWidget = new Array(5);
        for (let i = 0; i < clearedWidget.length; i++) {
            clearedWidget[i] = new Array(5).fill(0)
        }
        setWidget(clearedWidget);
    }

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
                    <Widget widget={widget} onSquareClick={handleWidgetClick}/>
                    <div className="flex justify-center items-center w-full space-x-3">
                        <Button variant="outlined" onClick={clearWidget}>Clear</Button>
                        <Button variant="contained">Submit</Button>
                    </div>
                </div>
            </Grid>
        </Grid>
    )
}