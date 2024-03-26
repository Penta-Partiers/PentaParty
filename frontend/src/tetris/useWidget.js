import { useState } from "react";

/**
 * Custom React hook for managing spectator widget state.
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

    return [widget, onWidgetClick, onClearClick];
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
 * Takes in a widget state and returns true if it is valid,
 * otherwise returns false.
 * @param {[[number]]} widget 
 * @returns {boolean}
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

/**
 * Returns an empty widget.
 * @returns {[[number]]}
 */
function clearWidget() {
    var clearedWidget = new Array(5);
    for (let i = 0; i < clearedWidget.length; i++) {
        clearedWidget[i] = new Array(5).fill(0)
    }
    return clearedWidget;
}