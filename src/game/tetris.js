/**
 * Contiguous sets of blocks that will be dropping from the top of the screen
 */
class Shape {
    /**
     * Constructor
     * @param {array[array[number]]} board An array of arrays representing the Tetris board
     * @param {array[array[number, number]]} points An array of tuples that dictate the x and y position of each point making up the shape
     */
    constructor(board, points) {
        this.points = points

        // Mark the shape on the board
        for (let p = 0; p < this.points.length; p++) {
            let rowNumber = this.points[p][0]
            let columnNumber = this.points[p][1]
            board[rowNumber][columnNumber] = 2
        }
    }

    /**
     * Freezes the shape in place by converting the points to static
     * @param {array[array[number]]} board An array of arrays representing the Tetris board
     */
    freeze(board) {
        for (let p = 0; p < this.points.length; p++) {
            let rowNumber = this.points[p][0]
            let columnNumber = this.points[p][1]
            board[rowNumber][columnNumber] = 1
        }
    }

    /**
     * Lowers the shape by one row
     * @param {array[array[number]]} board An array of arrays representing the Tetris board
     * @return {bool} If the shape became static by hitting the ground
     */
    lowerShape(board) {
        // Check if there's room beneath the shape
        for (let p = 0; p < this.points.length; p++) {
            let rowNumber = this.points[p][0]
            let columnNumber = this.points[p][1]

            // If we can't go any lower, freeze the shape in place
            if (rowNumber === 0 || board[rowNumber - 1][columnNumber] === 1) {
                this.freeze(board)
                return true
            }
        }
        
        // Remove existing shape and update the points array
        for (let p = 0; p < this.points.length; p++) {
            let rowNumber = this.points[p][0]
            let columnNumber = this.points[p][1]

            board[rowNumber][columnNumber] = 0
            this.points[p][0]--
        }

        // Shift all of the points downwards
        for (let p = 0; p < this.points.length; p++) {
            let rowNumber = this.points[p][0]
            let columnNumber = this.points[p][1]

            board[rowNumber][columnNumber] = 2
        }

        return false
    }

