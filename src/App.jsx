import { useCallback, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Scene from './components/Scene'
import PostFX from './components/PostFX'
import Board3D from './components/Board3D'
import { initArcadeAudio } from './audio/arcadeAudio'
import { createEmptyBoard } from './game/constants'
import { checkWinner, isBoardFull } from './game/logic'
import { getAIMove } from './game/ai'

const AI_PLAYER = 'O'

function App() {
  const [size, setSize] = useState(3)
  const [board, setBoard] = useState(() => createEmptyBoard(3))
  const [currentPlayer, setCurrentPlayer] = useState('X')
  const [winner, setWinner] = useState(null)
  const [winningLine, setWinningLine] = useState(null)
  const [draw, setDraw] = useState(false)
  const [mode, setMode] = useState('pvp')
  const [difficulty, setDifficulty] = useState('medium')

  useEffect(() => {
    const kick = () => initArcadeAudio()
    window.addEventListener('pointerdown', kick)
    window.addEventListener('keydown', kick)
    return () => {
      window.removeEventListener('pointerdown', kick)
      window.removeEventListener('keydown', kick)
    }
  }, [])

  const applyMove = useCallback(
    (index) => {
      if (board[index] || winner || draw) return
      const next = [...board]
      next[index] = currentPlayer
      setBoard(next)

      const result = checkWinner(next, size)
      if (result.winner) {
        setWinner(result.winner)
        setWinningLine(result.line)
        return
      }
      if (isBoardFull(next)) {
        setDraw(true)
        return
      }
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
    },
    [board, currentPlayer, winner, draw, size],
  )

  const resetGame = useCallback(
    (nextSize = size) => {
      setSize(nextSize)
      setBoard(createEmptyBoard(nextSize))
      setCurrentPlayer('X')
      setWinner(null)
      setWinningLine(null)
      setDraw(false)
    },
    [size],
  )

  const aiTurn = mode === 'pve' && currentPlayer === AI_PLAYER && !winner && !draw

  useEffect(() => {
    if (!aiTurn) return
    const timer = setTimeout(() => {
      const move = getAIMove(board, size, difficulty, AI_PLAYER)
      if (move !== undefined) applyMove(move)
    }, 650)
    return () => clearTimeout(timer)
  }, [aiTurn, board, size, difficulty, applyMove])

  const gameOver = Boolean(winner || draw)
  const interactive = !gameOver && !(mode === 'pve' && currentPlayer === AI_PLAYER)
  const status = winner
    ? `${winner} WINS!`
    : draw
      ? 'DRAW'
      : mode === 'pve' && currentPlayer === AI_PLAYER
        ? 'CPU THINKING...'
        : `TURN: ${currentPlayer}`

  const diffLabel = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD' }

  return (
    <div className="relative h-full w-full">
      <Canvas shadows camera={{ position: [8, 7, 10], fov: 45 }}>
        <Scene />
        <Board3D
          size={size}
          board={board}
          currentPlayer={currentPlayer}
          interactive={interactive}
          winningLine={winningLine}
          onCellClick={applyMove}
        />
        <PostFX />
        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={6}
          maxDistance={22}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 0.5, 0]}
        />
      </Canvas>

      <div className="pointer-events-none absolute top-5 left-1/2 -translate-x-1/2 text-center">
        <h1 className="text-2xl font-bold tracking-[0.3em] text-cyan-300 uppercase drop-shadow-[0_0_12px_#22d3ee]">
          Tateti Arcade 3D
        </h1>
        <p
          className={`mt-2 text-sm font-semibold tracking-[0.25em] uppercase drop-shadow-[0_0_10px_currentColor] ${
            winner
              ? 'text-yellow-300'
              : draw
                ? 'text-purple-300'
                : currentPlayer === 'X'
                  ? 'text-fuchsia-400'
                  : 'text-cyan-300'
          }`}
        >
          {status}
        </p>
      </div>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'pvp' ? 'pve' : 'pvp')
            resetGame()
          }}
          className={`rounded border px-4 py-2 font-mono text-sm tracking-widest transition-all ${
            mode === 'pve'
              ? 'border-emerald-300 bg-emerald-400/20 text-emerald-200 shadow-[0_0_14px_#34d399]'
              : 'border-amber-400/60 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'
          }`}
        >
          {mode === 'pvp' ? 'PVP' : 'VS AI'}
        </button>

        {mode === 'pve' &&
          ['easy', 'medium', 'hard'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`rounded border px-3 py-2 font-mono text-xs tracking-widest transition-all ${
                difficulty === d
                  ? 'border-cyan-300 bg-cyan-400/20 text-cyan-200 shadow-[0_0_14px_#22d3ee]'
                  : 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-300 hover:bg-fuchsia-500/20'
              }`}
            >
              {diffLabel[d]}
            </button>
          ))}

        <div className="h-6 w-px bg-white/15" />

        {[3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => resetGame(s)}
            className={`rounded border px-4 py-2 font-mono text-sm tracking-widest transition-all ${
              size === s
                ? 'border-cyan-300 bg-cyan-400/20 text-cyan-200 shadow-[0_0_14px_#22d3ee]'
                : 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-300 hover:bg-fuchsia-500/20'
            }`}
          >
            {s}x{s}
          </button>
        ))}
        <button
          type="button"
          onClick={() => resetGame()}
          className="rounded border border-yellow-400/60 bg-yellow-400/10 px-4 py-2 font-mono text-sm tracking-widest text-yellow-300 transition-all hover:bg-yellow-400/20"
        >
          RESTART
        </button>
      </div>
    </div>
  )
}

export default App
