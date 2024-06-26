import { useReducer } from 'react';

export const NUM_ROWS = 25;
export const NUM_COLS = 13;

/**
 * Custom React hook to handle all changes to the board state
 * 
 * ==> Functional Requirements: FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR25, FR27
 */
export function useBoard() {
    /*
    Keeps track of the following properties and any changes/updates to them:
      - board: array of array of numbers representing the board
      - currentShapePoints: array of tuples that dictate the x and y position of each point making up the shape
      - shapeQueue: array of shape-point representations (i.e. similar to currentShapePoints)
      - currentColor: string representing the current color of the current shape
      - pushedIncompleteRows: a boolean keeping track of whether or not incomplete rows were recently added to the board
    
    ==> Functional Requirements: FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR25, FR27
    */
    const [boardState, dispatchBoardState] = useReducer(
        // Reducer function
        boardStateReducer, 
        // Initial state values
        {
            board: initializeEmptyBoard(),
            currentShapePoints: null,
            shapeQueue: [],
            currentColor: selectNextColor(),
            pushedIncompleteRows: false,
        }
    );

    return [boardState, dispatchBoardState];
}

/*
Returns a new state given an action, which contains a 'type', and in some
cases, some additional parameters.

==> Functional Requirements: FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR25, FR27
*/
export function boardStateReducer(state, action) {
    // Create a deep clone so that React can detect this as a new state
    const newState = JSON.parse(JSON.stringify(state));

    switch (action.type) {
        // Called once when the game is started, initializes the state
        // ==> Functional Requirement: FR13
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
                pushedIncompleteRows: false,
            }
        // Moves a shape down the board, and turns it into a static shape if it touches
        // the bottom of the screen or the top of another shape
        // ==> Functional Requirements: FR14, FR18
        case 'lower':
            if (!newState.pushedIncompleteRows) {
                if (lowerShape(newState.board, newState.currentShapePoints)) {
                    if (!checkEndGame(newState.board)) {
                        let nextShape = getNextShape(newState.shapeQueue);
                        renderNewShape(newState.board, nextShape);
                        newState.currentShapePoints = nextShape;
                        newState.currentColor = selectNextColor();
                    }
                }
            }
            else {
                newState.pushedIncompleteRows = false;
            }
            break;
        // Moves the current shape left or right on the board
        // ==> Functional Requirement: FR16
        case 'translate':
            if (!newState.pushedIncompleteRows) {
                if (translateShape(newState.board, newState.currentShapePoints, action.direction)) {
                    let nextShape = getNextShape(newState.shapeQueue);
                    renderNewShape(newState.board, nextShape);
                    newState.currentShapePoints = nextShape;
                    newState.currentColor = selectNextColor();
                }
            }
            else {
                newState.pushedIncompleteRows = false;
            }
            break;
        // Rotates the current shape clockwise or counterclockwise
        // ==> Functional Requirement: FR17
        case 'rotate':
            if (!newState.pushedIncompleteRows) {
                rotateShape(newState.board, newState.currentShapePoints, action.direction);
            }
            else {
                newState.pushedIncompleteRows = false;
            }
            break;
        // Removes a completed row of static blocks
        // ==> Functional Requirement: FR19
        case 'removeRow':
            if (!newState.pushedIncompleteRows) {
                removeRow(newState.board, action.row);
            }
            else {
                newState.pushedIncompleteRows = false;
            }
            break;
        // Moves the remaining rows down after rows have been completed
        // ==> Functional Requirement: FR20
        case 'lowerRows':
            if (!newState.pushedIncompleteRows) {
                lowerRows(newState.board, action.rows);
            }
            else {
                newState.pushedIncompleteRows = false;
            }
            break;
        // Adds a spectator-created shape the the player's shape queue
        // ==> Functional Requirement: FR25
        case 'pushSpectatorShape':
            let widgetShapePoints = convertToShape(action.widget);
            newState.shapeQueue.push(widgetShapePoints);
            break;
        // Adds incomplete rows of static blocks to a player's board
        // ==> Functional Requirement: FR27
        case 'addIncompleteRows':
            addIncompleteRows(newState.board, action.rowCount, newState.currentShapePoints);
            newState.pushedIncompleteRows = true;
            break;
        // Resumes a player's game if they reconnect after being disconnected
        // ==> Functional Requirement: FR14
        case 'resume':
            newState.board = action.board;
            newState.currentShapePoints = getCurrentShapePoints(action.board);
            break;
        // Re-renders the players board state if they reconnect after being disconnected and
        // their game has already ended
        // ==> Functional Requirement: FR13
        case 'ended':
            newState.board = action.board;
            convertAllToStatic(newState.board);
            break;
        default:
            // Debugging - this shouldn't ever happen
            console.error("boardStateReducer error -> invalid action type");
    }

    return newState;
}

