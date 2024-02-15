import { useState, memo, useCallback, useEffect } from "react";
import {
  initCells,
  findNeighbors,
  generateMineLocations,
} from "../../utils/game-utils";

export type Cell = {
  isOpen: boolean;
  isMine: boolean;
  number: number;
};

type revealCells = (x: number, y: number) => void;

type CellProps = {
  index: number;
  isOpen: boolean;
  isMine: boolean;
  x: number;
  y: number;
  revealCells: revealCells;
};

// Memoize Cell component to avoid rerendering the whole list
// of cells when modifying only handful
const Cell = memo(({ index, x, y, isOpen, isMine, revealCells }: CellProps) => {
  const bgColor = `${isOpen ? "bg-gray-300" : "bg-gray-400"}`;

  function handleClick() {
    revealCells(x, y);
  }

  useEffect(() => console.log("cell rerender"));

  return (
    <button
      onClick={handleClick}
      className={`w-[56px] h-[56px] rounded-sm ${bgColor}`}
    >
      {isMine ? "*" : isOpen && index}
    </button>
  );
});

function GameBoard({ cols = 9, rows = 9, mineAmount = 10 }) {
  const [cells, setCells] = useState(() => initCells(cols, rows));
  const [minesGenerated, setMinesGenerated] = useState(false);

  useEffect(() => console.log("board rerender"));

  const initMines = useCallback(
    (firstCellLocation: number[]) => {
      const newCells = [...cells];
      const mineLocations = generateMineLocations(
        cols,
        rows,
        mineAmount,
        firstCellLocation
      );
      mineLocations.forEach(([x, y]) => {
        newCells[x][y] = { ...cells[x][y], isMine: true };
      });
      const newCellsNeighMines = newCells.map((cellRow, x) =>
        cellRow.map((cell, y) => {
          if (!cell.isMine) {
            const neighbors = findNeighbors(x, y, rows, cols);
            const neighborMines = neighbors.filter(
              ([nx, ny]) => newCells[nx][ny].isMine
            );
            return { ...cell, number: neighborMines.length };
          } else {
            return { ...cell, number: 0 };
          }
        })
      );
      setMinesGenerated(true);
      return newCellsNeighMines;
    },
    [minesGenerated] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const recursiveReveal = (cellArray: Cell[][], x: number, y: number) => {
    cellArray[x][y] = { ...cellArray[x][y], isOpen: true };
    const neighbors = findNeighbors(x, y, rows, cols);
    neighbors.forEach(([neighX, neighY]) => {
      if (
        !cellArray[neighX][neighY].isMine &&
        !cellArray[neighX][neighY].isOpen &&
        cellArray[x][y].number === 0
      ) {
        recursiveReveal(cellArray, neighX, neighY);
      }
    });
  };

  const revealCells = useCallback(
    (x: number, y: number) => {
      const newCells = minesGenerated ? [...cells] : initMines([x, y]);
      recursiveReveal(newCells, x, y);
      setCells(newCells);
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
            index={number}
            key={colIndex}
            x={rowIndex}
            y={colIndex}
            revealCells={revealCells}
          />
        ))
      )}
    </div>
  );
}

export default GameBoard;
