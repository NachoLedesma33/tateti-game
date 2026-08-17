import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, Quaternion } from 'three'
import { BOARD_CONFIGS, boardIndex } from '../game/constants'
import { isAdjacent } from '../game/logic'
import OPiece from './pieces/OPiece'
import XPiece from './pieces/XPiece'

const LINE_Y = 0.15
const LINE_THICKNESS = 0.05
const PLATE_TOP = 0.15
const PIECE_Y = { X: 0.575, O: 0.68 }

function GridLine({ axis, length, position, color }) {
  const args = axis === 'x' ? [length, LINE_THICKNESS, 0.1] : [0.1, LINE_THICKNESS, length]
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.5}
        toneMapped={false}
      />
    </mesh>
  )
}

function CellPlate({
  size,
  position,
  active,
  validMove,
  onPointerOver,
  onPointerOut,
  onClick,
  interactive,
}) {
  const matRef = useRef()
  const target = useRef(0)
  const current = useRef(0)

  useEffect(() => {
    target.current = active || validMove ? 1.2 : 0
  }, [active, validMove])

  useFrame(() => {
    if (!matRef.current) return
    current.current += (target.current - current.current) * 0.18
    matRef.current.emissiveIntensity = current.current
    if (validMove) {
      matRef.current.color.set('#0d5c2e')
      matRef.current.emissive.set('#22c55e')
    } else {
      matRef.current.color.set(active ? '#3b2473' : '#201248')
      matRef.current.emissive.set('#a855f7')
    }
  })

  return (
    <mesh
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation()
        if (interactive) {
          target.current = 1.2
          onPointerOver?.()
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        if (interactive) {
          target.current = 0
          onPointerOut?.()
        }
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (interactive) onClick?.()
      }}
      receiveShadow
    >
      <boxGeometry args={[size, 0.06, size]} />
      <meshStandardMaterial
        ref={matRef}
        color="#201248"
        emissive="#a855f7"
        emissiveIntensity={0}
        roughness={0.35}
        metalness={0.5}
      />
    </mesh>
  )
}

function WinningBeam({ line, positions, color = '#facc15' }) {
  const matRef = useRef()
  const start = useMemo(
    () => new Vector3(positions[line[0]].x, 0.45, positions[line[0]].z),
    [positions, line],
  )
  const end = useMemo(
    () =>
      new Vector3(
        positions[line[line.length - 1]].x,
        0.45,
        positions[line[line.length - 1]].z,
      ),
    [positions, line],
  )
  const mid = useMemo(() => start.clone().add(end).multiplyScalar(0.5), [start, end])
  const quat = useMemo(() => {
    const dir = end.clone().sub(start).normalize()
    return new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir)
  }, [start, end])
  const length = useMemo(() => start.distanceTo(end), [start, end])

  useFrame(({ clock }) => {
    if (!matRef.current) return
    const pulse = 1.6 + Math.sin(clock.elapsedTime * 6) * 0.7
    matRef.current.emissiveIntensity = pulse
  })

  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.1, 0.1, length, 12]} />
      <meshStandardMaterial
        ref={matRef}
        color={color}
        emissive={color}
        emissiveIntensity={1.8}
        toneMapped={false}
      />
    </mesh>
  )
}

function WinningRing({ position, color = '#facc15' }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = (clock.elapsedTime * 1.5) % 1
    ref.current.scale.setScalar(0.4 + t)
    ref.current.material.opacity = (1 - t) * 0.8
  })
  return (
    <mesh
      ref={ref}
      position={[position.x, PLATE_TOP + 0.06, position.z]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[0.4, 0.5, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.6}
        side={2}
        toneMapped={false}
      />
    </mesh>
  )
}

function Board3D({
  size = 3,
  board,
  onCellClick,
  onCellHover = null,
  interactive = true,
  currentPlayer,
  winningLine = null,
  selectedPiece = null,
  validMoves = [],
  gameMode = 'standard',
  phase = 'placement',
}) {
  const cfg = BOARD_CONFIGS[size]
  const n = size
  const cell = cfg.cell
  const total = n * cell
  const half = total / 2
  const plateSize = cell * 0.94

  const [hoveredIndex, setHoveredIndex] = useState(null)

  const positions = []
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      positions.push({
        index: boardIndex(r, c, n),
        x: -half + c * cell + cell / 2,
        z: -half + r * cell + cell / 2,
      })
    }
  }

  const lines = []
  for (let i = 0; i <= n; i++) {
    const t = -half + i * cell
    lines.push(
      <GridLine
        key={`v${i}`}
        axis="z"
        length={total}
        position={[t, LINE_Y, 0]}
        color="#22d3ee"
      />,
      <GridLine
        key={`h${i}`}
        axis="x"
        length={total}
        position={[0, LINE_Y, t]}
        color="#ec4899"
      />,
    )
  }

  const positionsMap = Object.fromEntries(positions.map((p) => [p.index, p]))

  const computedValidMoves = (() => {
    if (validMoves.length > 0) return validMoves
    if (gameMode === 'classic' && phase === 'movement' && selectedPiece !== null) {
      const moves = []
      board.forEach((cell, index) => {
        if (cell === null && isAdjacent(selectedPiece, index, size)) {
          moves.push(index)
        }
      })
      return moves
    }
    return []
  })()

  return (
    <group position={[0, 0.36, 0]}>
      <mesh position={[0, 0.07, 0]} receiveShadow>
        <boxGeometry args={[total + 0.3, 0.14, total + 0.3]} />
        <meshStandardMaterial color="#221452" roughness={0.3} metalness={0.7} />
      </mesh>
      {lines}

      {winningLine && <WinningBeam line={winningLine} positions={positionsMap} />}

      {positions.map(({ index, x, z }) => {
        const value = board[index]
        const isHovered = hoveredIndex === index
        const isWinning = winningLine?.includes(index)
        const isSelected = selectedPiece === index
        const isValidMove = computedValidMoves.includes(index)
        return (
          <group key={index}>
            <CellPlate
              size={plateSize}
              position={[x, PLATE_TOP - 0.03, z]}
              active={isHovered || isWinning || isSelected}
              validMove={isValidMove}
              interactive={interactive}
              onPointerOver={() => {
                setHoveredIndex(index)
                onCellHover?.(index)
              }}
              onPointerOut={() => setHoveredIndex(null)}
              onClick={() => onCellClick?.(index)}
            />
            {isWinning && <WinningRing position={positionsMap[index]} />}
            {value === 'X' && (
              <group position={[x, isSelected ? PIECE_Y.X + 0.15 : PIECE_Y.X, z]}>
                <XPiece emissive={isSelected ? 2.5 : 1} />
              </group>
            )}
            {value === 'O' && (
              <group position={[x, isSelected ? PIECE_Y.O + 0.15 : PIECE_Y.O, z]}>
                <OPiece emissive={isSelected ? 2.5 : 1} />
              </group>
            )}
            {!value && isHovered && interactive && currentPlayer && !isValidMove && (
              <group position={[x, PIECE_Y[currentPlayer], z]}>
                {currentPlayer === 'X' ? <XPiece opacity={0.22} /> : <OPiece opacity={0.22} />}
              </group>
            )}
            {isValidMove && (
              <group position={[x, PIECE_Y[currentPlayer] - 0.1, z]}>
                {currentPlayer === 'X' ? <XPiece opacity={0.35} /> : <OPiece opacity={0.35} />}
              </group>
            )}
          </group>
        )
      })}
    </group>
  )
}

export default Board3D
