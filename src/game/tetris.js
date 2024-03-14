/**
 * Contiguous sets of blocks that will be dropping from the top of the screen
 */
class Shape {
    /**
     * Constructor
     * @param {[[int]]} board An array of arrays representing the Tetris board
     * @param {[[int, int]]} points An array of tuples that dictate the x and y position of each point making up the shape
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
     * @param {[[int]]} board An array of arrays representing the Tetris board
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
     * @param {[[int]]} board An array of arrays representing the Tetris board
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
     * Moves the shape in a direction based on the arguments
     * @param {[[int]]} board An array of arrays representing the Tetris board
     * @param {int} direction An integer specifying the direction the shape is translated:
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
 * Checks for a completed row in a Tetris board
 * @param {[[int]]} board An array of arrays representing the Tetris board
 * @return {int} The number of points to add to the player's score
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
 * @param {[[int]]} board An array of arrays representing the Tetris board
 * @return {bool} Boolean representing if the game has ended
 */
function checkEndGame(board) {
    // Check all of the spaces in the top row
    for (let j = 0; j < board[0].length; j++) {
        if (board[board.length - 1][j] === 1) {
            return true
        }
    }
    return false
}

/**
 * Fills in the rows that were just removed
 * @param {[[int]]} board An array of arrays representing the Tetris board
 * @param {[int]} rows Non-empty array of rows that were removed from the grid in ascending order
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
 * @param {[[int]]} board An array of arrays representing the Tetris board
 * @param {int} row The row to remove from the board
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
 * @param {int} time The number of milliseconds to block for
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
        The board is a 13 x 25 grid that represents the state of the game. It will be filled with 1s (denoting a block) and 0s (denoting an empty space).
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

    // Main loop
    while (true) {
        // [DELETE] Create shape and lower it
        // shape = new Shape(board, [[24, 0], [24, 1], [24, 2], [23, 1]])



        score += checkCompleteRows(board)
        if (checkEndGame(board)) {
            break
        }

        // Iterate every 100 ms
        sleep( 100 )
    }
}