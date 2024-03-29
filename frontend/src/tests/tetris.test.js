import * as useBoard from "../tetris/useBoard"

test("Lower Rows Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    board[useBoard.NUM_ROWS - 2][0] = 1
    board[useBoard.NUM_ROWS - 3][1] = 1
    board[useBoard.NUM_ROWS - 4][2] = 1
    board[useBoard.NUM_ROWS - 5][3] = 1
    board[useBoard.NUM_ROWS - 6][4] = 1
    var rows = [useBoard.NUM_ROWS - 3, useBoard.NUM_ROWS - 5]

    useBoard.lowerRows(board, rows)

    expect(board[useBoard.NUM_ROWS - 2][0]).toBe(1)
    expect(board[useBoard.NUM_ROWS - 3][2]).toBe(1)
    expect(board[useBoard.NUM_ROWS - 4][4]).toBe(1)
})

test("Remove Row Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    for (let j = 0; j < board[0].length; j++) {
        board[0][j] = 1
    }

    useBoard.removeRow(board, 0)

    for (let j = 0; j < board[0].length; j++) {
        expect(board[0][j]).toBe(0)
    }
})

test("Get Next Shape Unit Test", () => {
    var shape1 = [[useBoard.NUM_ROWS - 2, 0], [useBoard.NUM_ROWS - 2, 1], [useBoard.NUM_ROWS - 2, 2], [useBoard.NUM_ROWS - 3, 1]]
    var shape2 = [[useBoard.NUM_ROWS - 5, 0], [useBoard.NUM_ROWS - 5, 1], [useBoard.NUM_ROWS - 5, 2], [useBoard.NUM_ROWS - 5, 3]]
    var shapeQueue = [shape1, shape2]

    useBoard.getNextShape(shapeQueue)

    expect(shapeQueue.length).toBe(1)

    for (let p = 0; p < shapeQueue[0].length; p++) {
        let rowNumber = shapeQueue[0][p][0]
        expect(rowNumber).toBe(useBoard.NUM_ROWS - 5)
    }
})

test("Render New Shape Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    var points = [[useBoard.NUM_ROWS - 2, 0], [useBoard.NUM_ROWS - 2, 1], [useBoard.NUM_ROWS - 2, 2], [useBoard.NUM_ROWS - 3, 1]]

    expect(useBoard.translateShape(board, points, 0)).toBe(false)

    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        expect(board[rowNumber][columnNumber]).toBe(2)
    }
})

test("Translate Shape Downwards Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    var points = [[useBoard.NUM_ROWS - 2, 0], [useBoard.NUM_ROWS - 2, 1], [useBoard.NUM_ROWS - 2, 2], [useBoard.NUM_ROWS - 3, 1]]
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        board[rowNumber][columnNumber] = 2
    }

    expect(useBoard.translateShape(board, points, 0)).toBe(false)

    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        expect(board[rowNumber][columnNumber]).toBe(2)
    }
})

test("Fail to Translate Shape Horizontally Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    var points = [[useBoard.NUM_ROWS - 2, 0], [useBoard.NUM_ROWS - 2, 1], [useBoard.NUM_ROWS - 2, 2], [useBoard.NUM_ROWS - 3, 1]]
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        board[rowNumber][columnNumber] = 2
    }

    expect(useBoard.translateShape(board, points, -1)).toBe(false)

    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        expect(board[rowNumber][columnNumber]).toBe(2)
    }
})

test("Successfully Translate Shape Horizontally Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    var points = [[useBoard.NUM_ROWS - 2, 0], [useBoard.NUM_ROWS - 2, 1], [useBoard.NUM_ROWS - 2, 2], [useBoard.NUM_ROWS - 3, 1]]
    var pointsCopy = [[useBoard.NUM_ROWS - 2, 0], [useBoard.NUM_ROWS - 2, 1], [useBoard.NUM_ROWS - 2, 2], [useBoard.NUM_ROWS - 3, 1]]
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        board[rowNumber][columnNumber] = 2
    }

    expect(useBoard.translateShape(board, points, 1)).toBe(false)

    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        expect(board[rowNumber][columnNumber]).toBe(2)
        expect(points[p][1]).toBe(pointsCopy[p][1] + 1)
    }
})

