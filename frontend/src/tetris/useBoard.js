import { useReducer } from 'react';

const NUM_ROWS = 25;
const NUM_COLS = 13;

/*
Custom React hook to handle all changes to the board state, specifically:
    - The board itself (array of array of numbers)
    - The current shape, represented as an array of tuples
    - The current shape queue, represented as an array of shape-point representations
*/
export function useBoard() {
    /*
    Board state has the following properties:
    {
        board: array of array of numbers representing the board
        currentShapePoints: array of tuples that dictate the x and y position of each point making up the shape
        shapeQueue: array of shape-point representations (i.e. similar to currentShapePoints)
    }
    */
    const [boardState, dispatchBoardState] = useReducer(
        // Reducer function
        boardStateReducer, 
        // Initial state values
        // {},
        // // Initializer function
        // () => {
        //     const state = {
        //         board: initializeEmptyBoard(),
        //         currentShapePoints: null,
        //         shapeQueue: [],
        //         currentColor: "red",
        //     };
        //     return state;
        // }
        {
            board: initializeEmptyBoard(),
            currentShapePoints: null,
            shapeQueue: [],
            currentColor: "red",
        }
    );

    return [boardState, dispatchBoardState];
}

/*
Returns a new state given an action, which contains a 'type', and in some
cases, some additional parameters.

action.type can either be:
    - 'start'
    - 'lower'
    - 'translate'
        - includes action.direction
    - 'rotate'
        - includes action.direction
    - 'removeRow'
        - includes action.row
    - 'lowerRows'
        - includes action.rows
*/
function boardStateReducer(state, action) {
    // Create a deep clone so that React can detect this as a new state
    const newState = JSON.parse(JSON.stringify(state));

    switch (action.type) {
        // Called once when the game is started, initializes the state
        case 'start':
            let initialBoard = initializeEmptyBoard();
            let initialShapePoints = generateTetromino();

            // Draw the initial shape on the board
            renderNewShape(initialBoard, initialShapePoints);

            return {
                board: initialBoard,
                currentShapePoints: initialShapePoints,
                shapeQueue: [],
                currentColor: selectNextColor(),
            }
        case 'lower':
            if (lowerShape(newState.board, newState.currentShapePoints)) {
                let nextShape = getNextShape(newState.shapeQueue);
                renderNewShape(newState.board, nextShape);
                newState.currentShapePoints = nextShape;
                newState.currentColor = selectNextColor();
            }
            break;
        case 'translate':
            if (translateShape(newState.board, newState.currentShapePoints, action.direction)) {
                let nextShape = getNextShape(newState.shapeQueue);
                renderNewShape(newState.board, nextShape);
                newState.currentShapePoints = nextShape;
                newState.currentColor = selectNextColor();
            }
            break;
        case 'rotate':
            rotateShape(newState.board, newState.currentShapePoints, action.direction);
            break;
        case 'removeRow':
            removeRow(newState.board, action.row);
            break;
        case 'lowerRows':
            lowerRows(newState.board, action.rows);
            break;
        default:
            // Debugging - this shouldn't ever happen
            console.error("boardStateReducer error -> invalid action type");
    }

    return newState;
}

function lowerRows(board, rows) {
    // Remove the row from the board
    var removedCount = 0
    for (let i = 0; i < rows.length; i++) {
        // As we remove rows, the index will change, so we need to compensate for that
        board.splice(rows[i] - removedCount, 1)
        board.unshift(new Array(board[0].length).fill(0))
        removedCount++
    }
}

function removeRow(board, row) {
    board[row].fill(0)
}

function getNextShape(shapeQueue) {
    if (shapeQueue.length === 0) {
        return generateTetromino()
    } else {
        return shapeQueue.shift()
    }
}

function renderNewShape(board, points) {
    for (let i = 0; i < points.length; i++) {
        let rowNumber = points[i][0];
        let colNumber = points[i][1]; 
        board[rowNumber][colNumber] = 2;
    }
}

function translateShape(board, points, direction) {
    // If the shape is being shifted downwards
    if (direction === 0) {
        return lowerShape(board, points);
    }

    // Quick error check to verify values
    if (direction !== -1 && direction !== 1) {
        console.log("[Tetris] Translate shape received an invalid direction of: " + direction)
        return false
    }

    // Check if there's room around the shape
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]

        // If the board or a block obstructs the path
        if (columnNumber + direction < 0 || columnNumber + direction >= NUM_COLS || board[rowNumber][columnNumber] === 1) {
            return false
        }
    }

    // Remove existing shape and update the points array
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]

        board[rowNumber][columnNumber] = 0
        points[p][1] += direction
    }

    // Shift all of the points in the desired direction and update the points array
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]

        board[rowNumber][columnNumber] = 2
    }

    return false
}

