export const BOARD_CONFIGS = {
  3: { win: 3, cell: 1.6 },
  4: { win: 4, cell: 1.25 },
  6: { win: 6, cell: 0.85 },
}

export const DIAGONALS = {
  3: [
    [0, 4, 8],
    [2, 4, 6],
  ],
  4: [
    [0, 5, 10, 15],
    [3, 6, 9, 12],
  ],
  6: [
    [0, 7, 14, 21, 28, 35],
    [5, 10, 15, 20, 25, 30],
  ],
}

export const PLAYER_COLORS = {
  X: '#ec4899',
  O: '#22d3ee',
}

export function createEmptyBoard(size) {
  return new Array(size * size).fill(null)
}

export function boardIndex(row, col, size) {
  return row * size + col
}
