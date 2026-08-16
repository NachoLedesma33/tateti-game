import { Grid, Stars } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function NeonRing({ position, radius, color, speed }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.z += delta * speed
  })
  return (
    <mesh ref={ref} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.045, 16, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.4}
        toneMapped={false}
      />
    </mesh>
  )
}

function Scene() {
  return (
    <group>
      <color attach="background" args={['#0a0118']} />
      <fog attach="fog" args={['#0a0118', 18, 42]} />

      <ambientLight intensity={0.25} />
      <hemisphereLight intensity={0.3} color="#a855f7" groundColor="#0a0118" />

      <pointLight
        position={[-6, 6, -4]}
        intensity={60}
        distance={24}
        color="#a855f7"
        castShadow
      />
      <pointLight
        position={[6, 6, -4]}
        intensity={60}
        distance={24}
        color="#22d3ee"
        castShadow
      />
      <pointLight
        position={[0, 7, 7]}
        intensity={60}
        distance={24}
        color="#ec4899"
      />

      <Stars radius={45} depth={30} count={1400} factor={3} saturation={0.6} fade speed={0.8} />

      <Grid
        position={[0, -0.02, 0]}
        args={[30, 30]}
        cellSize={0.6}
        cellThickness={0.6}
        cellColor="#a855f7"
        sectionSize={3}
        sectionThickness={1.1}
        sectionColor="#22d3ee"
        fadeDistance={30}
        fadeStrength={1.5}
        infiniteGrid
      />

      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[7, 64]} />
        <meshStandardMaterial color="#0d0722" roughness={0.85} metalness={0.4} />
      </mesh>

      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.9, 3.2, 0.36, 48]} />
        <meshStandardMaterial color="#120a2e" roughness={0.35} metalness={0.75} />
      </mesh>

      <NeonRing position={[0, 0.36, 0]} radius={2.72} color="#ec4899" speed={0.35} />
      <NeonRing position={[0, 0.3, 0]} radius={3.25} color="#22d3ee" speed={-0.25} />
    </group>
  )
}

export default Scene
