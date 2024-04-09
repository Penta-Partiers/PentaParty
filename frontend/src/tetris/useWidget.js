import { useState } from "react";

export const NUM_COLS = 13;

/**
 * Returns an empty widget.
 * @returns {[[number]]}
 * 
 * ==> Functional Requirement: FR23
 */
export function clearWidget() {
    var clearedWidget = new Array(5);
    for (let i = 0; i < clearedWidget.length; i++) {
        clearedWidget[i] = new Array(5).fill(0)
    }
    return clearedWidget;
}

/**
 * Takes in a widget state and converts it to points on the board. This function assumes that it is a valid shape (contiguous and 5 or less blocks used)
 * 
 * @param {[[number]]} widget The state of the spectator widget
 * @returns {array[array[number, number]]} An array of tuples that dictate the x and y position of each point making up the shape
 * 
 * ==> Functional Requirement: FR25
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
 * Takes in the current widget state and the row/column indices of the
 * clicked square, and returns a new widget state depending on whether or
 * not the clicked square is a valid action.
 * 
 * @param {[[number]]} widget 
 * @param {number} row 
 * @param {number} col 
 * @returns {[[number]]}
 * 
 * ==> Functional Requirements: FR23, FR24
 */
export function handleWidgetClick(widget, row, col) {
    let newWidget = [...widget]

    if (newWidget[row][col] === 1) {
        newWidget[row][col] = 0
    }
    else {
        newWidget[row][col] = 1
    }

    if (validateShape(newWidget)) {
        return newWidget;
    }
    else {
        if (newWidget[row][col] === 1) {
            newWidget[row][col] = 0
        }
        else {
            newWidget[row][col] = 1
        }
        return newWidget;
    }
}

/**
 * Custom React hook for managing spectator widget state.
 * 
 * ==> Functional Requirements: FR23, FR24, FR25
 */
export function useWidget() {
    const [widget, setWidget] = useState(() => {
        var widget = new Array(5);
        for (let i = 0; i < widget.length; i++) {
            widget[i] = new Array(5).fill(0)
        }
        return widget;
    });

    function onWidgetClick(row, col) {
        setWidget(handleWidgetClick(widget, row, col));
    }

    function onClearClick() {
        setWidget(clearWidget());
    }

    return [widget, setWidget, onWidgetClick, onClearClick];
}

/**
 * Takes in a widget state and returns true if it is valid,
 * otherwise returns false.
 * @param {[[number]]} widget 
 * @returns {boolean}
 * 
 * ==> Functional Requirement: FR24
 */
export function validateShape(widget) {
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
    if (count !== 0) {
        return false
    }
    
    return true
}