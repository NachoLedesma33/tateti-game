import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PLAYER_COLORS } from '../../game/constants'

function XPiece({ opacity = 1 }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current) return
    const s = Math.min(1, (ref.current.userData.t += delta * 4))
    ref.current.scale.setScalar(0.2 + 0.8 * (1 - (1 - s) ** 3))
  })

  const intensity = opacity === 1 ? 2.2 : 0.4

  return (
    <group ref={ref} userData={{ t: 0.05 }}>
      <mesh rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.16, 0.85, 0.16]} />
        <meshStandardMaterial
          color={PLAYER_COLORS.X}
          emissive={PLAYER_COLORS.X}
          emissiveIntensity={intensity}
          transparent={opacity < 1}
          opacity={opacity}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]} castShadow>
        <boxGeometry args={[0.16, 0.85, 0.16]} />
        <meshStandardMaterial
          color={PLAYER_COLORS.X}
          emissive={PLAYER_COLORS.X}
          emissiveIntensity={intensity}
          transparent={opacity < 1}
          opacity={opacity}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.3, 0.85, 0.3]} />
        <meshBasicMaterial
          color={PLAYER_COLORS.X}
          transparent
          opacity={0.12 * opacity}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export default XPiece