test("Rotate Shape Off Left of Board Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    var points = [[useBoard.NUM_ROWS - 2, 0], [useBoard.NUM_ROWS - 3, 0], [useBoard.NUM_ROWS - 4, 0], [useBoard.NUM_ROWS - 5, 0]]
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        board[rowNumber][columnNumber] = 2
    }

    useBoard.rotateShape(board, points, -1)

    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        expect(board[rowNumber][columnNumber]).toBe(2)
    }
})

test("Rotate Shape Off Right of Board Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    var points = [[useBoard.NUM_ROWS - 2, useBoard.NUM_COLS -1], [useBoard.NUM_ROWS - 3, useBoard.NUM_COLS -1], [useBoard.NUM_ROWS - 4, useBoard.NUM_COLS -1], [useBoard.NUM_ROWS - 5, useBoard.NUM_COLS -1]]
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        board[rowNumber][columnNumber] = 2
    }

    useBoard.rotateShape(board, points, -1)

    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        expect(board[rowNumber][columnNumber]).toBe(2)
    }
})

test("Rotate Shape Off Bottom of Board Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    var points = [[useBoard.NUM_ROWS - 1, 1], [useBoard.NUM_ROWS - 1, 2], [useBoard.NUM_ROWS - 1, 3], [useBoard.NUM_ROWS - 1, 4]]
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        board[rowNumber][columnNumber] = 2
    }

    useBoard.rotateShape(board, points, -1)

    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        expect(board[rowNumber][columnNumber]).toBe(2)
    }
})

test("Rotate Shape Off Top of Board Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    var points = [[0, 1], [0, 2], [0, 3], [0, 4]]
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        board[rowNumber][columnNumber] = 2
    }

    useBoard.rotateShape(board, points, -1)

    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        expect(board[rowNumber][columnNumber]).toBe(2)
    }
})

test("Rotate Shape Into Another Shape Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    var solidShape = [[useBoard.NUM_ROWS - 1, 0], [useBoard.NUM_ROWS - 1, 1], [useBoard.NUM_ROWS - 1, 2], [useBoard.NUM_ROWS - 2, 1]]
    var points = [[useBoard.NUM_ROWS - 1, 3], [useBoard.NUM_ROWS - 2, 3], [useBoard.NUM_ROWS - 3, 3], [useBoard.NUM_ROWS - 2, 4]]
    for (let p = 0; p < solidShape.length; p++) {
        let rowNumber = solidShape[p][0]
        let columnNumber = solidShape[p][1]
        board[rowNumber][columnNumber] = 1
    }
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        board[rowNumber][columnNumber] = 2
    }

    useBoard.rotateShape(board, points, -1)

    for (let p = 0; p < solidShape.length; p++) {
        let rowNumber = solidShape[p][0]
        let columnNumber = solidShape[p][1]
        expect(board[rowNumber][columnNumber]).toBe(1)
    }
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        expect(board[rowNumber][columnNumber]).toBe(2)
    }
})

test("Rotate Shape Counter Clockwise Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    var points = [[useBoard.NUM_ROWS - 1, 3], [useBoard.NUM_ROWS - 2, 3], [useBoard.NUM_ROWS - 3, 3], [useBoard.NUM_ROWS - 2, 4]]
    var endPosition = [[useBoard.NUM_ROWS - 2, 3], [useBoard.NUM_ROWS - 2, 4], [useBoard.NUM_ROWS - 2, 5], [useBoard.NUM_ROWS - 3, 4]]
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        board[rowNumber][columnNumber] = 2
    }

    useBoard.rotateShape(board, points, -1)

    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        expect(board[rowNumber][columnNumber]).toBe(2)
    }

    expect(points.sort()).toEqual(endPosition.sort())
})

test("Rotate Shape Clockwise Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    var points = [[useBoard.NUM_ROWS - 1, 3], [useBoard.NUM_ROWS - 2, 3], [useBoard.NUM_ROWS - 3, 3], [useBoard.NUM_ROWS - 2, 4]]
    var endPosition = [[useBoard.NUM_ROWS - 3, 3], [useBoard.NUM_ROWS - 3, 4], [useBoard.NUM_ROWS - 3, 5], [useBoard.NUM_ROWS - 2, 4]]
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        board[rowNumber][columnNumber] = 2
    }

    useBoard.rotateShape(board, points, 1)

    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        expect(board[rowNumber][columnNumber]).toBe(2)
    }

    expect(points.sort()).toEqual(endPosition.sort())
})

