export default function Widget({ widget, onSquareClick }) {
    return (
        <div className="border-2 border-solid border-slate-500 w-fit">
            {widget.map((row, rowIndex) => (
                <div key={`${rowIndex}`} className="flex">
                    {row.map((cell, colIndex) => {
                        // Empty
                        if (cell == 0) {
                            return <div key={`${rowIndex}-${colIndex}`} onClick={() => onSquareClick(rowIndex, colIndex)} className="w-[50px] aspect-square border border-solid border-slate-500 bg-black"/>
                        }
                        // Filled
                        else {
                            return <div key={`${rowIndex}-${colIndex}`} onClick={() => onSquareClick(rowIndex, colIndex)} className="w-[50px] aspect-square border border-solid border-slate-500 bg-slate-200"/>
                        }
                    })}
                </div>
            ))}
        </div>
    )
}