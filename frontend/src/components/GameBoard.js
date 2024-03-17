const NUM_ROWS = 25;
const NUM_COLS = 13;

function Cell({ cellValue }) {
    switch(cellValue) {
        case 0: // Empty cell
            return <div className="w-[26px] aspect-square border border-solid border-slate-500 bg-black"/>
        case 1: // Static cell
            return <div className="w-[26px] aspect-square border border-solid border-slate-500 bg-slate-600"/>
        default: // Shape cell
            return <div className="w-[26px] aspect-square border border-solid border-slate-500 bg-red-600"/>
    }
}

export default function GameBoard() {
    // Temporary - board initialization might be in a different file later
    const board = new Array(NUM_ROWS)
    for (let i = 0; i < board.length; i++) {
        board[i] = new Array(NUM_COLS).fill(0)
    }

    board[0][0] = 2;
    board[0][1] = 1;

    return (
        <div className="border-2 border-solid border-slate-500 w-fit">
            {board.map((row, rowIndex) => (
                <div key={`${rowIndex}`} className="flex">
                    {row.map((cell, colIndex) => (
                        <Cell key={`${rowIndex}-${colIndex}`} cellValue={cell} />
                    ))}
                </div>
            ))}
        </div>
    )
}