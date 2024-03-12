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
                removedRows.push(i)
                removeRow(board, i)
            }
        }
    }

    // Add function to pull down the board
    if (removedRows.length > 0) {

        // [DELETE]
        board = [[0, 0, 0, 0, 0], [0, 1, 0, 0, 1], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 0, 0, 0], [0, 0, 0, 0, 0]] // [DELETE]
        removedRows = [0, 2, 3]

        lowerRows(board, removedRows)
    }
}

/**
 * Fills in the rows that were just removed
 * @param {[[int]]} board An array of arrays representing the Tetris board
 * @param {[int]} rows Non-empty array of rows that were removed from the grid in decreasing order
 */
function lowerRows(board, rows) {
    // // Find the first empty row
    // for (let i = 0; i < board.length; i++) {
    //     if (rows.has(i)) {
    //         // Find the next non-empty row to swap with
    //         for (let i2 = i + 1; i2 < board.length; i2++) {
    //             if (!rows.has(i2)) {
    //                 // Swap the rows
    //                 for (let j = 0; j < board[0].length; j++) {
    //                     board[i][j] = board[i2][j]
    //                     board[i2][j] = 0
    //                 }
    //                 rows.delete(i)
    //                 rows.add(i2)
    //             }
    //         }
    //     }
    // }

    // Remove the row from the board
    for (let i = 0; i < rows.length; i++) {
        board.splice(rows[i], 1)
        board.push(new Array(13).fill(0))
    }

    console.log(board) // [DELETE]



}

/**
 * Removes a row from the Tetris board
 * @param {[[int]]} board An array of arrays representing the Tetris board
 * @param {int} row The row to remove from the board
 */
function removeRow(board, row) {
    // Animate the row clearing by flashing it off and on 3 times
    for (let i = 0; i < 3; i++) {
        board[row] = new Array(13).fill(0)

        // Delay for around 100 ms
        sleep(100)
        board[row] = new Array(13).fill(1)
    }
    board[row] = new Array(13).fill(0)
}

/**
 * This function performs a blocking wait for the specified amount of time
 * @param {int} time The number of milliseconds to block for
 */
function sleep(time) {
    // From https://alvarotrigo.com/blog/wait-1-second-javascript/
    const start = Date.now();
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
    */
    // var board = new Array(25).fill(new Array(13).fill(0))
    var board = new Array(25).fill(new Array(13).fill(1)) // [DELETE]
    var score = 0

    checkCompleteRows(board) // [DELETE]

    // Main loop
    // while (true) {
    //     checkCompleteRows(board)




    //     // console.log(board) // [DELETE]
    // }
}