/**
 * Adds incomplete rows to the bottom of the tetris board
 * 
 * ==> Functional Requirement: FR27
 */
export function addIncompleteRows(board, rowCount, points) {
    // Remove existing shape and shift all of the points upwards by the number of incomplete rows or until it hits the top
    var shiftFactor = rowCount
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]

        board[rowNumber][columnNumber] = 0

        // Change shiftFactor if we would index out of bounds
        if (points[p][0] - shiftFactor < 0) {
            shiftFactor = points[p][0]
        }
    }

    // Adjust the points using the lowest shiftFactor we found
    for (let p = 0; p < points.length; p++) {
        points[p][0]-= shiftFactor
    }

    let incompleteRows = new Array(rowCount);

    for (let i = 0; i < rowCount; i++) {
        // Create 3 - 5 holes in the new line
        var numHoles = Math.floor(Math.random() * 3) + 3
        var incompleteRow =  new Array(board[0].length).fill(1)
        var removedItems = new Set()

        while (removedItems.size < numHoles) {
            var newGap = Math.floor(Math.random() * board[0].length)
            if (!removedItems.has(newGap)) {
                removedItems.add(newGap)
                incompleteRow[newGap] = 0
            }
        }

        incompleteRows[i] = incompleteRow;
    }

    board.splice(0, rowCount);
    board.push(...incompleteRows);

    // Re-draw the shape on the board
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]

        // If this is false, the game is over for the player
        if (board[rowNumber][columnNumber] === 0) {
            board[rowNumber][columnNumber] = 2
        }
    }
}

/**
 * Causes static blocks to fall down after rows have been removed
 * 
 * ==> Functional Requirement: FR20
 */
export function lowerRows(board, rows) {
    // rows array must be in descending order (from the bottom of the board to the top, with the value decreasing because row 0 is on the top)
    rows.sort()
    rows.reverse()

    // Remove the row from the board
    var removedCount = 0
    for (let i = 0; i < rows.length; i++) {
        // As we remove rows, the index will change, so we need to compensate for that
        board.splice(rows[i] + removedCount, 1)
        board.unshift(new Array(board[0].length).fill(0))
        removedCount++
    }
}

/**
 * Removes a completed row of static blocks
 * 
 * ==> Functional Requirement: FR19
 */
export function removeRow(board, row) {
    board[row].fill(0)
}

/**
 * Gets the next shape to fall on the player board
 * 
 * ==> Functional Requirement: FR13, FR14
 */
export function getNextShape(shapeQueue) {
    if (shapeQueue.length === 0) {
        return generateTetromino()
    } else {
        return shapeQueue.shift()
    }
}

/**
 * Renders a shape on the board
 * 
 * ==> Functional Requirement: FR13, FR14
 */
export function renderNewShape(board, points) {
    for (let i = 0; i < points.length; i++) {
        let rowNumber = points[i][0];
        let colNumber = points[i][1]; 
        board[rowNumber][colNumber] = 2;
    }
}

/**
 * Moves a shape left or right on the board
 * 
 * ==> Functional Requirement: FR16
 */
