const NUM_ROWS = 25;
const NUM_COLS = 13;

export default function GameBoard() {
    // Temporary - board initialization might be in a different file later
    const board = new Array(NUM_ROWS)
    for (let i = 0; i < board.length; i++) {
        board[i] = new Array(NUM_COLS).fill(0)
    }

    return (
        <div className="border-2 border-solid border-slate-500 w-fit">
            {board.map((row, rowIndex) => (
                <div key={`${rowIndex}`} className="flex">
                    {row.map((cell, colIndex) => (
                        <div key={`${rowIndex}-${colIndex}`} className="w-[26px] aspect-square border border-solid border-slate-500 bg-black">t</div>
                    ))}
                </div>
            ))}
        </div>
    )
}