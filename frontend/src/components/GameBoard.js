function Cell({ cellValue, shapeColor }) {
    switch(cellValue) {
        case 0: // Empty cell
            return <div className="w-[26px] aspect-square border border-solid border-slate-500 bg-black"/>
        case 1: // Static cell
            return <div className="w-[26px] aspect-square border border-solid border-slate-500 bg-slate-600"/>
        default: // Shape cell
            let color = "";
            switch (shapeColor) {
                case "red":
                    color = "bg-red-600";
                    break;
                case "teal":
                    color = "bg-teal-300";
                    break;
                case "blue":
                    color = "bg-blue-700";
                    break;
                case "green":
                    color = "bg-green-500";
                    break;
                case "purple":
                    color = "bg-violet-600";
                    break;
                case "orange":
                    color = "bg-orange-500";
                    break;
                default:
                    console.log("default case hit!") // Debug, this shouldn't happen
                    color = "bg-red-600";
            }
            return <div className={"w-[26px] aspect-square border border-solid border-slate-500 " + color}/>
    }
}

export default function GameBoard({ boardState, currentColor }) {
    return (
        <div className="border-2 border-solid border-slate-500 w-fit">
            {boardState.map((row, rowIndex) => (
                <div key={`${rowIndex}`} className="flex">
                    {row.map((cell, colIndex) => (
                        <Cell key={`${rowIndex}-${colIndex}`} cellValue={cell} shapeColor={currentColor}/>
                    ))}
                </div>
            ))}
        </div>
    )
}