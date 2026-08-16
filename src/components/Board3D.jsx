import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, Quaternion } from 'three'
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
    <mesh ref={ref} position={[position.x, 0.3, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.45, 0.55, 32]} />
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
}) {
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

  const positionsMap = Object.fromEntries(positions.map((p) => [p.index, p]))

  return (
    <group>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[total + 0.2, 0.12, total + 0.2]} />
        <meshStandardMaterial color="#1a0f3a" roughness={0.25} metalness={0.7} />
      </mesh>
      {lines}

      {winningLine && <WinningBeam line={winningLine} positions={positionsMap} />}

      {positions.map(({ index, x, z }) => {
        const value = board[index]
        const isHovered = hoveredIndex === index
        const isWinning = winningLine?.includes(index)
        return (
          <group key={index}>
            <CellPlate
              position={[x, 0.14, z]}
              active={isHovered || isWinning}
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