export function translateShape(board, points, direction) {
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
        if (columnNumber + direction < 0 || columnNumber + direction >= NUM_COLS || board[rowNumber][columnNumber + direction] === 1) {
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

/**
 * Rotates a shape on the board
 * 
 * ==> Functional Requirement: FR17
 */
export function rotateShape(board, points, direction) {
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
            // Reverse columns for clockwise
            var maxColumnIndex = maxX - minX
            rowNumber = maxColumnIndex - rowNumber
        } else {
            // Reverse rows for counter clockwise
            var maxRowIndex = maxY - minY
            columnNumber = maxRowIndex - columnNumber
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
        if (columnNumber < 0 || columnNumber >= board[0].length || rowNumber < 0 || rowNumber >= board.length || board[rowNumber][columnNumber] === 1) {
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

/**
 * Moves a shape downward on the board
 * 
 * ==> Functional Requirement: FR14
 */
export function lowerShape(board, points) {
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

/**
 * Turns a shape into static blocks
 * 
 * ==> Functional Requirement: FR18
 */
export function freeze(board, points) {
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        board[rowNumber][columnNumber] = 1
    }

    return;
}

/**
 * Returns one of the default Tetris shapes
 * 
 * ==> Functional Requirement: FR15
 */
export function generateTetromino() {
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

/**
 * Initialize an empty board with each cell set to 0
 * 
 * ==> Functional Requirement: FR13
 */
export function initializeEmptyBoard() {
    var board = new Array(NUM_ROWS);
    for (let i = 0; i < board.length; i++) {
        board[i] = new Array(NUM_COLS).fill(0);
    }
    return board;
}

/**
 * Randomly selects the color of the current shape.
 * Possible colors: red, cyan, blue, green, purple, orange
 * 
 * ==> Functional Requirement: FR14
 */
export function selectNextColor() {
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

/**
 * Checks if the game has ended based on the board state,
 * i.e. if there are any static blocks past the threshold height (top 3 rows)
 * 
 * ==> Functional Requirement: FR21
 */
export function checkEndGame(board) {
    // Check all of the spaces in the top three rows (to allow room for shapes to spawn)
    for (let j = 0; j < board[0].length; j++) {
        if (board[0][j] === 1 || board[1][j] === 1 || board[2][j] === 1) {
            return true
        }
    }
    return false
}

/**
 * Takes in a widget state and converts it to points on the board. 
 * This function assumes that it is a valid shape (contiguous and 5 or less blocks used)
 * 
 * ==> Functional Requirement: FR24, FR25
 */
export function convertToShape(widget) {
    var shape = new Array();
    var maxY = -1
    var minY = 999

    // Create the shape from the widget
    for (let i = 0; i < widget.length; i++) {
        for (let j = 0; j < widget[0].length; j++) {
            if (widget[i][j] === 1) {
                shape.push([i, j])

                if (i > maxY) {
                    maxY = i
                }
                if (i < minY) {
                    minY = i
                }
            }
        }
    }

    // Rotate the shape counter clockwise if it won't fit in the top 3 rows (both maxY and minY were used, so we need to add 1 to count correctly)
    if (maxY - minY + 1 > 3) {
        for (let i = 0; i < shape.length; i++) {
            let rowNumber = shape[i][0]
            let columnNumber = shape[i][1]

            // Transpose the matrix point
            let temp = rowNumber
            rowNumber = columnNumber
            columnNumber = temp

            // Reverse rows for counter clockwise
            rowNumber = widget.length - rowNumber

            shape[i][0] = rowNumber
            shape[i][1] = columnNumber
        }
    }

    // Calculate the new minY and check if the shape fits in 3 rows
    maxY = -1
    minY = 999
    for (let i = 0; i < shape.length; i++) {
        if (shape[i][0] > maxY) {
            maxY = shape[i][0]
        }
        if (shape[i][0] < minY) {
            minY = shape[i][0]
        }
    }
    
    // If the shape still doesn't fit in the top 3 rows, then something is wrong
    if (maxY - minY + 1 > 3) {
        console.log("[useWidget] Cannot fit widget shape into 3 rows. Ensure that the shape was validated before calling convertToShape.")
        return null
    }
    
    // Adjust the values to be in the tetris board coordinates
    var middleColumn = Math.floor(NUM_COLS / 2)

    for (let i = 0; i < shape.length; i++) {
        shape[i][0] -= minY
        // This converts the column to the value on the tetris board by centering the widget around the middle column
        // i.e. Index 2 on the widget is the middle column of the board
        shape[i][1] = middleColumn + shape[i][1] - 2
    }
    
    return shape
}

/**
 * Gets the coordinates of the current shape on the board
 * 
 * ==> Functional Requirement: FR14
 */
export function getCurrentShapePoints(board) {
    let points = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (board[i][j] == 2) {
                points.push([i, j]);
            }
        }
    }

    if (points.length > 0) {
        return points;
    }
    else {
        return generateTetromino();
    }
}

/**
 * Converts all shapes to static blocks
 * 
 * Functional Requirement: FR18
 */
export function convertAllToStatic(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (board[i][j] == 2) {
                board[i][j] = 1;
            }
        }
    }
}