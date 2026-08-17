import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PLAYER_COLORS } from '../../game/constants'
import { prefersReducedMotion } from '../../game/motion'

function OPiece({ opacity = 1, emissive = 1 }) {
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

  return (
    <group ref={ref} userData={{ t: 0.05 }}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.4, 0.13, 20, 40]} />
        <meshStandardMaterial
          color={PLAYER_COLORS.O}
          emissive={PLAYER_COLORS.O}
          emissiveIntensity={(opacity === 1 ? 2.2 : 0.4) * emissive}
          transparent={opacity < 1}
          opacity={opacity}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.4, 0.19, 20, 40]} />
        <meshBasicMaterial
          color={PLAYER_COLORS.O}
          transparent
          opacity={0.14 * opacity}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export default OPiece
