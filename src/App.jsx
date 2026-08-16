import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Scene from './components/Scene'
import PostFX from './components/PostFX'
import { initArcadeAudio } from './audio/arcadeAudio'

function App() {
  useEffect(() => {
    const kick = () => initArcadeAudio()
    window.addEventListener('pointerdown', kick)
    window.addEventListener('keydown', kick)
    return () => {
      window.removeEventListener('pointerdown', kick)
      window.removeEventListener('keydown', kick)
    }
  }, [])

  return (
    <div className="relative h-full w-full">
      <Canvas shadows camera={{ position: [8, 7, 10], fov: 45 }}>
        <Scene />
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
        <p className="mt-1 text-xs tracking-[0.25em] text-fuchsia-400 uppercase drop-shadow-[0_0_8px_#ec4899]">
          Insert Coin
        </p>
      </div>
    </div>
  )
}

export default App
