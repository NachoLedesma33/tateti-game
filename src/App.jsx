import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Scene from './components/Scene'
import PostFX from './components/PostFX'
import Board3D from './components/Board3D'
import ArcadeHUD from './components/ArcadeHUD'
import WinBanner from './components/WinBanner'
import { initArcadeAudio, isMuted, playCoin, playDraw, playHover, playLose, playPlace, playWin, setMuted as setAudioMuted } from './audio/arcadeAudio'
import { createEmptyBoard } from './game/constants'
import { checkWinner, isBoardFull } from './game/logic'
import { getAIMove } from './game/ai'

const AI_PLAYER = 'O'
const SCORES_KEY = 'tateti-scores'

const DEFAULT_SCORES = { X: 0, O: 0, ties: 0 }

function loadScores() {
  try {
    const raw = localStorage.getItem(SCORES_KEY)
    if (!raw) return { ...DEFAULT_SCORES }
    const parsed = JSON.parse(raw)
    return {
      X: Number(parsed.X) || 0,
      O: Number(parsed.O) || 0,
      ties: Number(parsed.ties) || 0,
    }
  } catch {
    return { ...DEFAULT_SCORES }
  }
}

function App() {
  const [size, setSize] = useState(3)
  const [board, setBoard] = useState(() => createEmptyBoard(3))
  const [currentPlayer, setCurrentPlayer] = useState('X')
  const [winner, setWinner] = useState(null)
  const [winningLine, setWinningLine] = useState(null)
  const [draw, setDraw] = useState(false)
  const [mode, setMode] = useState('pvp')
  const [difficulty, setDifficulty] = useState('medium')
  const [scores, setScores] = useState(loadScores)
  const [muted, setMuted] = useState(isMuted)
  const hoverSoundRef = useRef({ last: 0 })

  const handleCellHover = useCallback(() => {
    const now = Date.now()
    if (now - hoverSoundRef.current.last > 70) {
      hoverSoundRef.current.last = now
      playHover()
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores))
  }, [scores])

  useEffect(() => {
    if (winner) {
      setScores((s) => ({ ...s, [winner]: s[winner] + 1 }))
    } else if (draw) {
      setScores((s) => ({ ...s, ties: s.ties + 1 }))
    }
  }, [winner, draw])

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
      playPlace()

      const result = checkWinner(next, size)
      if (result.winner) {
        setWinner(result.winner)
        setWinningLine(result.line)
        if (mode === 'pve' && result.winner === AI_PLAYER) playLose()
        else playWin()
        return
      }
      if (isBoardFull(next)) {
        setDraw(true)
        playDraw()
        return
      }
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
    },
    [board, currentPlayer, winner, draw, size, mode],
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

  const insertCoin = useCallback(() => {
    playCoin()
    setScores({ ...DEFAULT_SCORES })
    resetGame()
  }, [resetGame])

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

  const bannerKind = winner
    ? mode === 'pve' && winner === AI_PLAYER
      ? 'lose'
      : winner === 'X'
        ? 'x'
        : 'o'
    : draw
      ? 'draw'
      : null

  const toggleSound = useCallback(() => {
    setMuted((prev) => {
      const next = !prev
      setAudioMuted(next)
      return next
    })
  }, [])

  const status = winner
    ? `${winner} WINS`
    : draw
      ? 'DRAW'
      : mode === 'pve' && currentPlayer === AI_PLAYER
        ? 'CPU THINKING'
        : `TURN: ${currentPlayer}`

  const statusTone = winner
    ? 'text-yellow-300'
    : draw
      ? 'text-purple-300'
      : currentPlayer === 'X'
        ? 'text-fuchsia-400'
        : 'text-cyan-300'

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
          onCellHover={handleCellHover}
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

      <ArcadeHUD
        size={size}
        mode={mode}
        difficulty={difficulty}
        scores={scores}
        status={status}
        statusTone={statusTone}
        muted={muted}
        onToggleSound={toggleSound}
        onSize={(s) => resetGame(s)}
        onMode={(m) => {
          setMode(m)
          resetGame()
        }}
        onDifficulty={setDifficulty}
        onRestart={() => resetGame()}
        onInsertCoin={insertCoin}
      />

      {bannerKind && <WinBanner kind={bannerKind} scores={scores} onRestart={() => resetGame()} />}
    </div>
  )
}

export default App
