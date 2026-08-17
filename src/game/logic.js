import { BOARD_CONFIGS, DIAGONALS } from './constants'

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

export function isOnDiagonal(index, size) {
  const diags = DIAGONALS[size]
  if (!diags) return false
  return diags.some((d) => d.includes(index))
}

export function isAdjacent(from, to, size) {
  const r1 = Math.floor(from / size)
  const c1 = from % size
  const r2 = Math.floor(to / size)
  const c2 = to % size
  const dr = Math.abs(r1 - r2)
  const dc = Math.abs(c1 - c2)

  if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) return true

  if (dr === 1 && dc === 1) {
    const diags = DIAGONALS[size]
    if (!diags) return false
    return diags.some((d) => d.includes(from) && d.includes(to))
  }

  return false
}

export function canAnyoneWin(board, size) {
  const lines = getWinningLines(size)
  const win = BOARD_CONFIGS[size].win
  for (const line of lines) {
    let xCount = 0
    let oCount = 0
    let emptyCount = 0
    for (const i of line) {
      if (board[i] === 'X') xCount++
      else if (board[i] === 'O') oCount++
      else emptyCount++
    }
    if (oCount === 0 && xCount + emptyCount >= win) return true
    if (xCount === 0 && oCount + emptyCount >= win) return true
  }
  return false
}
