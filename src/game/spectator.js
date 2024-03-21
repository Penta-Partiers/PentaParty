/*
    The widget is a 5 x 5 grid that represents the state of the game.
    (0, 0) denotes the element in the bottom left of the grid.
    It has values as follows:
        - 0: An empty space
        - 1: A space filled with a static block
*/
var widget = new Array(5)
for (let i = 0; i < widget.length; i++) {
    widget[i] = new Array(5).fill(0)
}
// Number of milliseconds that the spectator has to submit a shape
const DEADLINE_IN_MILLISECONDS = 30000
// The deadline for the spectator to submit the shape
var submitTime = Date.now() + DEADLINE_IN_MILLISECONDS
var currentPlayer = -1

/**
 * This function resets the spectator state
 */
function resetState() {
    if (currentPlayer !== -1) {
        if (validateShape()) {
            // [DELETE] Submit shape to the player's queue

        }
    }
    
    // [DELETE] Randomly assign a new player

    // Reset the widget and deadline
    for (let i = 0; i < widget.length; i++) {
        for (let j = 0; j < widget[0].length; j++) {
            widget[i][j] = 0
        }
    }
    submitTime = Date.now() + DEADLINE_IN_MILLISECONDS
}

/**
 * This function toggles a square on the widget when it is selected by the user
 * @param {number} i The row of the square selected by the user
 * @param {number} j The column of the square selected by the user
 */
function toggleSquare(i, j) {
    if (widget[i][j]) {
        widget[i][j] = 0
    } else {
        widget[i][j] = 1
    }
}

/**
 * This function verifies the validity of the shape in the widget
 * @return {bool} If the shape is valid
 */
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
