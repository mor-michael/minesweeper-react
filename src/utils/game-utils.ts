export function initCells(rows: number, cols: number) {
  const cell = {
    isOpen: false,
    isMine: false,
    neighMines: 0,
    isFlagged: false,
  };
  const colArray = [];
  for (let c = 0; c < cols; c++) {
    const rowArray = [];
    for (let r = 0; r < rows; r++) {
      rowArray.push(cell);
    }
    colArray.push(rowArray);
  }
  return colArray;
}

export function findNeighbors(
  row: number,
  col: number,
  rows: number,
  cols: number
) {
  return [
    [row - 1, col - 1],
    [row - 1, col],
    [row - 1, col + 1],
    [row, col - 1],
    [row, col + 1],
    [row + 1, col - 1],
    [row + 1, col],
    [row + 1, col + 1],
  ].filter(([row, col]) => row >= 0 && col >= 0 && row < rows && col < cols);
}

function shuffle(arr: number[][]) {
  let i = arr.length,
    j,
    temp;
  while (--i > 0) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[j];
    arr[j] = arr[i];
    arr[i] = temp;
  }
}

export function generateMineLocations(
  rows: number,
  cols: number,
  mineAmount: number,
  firstCellLocation: number[]
) {
  const locationArray = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      locationArray.push([r, c]);
    }
  }
  locationArray.splice(
    locationArray.indexOf([firstCellLocation[0], firstCellLocation[0]])
  );
  shuffle(locationArray);
  return locationArray.slice(0, mineAmount);
}
