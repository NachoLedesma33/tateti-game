export const BOARD_CONFIGS = {
  3: { win: 3, cell: 1.6 },
  4: { win: 4, cell: 1.25 },
  5: { win: 4, cell: 1.0 },
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
