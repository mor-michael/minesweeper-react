import { useState, memo, useCallback, useEffect } from "react";
import {
  initCells,
  findNeighbors,
  generateMineLocations,
} from "../../utils/game-utils";

type updateCellState = (
  x: number,
  y: number,
  newCellState: { isOpen: boolean; isMine: boolean }
) => void;

type initMines = (firstCellLocation: number[]) => void;

type CellProps = {
  index: number;
  isOpen: boolean;
  isMine: boolean;
  updateCellState: updateCellState;
  x: number;
  y: number;
  rows: number;
  cols: number;
  initMines: initMines;
};

// Memoize Cell component to avoid rerendering the whole list
// of cells when modifying only handful
const Cell = memo(
  ({
    index,
    x,
    y,
    rows,
    cols,
    updateCellState,
    isOpen,
    isMine,
    initMines,
  }: CellProps) => {
    const bgColor = `${isOpen ? "bg-gray-300" : "bg-gray-400"}`;

    function handleClick() {
      updateCellState(x, y, { isOpen: !isOpen, isMine: isMine });
      initMines([x, y]);
      console.log(findNeighbors(x, y, rows, cols));
    }

    useEffect(() => console.log("cell rerender"));

    return (
      <button
        onClick={handleClick}
        className={`w-[56px] h-[56px] rounded-sm ${bgColor}`}
      >
        {index}
        {isMine ? "*" : ""}
      </button>
    );
  }
);

function GameBoard({ cols = 9, rows = 9, mineAmount = 10 }) {
  const [cells, setCells] = useState(() => initCells(cols, rows));
  const [minesGenerated, setMinesGenerated] = useState(false);

  // useCallback with functional updates to make other cells not rerender
  const updateCellState = useCallback(
    (
      x: number,
      y: number,
      newCellState: { isOpen: boolean; isMine: boolean }
    ) => {
      setCells((prevCells) =>
        prevCells.map((cells, rowIndex) =>
          cells.map((cell, colIndex) =>
            rowIndex !== x || colIndex !== y
              ? cell
              : { ...cell, ...newCellState }
          )
        )
      );
    },
    []
  );
  const initMines = useCallback(
    (firstCellLocation: number[]) => {
      if (!minesGenerated) {
        const mineLocations = generateMineLocations(
          cols,
          rows,
          mineAmount,
          firstCellLocation
        );
        mineLocations.map(([x, y]) =>
          updateCellState(x, y, { isOpen: cells[x][y].isOpen, isMine: true })
        );
        setMinesGenerated(true);
      }
    },
    [minesGenerated] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div
      style={{
        gridTemplateColumns: `repeat(${cols}, 0fr)`,
      }}
      className={`grid gap-1 justify-center mt-20 mx-auto`}
    >
      {cells.map((cellRow, rowIndex) =>
        cellRow.map(({ isOpen, isMine, number }, colIndex) => (
          <Cell
            isOpen={isOpen}
            isMine={isMine}
            updateCellState={updateCellState}
            index={number}
            key={number}
            x={rowIndex}
            y={colIndex}
            rows={rows}
            cols={cols}
            initMines={initMines}
          />
        ))
      )}
    </div>
  );
}

export default GameBoard;
