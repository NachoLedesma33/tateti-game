import { BOARD_CONFIGS } from './constants'

const lineCache = new Map()

export function getWinningLines(size) {
  if (lineCache.has(size)) return lineCache.get(size)

  const win = BOARD_CONFIGS[size].win
  const lines = []

  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - win; c++) {
      lines.push(Array.from({ length: win }, (_, i) => r * size + c + i))
      lines.push(Array.from({ length: win }, (_, i) => (c + i) * size + r))
    }
  }

  for (let r = 0; r <= size - win; r++) {
    for (let c = 0; c <= size - win; c++) {
      lines.push(Array.from({ length: win }, (_, i) => (r + i) * size + c + i))
      lines.push(
        Array.from({ length: win }, (_, i) => (r + i) * size + (c + win - 1 - i)),
      )
    }
  }

  lineCache.set(size, lines)
  return lines
}

export function checkWinner(board, size) {
  for (const line of getWinningLines(size)) {
    const first = board[line[0]]
    if (first && line.every((i) => board[i] === first)) {
      return { winner: first, line }
    }
  }
  return { winner: null, line: null }
}

export function isBoardFull(board) {
  return board.every((cell) => cell !== null)
}

export function getAvailableCells(board) {
  const cells = []
  board.forEach((cell, index) => {
    if (cell === null) cells.push(index)
  })
  return cells
}
