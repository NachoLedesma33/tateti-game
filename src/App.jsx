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
import { checkWinner, isBoardFull, canAnyoneWin, isAdjacent } from './game/logic'
import { getAIMove, getAIMoveClassic } from './game/ai'

const AI_PLAYER = 'O'
const SCORES_KEY = 'tateti-scores'

const noFx = new URLSearchParams(window.location.search).has('nofx')

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
  const [gameMode, setGameMode] = useState('standard')
  const [phase, setPhase] = useState('placement')
  const [pool, setPool] = useState({ X: 0, O: 0 })
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [placed, setPlaced] = useState({ X: 0, O: 0 })
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
      if (winner || draw) return

      if (gameMode === 'classic' && phase === 'movement') {
        if (selectedPiece === null) {
          if (board[index] === currentPlayer) {
            setSelectedPiece(index)
          }
          return
        }
        if (board[index] === null && isAdjacent(selectedPiece, index, size)) {
          const next = [...board]
          next[index] = next[selectedPiece]
          next[selectedPiece] = null
          setBoard(next)
          setSelectedPiece(null)
          playPlace()

          const result = checkWinner(next, size)
          if (result.winner) {
            setWinner(result.winner)
            setWinningLine(result.line)
            if (mode === 'pve' && result.winner === AI_PLAYER) playLose()
            else playWin()
            return
          }
          if (!canAnyoneWin(next, size)) {
            setDraw(true)
            playDraw()
            return
          }
          setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
        } else if (board[index] === currentPlayer) {
          setSelectedPiece(index)
        } else {
          setSelectedPiece(null)
        }
        return
      }

      if (board[index]) return

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
      if (!canAnyoneWin(next, size)) {
        setDraw(true)
        playDraw()
        return
      }
      if (isBoardFull(next)) {
        setDraw(true)
        playDraw()
        return
      }

      if (gameMode === 'classic' && phase === 'placement') {
        const nextPool = { ...pool, [currentPlayer]: pool[currentPlayer] - 1 }
        setPool(nextPool)
        const nextPlaced = { ...placed, [currentPlayer]: placed[currentPlayer] + 1 }
        setPlaced(nextPlaced)
        if (nextPool.X === 0 && nextPool.O === 0) {
          setPhase('movement')
        }
      }

      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
    },
    [board, currentPlayer, winner, draw, size, mode, gameMode, phase, pool, placed, selectedPiece],
  )

  const resetGame = useCallback(
    (nextSize = size) => {
      setSize(nextSize)
      setBoard(createEmptyBoard(nextSize))
      setCurrentPlayer('X')
      setWinner(null)
      setWinningLine(null)
      setDraw(false)
      setGameMode('standard')
      setPhase('placement')
      setPool({ X: 0, O: 0 })
      setPlaced({ X: 0, O: 0 })
      setSelectedPiece(null)
    },
    [size],
  )

  const resetGameClassic = useCallback(
    (nextSize = size) => {
      setSize(nextSize)
      setBoard(createEmptyBoard(nextSize))
      setCurrentPlayer('X')
      setWinner(null)
      setWinningLine(null)
      setDraw(false)
      setGameMode('classic')
      setPhase('placement')
      setPool({ X: nextSize, O: nextSize })
      setPlaced({ X: 0, O: 0 })
      setSelectedPiece(null)
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
      if (gameMode === 'classic' && phase === 'movement') {
        const move = getAIMoveClassic(board, size, difficulty, AI_PLAYER)
        if (move) {
          const next = [...board]
          next[move.to] = next[move.from]
          next[move.from] = null
          setBoard(next)
          playPlace()

          const result = checkWinner(next, size)
          if (result.winner) {
            setWinner(result.winner)
            setWinningLine(result.line)
            playLose()
            return
          }
          if (!canAnyoneWin(next, size)) {
            setDraw(true)
            playDraw()
            return
          }
          setCurrentPlayer(AI_PLAYER === 'X' ? 'O' : 'X')
        }
      } else {
        const move = getAIMove(board, size, difficulty, AI_PLAYER)
        if (move !== undefined) applyMove(move)
      }
    }, 650)
    return () => clearTimeout(timer)
  }, [aiTurn, board, size, difficulty, applyMove, gameMode, phase])

  const gameOver = Boolean(winner || draw)
  const isAITurn = mode === 'pve' && currentPlayer === AI_PLAYER
  const interactive = !gameOver && !isAITurn

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
      : isAITurn
        ? 'CPU THINKING'
        : gameMode === 'classic' && phase === 'placement'
          ? `PLACE (${pool[currentPlayer]} LEFT)`
          : gameMode === 'classic' && phase === 'movement' && selectedPiece !== null
            ? 'SELECT DESTINATION'
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
      <Canvas shadows={!noFx} camera={{ position: [8, 7, 10], fov: 45 }}>
        <Scene />
        <Board3D
          size={size}
          board={board}
          currentPlayer={currentPlayer}
          interactive={interactive}
          winningLine={winningLine}
          onCellClick={applyMove}
          onCellHover={handleCellHover}
          selectedPiece={selectedPiece}
          gameMode={gameMode}
          phase={phase}
        />
        {!noFx && <PostFX />}
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
        gameMode={gameMode}
        phase={phase}
        pool={pool}
        selectedPiece={selectedPiece}
        onToggleSound={toggleSound}
        onSize={(s) => {
          if (gameMode === 'classic') resetGameClassic(s)
          else resetGame(s)
        }}
        onGameMode={(m) => {
          if (m === 'classic') resetGameClassic()
          else resetGame()
        }}
        onMode={(m) => {
          setMode(m)
          if (gameMode === 'classic') resetGameClassic()
          else resetGame()
        }}
        onDifficulty={setDifficulty}
        onRestart={() => {
          if (gameMode === 'classic') resetGameClassic()
          else resetGame()
        }}
        onInsertCoin={insertCoin}
      />

      {bannerKind && <WinBanner kind={bannerKind} scores={scores} onRestart={() => resetGame()} />}
    </div>
  )
}

export default App
