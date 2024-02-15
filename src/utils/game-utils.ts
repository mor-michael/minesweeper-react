export function initCells(rows: number, cols: number) {
  const cell = {
    isOpen: false,
    isMine: false,
    number: 0,
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
  const shuffledCells = locationArray
    .filter(
      ([x, y]) => x !== firstCellLocation[0] || y !== firstCellLocation[1]
    )
    .sort(() => (Math.random() > 0.5 ? 1 : -1));
  return shuffledCells.slice(0, mineAmount);
}
