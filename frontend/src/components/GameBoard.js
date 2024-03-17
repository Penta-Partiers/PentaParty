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

export default function GameBoard({ boardState }) {
    return (
        <div className="border-2 border-solid border-slate-500 w-fit">
            {boardState.map((row, rowIndex) => (
                <div key={`${rowIndex}`} className="flex">
                    {row.map((cell, colIndex) => (
                        <Cell key={`${rowIndex}-${colIndex}`} cellValue={cell} />
                    ))}
                </div>
            ))}
        </div>
    )
}