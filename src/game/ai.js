import { getAvailableCells, checkWinner, isBoardFull, getWinningLines } from './logic'

const DEPTHS = { 3: Infinity, 4: 4, 5: 3 }
const OTHER = { X: 'O', O: 'X' }

function randomChoice(cells) {
  return cells[Math.floor(Math.random() * cells.length)]
}

function findWinningMove(board, size, player) {
  const cells = []
  for (const i of getAvailableCells(board)) {
    const copy = [...board]
    copy[i] = player
    if (checkWinner(copy, size).winner === player) cells.push(i)
  }
  return cells
}

function evaluate(board, size, aiPlayer) {
  let score = 0
  for (const line of getWinningLines(size)) {
    let ai = 0
    let hu = 0
    for (const i of line) {
      if (board[i] === aiPlayer) ai++
      else if (board[i]) hu++
    }
    if (ai && hu) continue
    if (ai) score += 10 ** (ai - 1)
    if (hu) score -= 10 ** (hu - 1)
  }
  return score
}

function minimax(board, size, depth, alpha, beta, maximizing, aiPlayer, human, maxDepth) {
  const result = checkWinner(board, size)
  if (result.winner === aiPlayer) return 1000000 - depth
  if (result.winner === human) return -1000000 + depth
  if (isBoardFull(board)) return 0
  if (depth >= maxDepth) return evaluate(board, size, aiPlayer)

  const player = maximizing ? aiPlayer : human

  if (maximizing) {
    let best = -Infinity
    for (const i of getAvailableCells(board)) {
      const copy = [...board]
      copy[i] = player
      best = Math.max(
        best,
        minimax(copy, size, depth + 1, alpha, beta, false, aiPlayer, human, maxDepth),
      )
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  }

  let best = Infinity
  for (const i of getAvailableCells(board)) {
    const copy = [...board]
    copy[i] = player
    best = Math.min(
      best,
      minimax(copy, size, depth + 1, alpha, beta, true, aiPlayer, human, maxDepth),
    )
    beta = Math.min(beta, best)
    if (beta <= alpha) break
  }
  return best
}

function easyMove(board, size, aiPlayer) {
  const human = OTHER[aiPlayer]
  const blockCandidates = findWinningMove(board, size, human)
  if (blockCandidates.length && Math.random() < 0.2) {
    return randomChoice(blockCandidates)
  }
  return randomChoice(getAvailableCells(board))
}

function mediumMove(board, size, aiPlayer) {
  const human = OTHER[aiPlayer]
  const myWin = findWinningMove(board, size, aiPlayer)
  if (myWin.length) return randomChoice(myWin)
  const block = findWinningMove(board, size, human)
  if (block.length) return randomChoice(block)
  const avail = getAvailableCells(board)
  const center = Math.floor(board.length / 2)
  if (avail.includes(center)) return center
  return randomChoice(avail)
}

function hardMove(board, size, aiPlayer) {
  const maxDepth = DEPTHS[size]
  const human = OTHER[aiPlayer]
  let bestScore = -Infinity
  let bestMoves = []

  for (const i of getAvailableCells(board)) {
    const copy = [...board]
    copy[i] = aiPlayer
    const score = minimax(copy, size, 1, -Infinity, Infinity, false, aiPlayer, human, maxDepth)
    if (score > bestScore) {
      bestScore = score
      bestMoves = [i]
    } else if (score === bestScore) {
      bestMoves.push(i)
    }
  }
  return randomChoice(bestMoves)
}

export function getAIMove(board, size, difficulty, aiPlayer) {
  if (difficulty === 'easy') return easyMove(board, size, aiPlayer)
  if (difficulty === 'medium') return mediumMove(board, size, aiPlayer)
  return hardMove(board, size, aiPlayer)
}