test("Lower Shape Without Freeze Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    var points = [[useBoard.NUM_ROWS - 2, 0], [useBoard.NUM_ROWS - 2, 1], [useBoard.NUM_ROWS - 2, 2], [useBoard.NUM_ROWS - 3, 1]]
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        board[rowNumber][columnNumber] = 2
    }

    expect(useBoard.lowerShape(board, points)).toBe(false)

    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        expect(board[rowNumber][columnNumber]).toBe(2)
    }
})

test("Lower Shape to Shape and Freeze Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    var solidShape = [[useBoard.NUM_ROWS - 1, 0], [useBoard.NUM_ROWS - 1, 1], [useBoard.NUM_ROWS - 1, 2], [useBoard.NUM_ROWS - 2, 1]]
    var points = [[useBoard.NUM_ROWS - 3, 0], [useBoard.NUM_ROWS - 3, 1], [useBoard.NUM_ROWS - 3, 2], [useBoard.NUM_ROWS - 3, 3]]
    for (let p = 0; p < solidShape.length; p++) {
        let rowNumber = solidShape[p][0]
        let columnNumber = solidShape[p][1]
        board[rowNumber][columnNumber] = 1
    }
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        board[rowNumber][columnNumber] = 2
    }

    expect(useBoard.lowerShape(board, points)).toBe(true)

    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        expect(board[rowNumber][columnNumber]).toBe(1)
    }
})

test("Lower Shape to Ground and Freeze Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    var points = [[useBoard.NUM_ROWS - 1, 0], [useBoard.NUM_ROWS - 1, 1], [useBoard.NUM_ROWS - 1, 2], [useBoard.NUM_ROWS - 2, 1]]
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        board[rowNumber][columnNumber] = 2
    }

    expect(useBoard.lowerShape(board, points)).toBe(true)

    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        expect(board[rowNumber][columnNumber]).toBe(1)
    }
})

test("Freeze Shape Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    var points = [[useBoard.NUM_ROWS - 1, 0], [useBoard.NUM_ROWS - 1, 1], [useBoard.NUM_ROWS - 1, 2], [useBoard.NUM_ROWS - 2, 1]]
    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        board[rowNumber][columnNumber] = 2
    }

    useBoard.freeze(board, points)

    for (let p = 0; p < points.length; p++) {
        let rowNumber = points[p][0]
        let columnNumber = points[p][1]
        expect(board[rowNumber][columnNumber]).toBe(1)
    }
})

test("Generate Tetromino Unit Test", () => {
    var middleColumn = Math.floor(useBoard.NUM_COLS / 2);
    const tetrominos = [
        [[0, middleColumn - 2], [0, middleColumn - 1], [0, middleColumn], [0, middleColumn + 1]],
        [[0, middleColumn - 1], [0, middleColumn], [0, middleColumn + 1], [1, middleColumn + 1]],
        [[0, middleColumn - 1], [0, middleColumn], [0, middleColumn + 1], [1, middleColumn - 1]],
        [[1, middleColumn - 1], [1, middleColumn], [0, middleColumn], [0, middleColumn + 1]],
        [[0, middleColumn - 1], [0, middleColumn], [1, middleColumn], [1, middleColumn + 1]],
        [[0, middleColumn - 1], [0, middleColumn], [0, middleColumn + 1], [1, middleColumn]],
        [[0, middleColumn - 1], [0, middleColumn], [1, middleColumn - 1], [1, middleColumn]]
    ]

    expect(tetrominos).toContainEqual(useBoard.generateTetromino())
})

test("Initialize Empty Board Unit Test", () => {
    expect(useBoard.NUM_ROWS).toBe(25)
    expect(useBoard.NUM_COLS).toBe(13)

    var board = useBoard.initializeEmptyBoard()
    for (let i = 0; i < useBoard.NUM_ROWS; i++) {
        for (let j = 0; j < useBoard.NUM_COLS; j++) {
            expect(board[i][j]).toBe(0)
        }
    }
})

test("Select Next Block Color Unit Test", () => {
    const colors = [
        "red",
        "teal",
        "blue",
        "green",
        "purple",
        "orange"
    ]

    expect(colors).toContain(useBoard.selectNextColor())
})