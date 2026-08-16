import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { BOARD_CONFIGS, boardIndex } from '../game/constants'
import OPiece from './pieces/OPiece'
import XPiece from './pieces/XPiece'

function GridLine({ start, end, color }) {
  const mid = start.map((v, i) => (v + end[i]) / 2)
  const length = Math.hypot(...end.map((v, i) => v - start[i]))
  return (
    <mesh position={mid}>
      <boxGeometry args={[0.05, length, 0.05]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.4}
        toneMapped={false}
      />
    </mesh>
  )
}

function CellPlate({ active, onPointerOver, onPointerOut, onClick, interactive }) {
  const matRef = useRef()
  const target = useRef(0)
  const current = useRef(0)

  useEffect(() => {
    target.current = active ? 1.1 : 0
  }, [active])

  useFrame(() => {
    if (!matRef.current) return
    current.current += (target.current - current.current) * 0.18
    matRef.current.emissiveIntensity = current.current
  })

  return (
    <mesh
      onPointerOver={(e) => {
        e.stopPropagation()
        if (interactive) {
          target.current = 1.1
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
      <boxGeometry args={[0.96, 0.08, 0.96]} />
      <meshStandardMaterial
        ref={matRef}
        color={active ? '#2a1a5e' : '#150b33'}
        emissive="#a855f7"
        emissiveIntensity={0}
        roughness={0.3}
        metalness={0.5}
      />
    </mesh>
  )
}

function Board3D({ size = 3, board, onCellClick, interactive = true, currentPlayer }) {
  const cfg = BOARD_CONFIGS[size]
  const n = size
  const cell = cfg.cell
  const total = n * cell
  const half = total / 2

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
        start={[t, 0.13, -half]}
        end={[t, 0.13, half]}
        color="#22d3ee"
      />,
      <GridLine
        key={`h${i}`}
        start={[-half, 0.13, t]}
        end={[half, 0.13, t]}
        color="#ec4899"
      />,
    )
  }

  return (
    <group>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[total + 0.2, 0.12, total + 0.2]} />
        <meshStandardMaterial color="#1a0f3a" roughness={0.25} metalness={0.7} />
      </mesh>
      {lines}

      {positions.map(({ index, x, z }) => {
        const value = board[index]
        const isHovered = hoveredIndex === index
        return (
          <group key={index}>
            <CellPlate
              position={[x, 0.14, z]}
              active={isHovered}
              interactive={interactive}
              onPointerOver={() => setHoveredIndex(index)}
              onPointerOut={() => setHoveredIndex(null)}
              onClick={() => onCellClick?.(index)}
            />
            {value === 'X' && (
              <group position={[x, 0.55, z]}>
                <XPiece />
              </group>
            )}
            {value === 'O' && (
              <group position={[x, 0.55, z]}>
                <OPiece />
              </group>
            )}
            {!value && isHovered && interactive && currentPlayer && (
              <group position={[x, 0.55, z]}>
                {currentPlayer === 'X' ? <XPiece opacity={0.22} /> : <OPiece opacity={0.22} />}
              </group>
            )}
          </group>
        )
      })}
    </group>
  )
}

export default Board3D
