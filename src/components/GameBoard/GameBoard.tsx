import { useState, memo, useCallback, useEffect, SyntheticEvent } from "react";
import {
  initCells,
  findNeighbors,
  generateMineLocations,
} from "../../utils/game-utils";

type Cell = {
  isOpen: boolean;
  isMine: boolean;
  isFlagged: boolean;
  neighMines: number;
};

type revealCells = (x: number, y: number) => void;
type flagCell = (x: number, y: number) => void;

type CellProps = Cell & {
  x: number;
  y: number;
  revealCells: revealCells;
  flagCell: flagCell;
};

// Memoize Cell component to avoid rerendering the whole list
// of cells when modifying only handful
const Cell = memo(
  ({
    neighMines,
    x,
    y,
    isOpen,
    isMine,
    isFlagged,
    revealCells,
    flagCell,
  }: CellProps) => {
    const bgColor = `${isOpen ? "bg-gray-300" : "bg-gray-400"}`;

    function handleClick(event: SyntheticEvent) {
      event.preventDefault();
      if (event.type === "click") {
        revealCells(x, y);
      } else if (event.type === "contextmenu" && !isOpen) {
        flagCell(x, y);
      }
    }

    useEffect(() => console.log("cell rerender"));

    return (
      <button
        onClick={handleClick}
        onContextMenu={handleClick}
        className={`w-[56px] h-[56px] rounded-sm ${bgColor}`}
      >
        {isOpen && neighMines !== 0 && neighMines}
        {isMine && isOpen && "M"}
        {isFlagged && "P"}
      </button>
    );
  }
);

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
            return { ...cell, neighMines: neighborMines.length };
          } else {
            return { ...cell, neighMines: 0 };
          }
        })
      );
      setMinesGenerated(true);
      return newCellsNeighMines;
    },
    [minesGenerated] // eslint-disable-line react-hooks/exhaustive-deps
  );

  function recursiveReveal(cellArray: Cell[][], x: number, y: number) {
    const neighbors = findNeighbors(x, y, rows, cols);
    if (cellArray[x][y].isOpen) {
      // chording
      const flaggedNeighbors = neighbors.filter(
        ([x, y]) => cellArray[x][y].isFlagged
      ).length;
      const mineNeighbors = neighbors.filter(
        ([x, y]) => cellArray[x][y].isMine
      ).length;
      if (flaggedNeighbors === mineNeighbors) {
        neighbors.forEach(([neighX, neighY]) => {
          if (
            !cellArray[neighX][neighY].isOpen &&
            !cellArray[neighX][neighY].isFlagged
          ) {
            recursiveReveal(cellArray, neighX, neighY);
          }
        });
      }
    } else {
      // opening cells
      cellArray[x][y] = { ...cellArray[x][y], isOpen: true };
      // if mine is opened, the game is lost
      if (cellArray[x][y].isMine && cellArray[x][y].isOpen) {
        cellArray.flat().map((cell) => (cell.isOpen = true));
        alert("game over");
      }
      neighbors.forEach(([neighX, neighY]) => {
        if (
          !cellArray[neighX][neighY].isMine &&
          !cellArray[neighX][neighY].isOpen &&
          cellArray[x][y].neighMines === 0
        ) {
          recursiveReveal(cellArray, neighX, neighY);
        }
      });
    }
  }

  const revealCells = useCallback(
    (x: number, y: number) => {
      const newCells = minesGenerated ? [...cells] : initMines([x, y]);
      recursiveReveal(newCells, x, y);
      const openedCellAmount = newCells
        .flat()
        .filter((cell) => cell.isOpen).length;
      // if all cells except for mines are open, the game results in a victory
      if (openedCellAmount === rows * cols - mineAmount) {
        alert("you won!");
      }
      setCells(newCells);
    },
    [minesGenerated] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const flagCell = useCallback(
    (x: number, y: number) => {
      const newCells = [...cells];
      newCells[x][y] = { ...cells[x][y], isFlagged: !cells[x][y].isFlagged };
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
        cellRow.map(({ isOpen, isMine, isFlagged, neighMines }, colIndex) => (
          <Cell
            key={colIndex}
            isOpen={isOpen}
            isMine={isMine}
            isFlagged={isFlagged}
            neighMines={neighMines}
            x={rowIndex}
            y={colIndex}
            revealCells={revealCells}
            flagCell={flagCell}
          />
        ))
      )}
    </div>
  );
}

export default GameBoard;
