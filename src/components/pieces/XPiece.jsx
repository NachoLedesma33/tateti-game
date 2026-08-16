import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PLAYER_COLORS } from '../../game/constants'
import { prefersReducedMotion } from '../../game/motion'

function XPiece({ opacity = 1 }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current) return
    if (prefersReducedMotion()) {
      ref.current.scale.setScalar(1)
      return
    }
    ref.current.userData.t = Math.min(1, ref.current.userData.t + delta * 4)
    const s = 0.2 + 0.8 * (1 - (1 - ref.current.userData.t) ** 3)
    ref.current.scale.setScalar(s)
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