    /**
     * Rotates the shape based on the algorithms listed here https://stackoverflow.com/questions/233850/tetris-piece-rotation-algorithm
     * @param {array[array[number]]} board An array of arrays representing the Tetris board
     * @param {number} direction An integer specifying the direction the shape is rotated:
     *  - -1 means counter clockwise rotation
     *  - 1 means clockwise rotation
     */
    rotateShape(board, direction) {
        // Quick error check to verify values
        if (direction !== -1 && direction !== 1) {
            console.log("[Tetris] Rotate shape received an invalid direction of: " + direction)
            return false
        }

        // Find the minimum array (smallest array containing all points)
        var minX = 999
        var minY =  999
        var maxX = 0
        var maxY = 0
        for (let p = 0; p < this.points.length; p++) {
            let rowNumber = this.points[p][0]
            let columnNumber = this.points[p][1]

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
        for (let p = 0; p < this.points.length; p++) {
            // Start by subtracting the minimum of the coordinate to get the minimum array coordinates
            let rowNumber = this.points[p][0] - minY
            let columnNumber = this.points[p][1] - minX
            
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
            if (columnNumber < 0 || columnNumber >= board[0].length || rowNumber < 0 || rowNumber >= board.length || board[rowNumber][columnNumber] === 1) {
                return
            }
        }
        
        // Remove existing shape
        for (let p = 0; p < this.points.length; p++) {
            let rowNumber = this.points[p][0]
            let columnNumber = this.points[p][1]
            
            board[rowNumber][columnNumber] = 0
        }
        
        // Update the board state with rotation and update the points array
        this.points = []
        for (let p = 0; p < rotatedPoints.length; p++) {
            let rowNumber = rotatedPoints[p][0]
            let columnNumber = rotatedPoints[p][1]

            board[rowNumber][columnNumber] = 2
            this.points.push([rowNumber, columnNumber])
        }
    }

    /**
     * Moves the shape in a direction based on the arguments
     * @param {array[array[number]]} board An array of arrays representing the Tetris board
     * @param {number} direction An integer specifying the direction the shape is translated:
     *  - -1 means a shift to the left
     *  - 0 means a shift downwards by calling the lowerShape function
     *  - 1 means a shift to the right
     * @return {bool} If the shape became static by hitting the ground
     */
    translateShape(board, direction) {
        // If the shape is being shifted downwards
        if (direction === 0) {
            return this.lowerShape(board)
        }

        // Quick error check to verify values
        if (direction !== -1 && direction !== 1) {
            console.log("[Tetris] Translate shape received an invalid direction of: " + direction)
            return false
        }

        // Check if there's room around the shape
        for (let p = 0; p < this.points.length; p++) {
            let rowNumber = this.points[p][0]
            let columnNumber = this.points[p][1]

            // If the board or a block obstructs the path
            if (columnNumber + direction < 0 || columnNumber + direction >= board[0].length || board[rowNumber][columnNumber] === 1) {
                return false
            }
        }

        // Remove existing shape and update the points array
        for (let p = 0; p < this.points.length; p++) {
            let rowNumber = this.points[p][0]
            let columnNumber = this.points[p][1]

            board[rowNumber][columnNumber] = 0
            this.points[p][1] += direction
        }

        // Shift all of the points in the desired direction and update the points array
        for (let p = 0; p < this.points.length; p++) {
            let rowNumber = this.points[p][0]
            let columnNumber = this.points[p][1]

            board[rowNumber][columnNumber] = 2
        }

        return false
    }
}

/**
 * Checks for a completed row in a Tetris board and lowers rows when needed
 * @param {array[array[number]]} board An array of arrays representing the Tetris board
 * @return {number} The number of points to add to the player's score
 */
function checkCompleteRows(board) {
    removedRows = []

    // Iterate from top to bottom
    for (let i = board.length - 1; i >= 0; i--) {
        for (let j = 0; j < board[i].length; j++) {
            // If a row is incomplete, we check the next row
            if (board[i][j] != 1) {
                break
            }

            // If the entire row is filled with 1s, we have a complete row
            if (j === board[i].length - 1) {
                removedRows.unshift(i)
                removeRow(board, i)
            }
        }
    }

    // Add function to pull down the board
    if (removedRows.length > 0) {
        lowerRows(board, removedRows)
    }

    // Calculate score
    return removedRows.length * 100
}

/**
 * Checks for the end of the game
 * @param {array[array[number]]} board An array of arrays representing the Tetris board
 * @return {bool} Boolean representing if the game has ended
 */
function checkEndGame(board) {
    // Check all of the spaces in the top three rows (to allow room for shapes to spawn)
    for (let j = 0; j < board[0].length; j++) {
        if (board[board.length - 3][j] === 1 || board[board.length - 2][j] === 1 || board[board.length - 1][j] === 1) {
            return true
        }
    }
    return false
}

/**
 * Randomly selects a 4 block shape from a predefined set. We are guaranteed that the top 3 rows are free
 * @param {array[array[number]]} board An array of arrays representing the Tetris board
 * @return {Shape} A 4 block shape
 */
function generateTetromino(board) {
    // There are 5 possible tetrominos
    shapeChoice = Math.floor(Math.random() * 5)
    middleColumn = Math.floor(board[0].length / 2)

    switch(shapeChoice) {
        case 0:
            // Line
            return new Shape(board, [[board.length - 1, middleColumn - 2], [board.length - 1, middleColumn - 1], [board.length - 1, middleColumn], [board.length - 1, middleColumn + 1]])
        case 1:
            // L-shape
            if (Math.floor(Math.random() * 2) === 0) {
                return new Shape(board, [[board.length - 1, middleColumn - 1], [board.length - 1, middleColumn], [board.length - 1, middleColumn + 1], [board.length - 2, middleColumn + 1]])
            } else {
                return new Shape(board, [[board.length - 1, middleColumn - 1], [board.length - 1, middleColumn], [board.length - 1, middleColumn + 1], [board.length - 2, middleColumn - 1]])
            }
        case 2:
            // Z-shape
            if (Math.floor(Math.random() * 2) === 0) {
                return new Shape(board, [[board.length - 2, middleColumn - 1], [board.length - 2, middleColumn], [board.length - 1, middleColumn], [board.length - 1, middleColumn + 1]])
            } else {
                return new Shape(board, [[board.length - 1, middleColumn - 1], [board.length - 1, middleColumn], [board.length - 2, middleColumn], [board.length - 2, middleColumn + 1]])
            }
        case 3:
            // T-shape
            return new Shape(board, [[board.length - 1, middleColumn - 1], [board.length - 1, middleColumn], [board.length - 1, middleColumn + 1], [board.length - 2, middleColumn]])
        default:
            // Block
            return new Shape(board, [[board.length - 1, middleColumn - 1], [board.length - 1, middleColumn], [board.length - 2, middleColumn - 1], [board.length - 2, middleColumn]])
    }
}


/**
 * Gets another shape for the current user
 * @param {array[array[number]]} board An array of arrays representing the Tetris board
 * @param {array[Shape]} shapeQueue An array of shapes representing the queued shapes
 * @return {Shape} The next 4 block shape
 */
function getNextShape(board, shapeQueue) {
    if (shapeQueue.length === 0) {
        return generateTetromino(board)
    } else {
        return shapeQueue.shift()
    }
}

/**
 * Fills in the rows that were just removed
 * @param {array[array[number]]} board An array of arrays representing the Tetris board
 * @param {array[number]} rows Non-empty array of rows that were removed from the grid in ascending order
 */
function lowerRows(board, rows) {
    // Remove the row from the board
    var removedCount = 0
    for (let i = 0; i < rows.length; i++) {
        // As we remove rows, the index will change, so we need to compensate for that
        board.splice(rows[i] - removedCount, 1)
        board.push(new Array(board[0].length).fill(0))
        removedCount++
    }
}

/**
 * Removes a row from the Tetris board
 * @param {array[array[number]]} board An array of arrays representing the Tetris board
 * @param {number} row The row to remove from the board
 */
function removeRow(board, row) {
    // Animate the row clearing by flashing it off and on 3 times
    for (let i = 0; i < 3; i++) {
        board[row].fill(0)

        // Delay for around 100 ms
        sleep(100)
        board[row].fill(1)
    }
    board[row].fill(0)
}

/**
 * This function performs a blocking wait for the specified amount of time
 * @param {number} time The number of milliseconds to block for
 */
function sleep(time) {
    // From https://alvarotrigo.com/blog/wait-1-second-javascript/
    const start = Date.now()
    while (Date.now() - start < time) {}
}

/**
 * This function controls the backend for the tetris game
 */
function startTetris() {
    // Initialize the game
    /*
        The board is a 13 x 25 grid that represents the state of the game.
        (0, 0) denotes the element in the bottom left of the grid.
        It has values as follows:
            - 0: An empty space
            - 1: A space filled with a static block
            - 2: A space filled with part of a shape
    */
    var board = new Array(25)
    for (let i = 0; i < board.length; i++) {
        board[i] = new Array(13).fill(0)
    }
    var score = 0
    var shapeQueue = []
    var userInput = []

    var currentShape = getNextShape(board, shapeQueue)

    // Take in user input and only keep one of each press at a time
    window.addEventListener('keydown', e => {
        if ((e.key === "a" || e.key === "s" || e.key === "d" || e.key === "j" || e.key === "l") && userInput.indexOf(e.key) === -1) {
            userInput.push(e.key)
        }
    })
    window.addEventListener('keyup', e => {
        if (userInput.indexOf(e.key) === -1) {
            return
        }

        // Choose what action to take
        if (e.key === "a") {
            if (currentShape.translateShape(board, -1)) {
                currentShape = getNextShape(board, shapeQueue)
            }
        } else if (e.key === "s") {
            if (currentShape.translateShape(board, 0)) {
                currentShape = getNextShape(board, shapeQueue)
            }
        } else if (e.key === "d") {
            if (currentShape.translateShape(board, 1)) {
                currentShape = getNextShape(board, shapeQueue)
            }
        } else if (e.key === "j") {
            currentShape.rotateShape(board, -1)
        } else if (e.key === "l") {
            currentShape.rotateShape(board, 1)
        }
        userInput.splice(userInput.indexOf(e.key), 1)
    })

    // Main loop
    var lastLowerTime = Date.now()
    while (true) {
        // Lower the shape every 1 second
        if (Date.now() - lastLowerTime > 1000) {
            if (currentShape.lowerShape(board)) {
                currentShape = getNextShape(board, shapeQueue)
            }
            lastLowerTime = Date.now()
        }

        score += checkCompleteRows(board)
        if (checkEndGame(board)) {
            break
        }

        // Iterate every 100 ms
        sleep( 100 )
    }
}