function rotateShape(board, points, direction) {
    // Quick error check to verify values
    if (direction !== -1 && direction !== 1) {
        console.log("[Tetris] Rotate shape received an invalid direction of: " + direction)
        return;
    }

    // Find the minimum array (smallest array containing all points)
    var minX = 999
    var minY =  999
    var maxX = 0
    var maxY = 0
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]

        if (columnNumber < minX) {
            minX = columnNumber
        }
        if (columnNumber > maxX) {
            maxX = columnNumber
        }
        if (rowNumber < minY) {
            minY = rowNumber
        }
        if (rowNumber > maxY) {
            maxY = rowNumber
        }
    }

    // Rotate the shape within the minimum array
    var rotatedPoints = []
    for (let p = 0; p < points.length; p++) {
        // Start by subtracting the minimum of the coordinate to get the minimum array coordinates
        let rowNumber = points[p][0] - minY
        let columnNumber = points[p][1] - minX
        
        // Transpose the matrix point
        let temp = rowNumber
        rowNumber = columnNumber
        columnNumber = temp
        
        // Finalize the rotation by reversing either the rows or the columns
        // Due to the transpose, the maximum index for the row will be the calculated using the range of columns (X coordinate) of the original matrix
        if (direction === -1) {
            // Reverse columns for counter clockwise
            var maxColumnIndex = maxY - minY
            columnNumber = maxColumnIndex - columnNumber
        } else {
            // Reverse rows for clockwise
            var maxRowIndex = maxX - minX
            rowNumber = maxRowIndex - rowNumber
        }

        // Add back minimum of each dimension to get actual coordinates
        rowNumber += minY
        columnNumber += minX
        rotatedPoints.push([rowNumber, columnNumber])
    }

    // Check if all of the points are available
    for (let p = 0; p < rotatedPoints.length; p++) {
        let rowNumber = rotatedPoints[p][0]
        let columnNumber = rotatedPoints[p][1]

        // If the board or a block obstructs the path
        if (columnNumber < 0 || columnNumber >= NUM_COLS || rowNumber < 0 || rowNumber >= NUM_ROWS || board[rowNumber][columnNumber] === 1) {
            return
        }
    }

    // Remove existing shape
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        
        board[rowNumber][columnNumber] = 0
    }

    // Update the board state with rotation and update the points array
    for (let p = 0; p < rotatedPoints.length; p++) {
        let rowNumber = rotatedPoints[p][0]
        let columnNumber = rotatedPoints[p][1]

        board[rowNumber][columnNumber] = 2
        points[p][0] = rowNumber;
        points[p][1] = columnNumber;
    }
}

function lowerShape(board, points) {
    // Check if there's room beneath the shape
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]

        // If we can't go any lower, freeze the shape in place
        if (rowNumber === NUM_ROWS - 1 || board[rowNumber + 1][columnNumber] === 1) {
            freeze(board, points);
            return true;
        }
    }
    
    // Remove existing shape and update the points array
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]

        board[rowNumber][columnNumber] = 0
        points[p][0]++
    }

    // Shift all of the points downwards
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]

        board[rowNumber][columnNumber] = 2
    }

    return false;
}

function freeze(board, points) {
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        board[rowNumber][columnNumber] = 1
    }

    return;
}

// returns a shape-points representation
function generateTetromino() {
    // There are 5 possible tetrominos
    var shapeChoice = Math.floor(Math.random() * 5);
    var middleColumn = Math.floor(NUM_COLS / 2);

    switch(shapeChoice) {
        case 0:
            // Line
            return [[0, middleColumn - 2], [0, middleColumn - 1], [0, middleColumn], [0, middleColumn + 1]]
        case 1:
            // L-shape
            if (Math.floor(Math.random() * 2) === 0) {
                return [[0, middleColumn - 1], [0, middleColumn], [0, middleColumn + 1], [1, middleColumn + 1]]
            } else {
                return [[0, middleColumn - 1], [0, middleColumn], [0, middleColumn + 1], [1, middleColumn - 1]]
            }
        case 2:
            // Z-shape
            if (Math.floor(Math.random() * 2) === 0) {
                return [[1, middleColumn - 1], [1, middleColumn], [0, middleColumn], [0, middleColumn + 1]]
            } else {
                return [[0, middleColumn - 1], [0, middleColumn], [1, middleColumn], [1, middleColumn + 1]]
            }
        case 3:
            // T-shape
            return [[0, middleColumn - 1], [0, middleColumn], [0, middleColumn + 1], [1, middleColumn]]
        default:
            // Block
            return [[0, middleColumn - 1], [0, middleColumn], [1, middleColumn - 1], [1, middleColumn]]
    }
}

// Initialize an empty board with each cell set to 0
export function initializeEmptyBoard() {
    var board = new Array(NUM_ROWS);
    for (let i = 0; i < board.length; i++) {
        board[i] = new Array(NUM_COLS).fill(0);
    }
    return board;
}

// Possible colors: red, cyan, blue, green, purple, orange
function selectNextColor() {
    var colorChoice = Math.floor(Math.random() * 6);

    switch (colorChoice) {
        case 0:
            return "red";
        case 1:
            return "teal";
        case 2:
            return "blue";
        case 3:
            return "green";
        case 4:
            return "purple";
        default:
            return "orange";
    }
}