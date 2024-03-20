import * as useBoard from "../tetris/useBoard"

test("Initialize Empty Board Unit Test", () => {
    var board = useBoard.initializeEmptyBoard()
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            expect(board[i][j]).toBe(0)
        }
    }
})