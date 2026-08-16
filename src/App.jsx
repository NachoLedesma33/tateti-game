import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Scene from './components/Scene'
import PostFX from './components/PostFX'
import Board3D from './components/Board3D'
import { initArcadeAudio } from './audio/arcadeAudio'
import { createEmptyBoard } from './game/constants'

const DEMO_BOARDS = {
  3: ['X', null, 'O', null, 'X', null, null, null, 'O'],
  4: ['X', 'O', null, null, null, 'X', 'O', null, null, null, 'X', null, null, null, null, 'O'],
  5: [
    'X', null, 'O', null, null,
    null, 'X', null, 'O', null,
    null, null, 'X', null, null,
    null, null, null, 'X', null,
    null, null, null, null, 'O',
  ],
}

function App() {
  const [size, setSize] = useState(3)
  const [board] = useState(() => ({ ...DEMO_BOARDS }))

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
        <Board3D
          size={size}
          board={board[size] || createEmptyBoard(size)}
          currentPlayer="X"
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

      <div className="pointer-events-none absolute top-5 left-1/2 -translate-x-1/2 text-center">
        <h1 className="text-2xl font-bold tracking-[0.3em] text-cyan-300 uppercase drop-shadow-[0_0_12px_#22d3ee]">
          Tateti Arcade 3D
        </h1>
        <p className="mt-1 text-xs tracking-[0.25em] text-fuchsia-400 uppercase drop-shadow-[0_0_8px_#ec4899]">
          Insert Coin
        </p>
      </div>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
        {[3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSize(s)}
            className={`rounded border px-4 py-2 font-mono text-sm tracking-widest transition-all ${
              size === s
                ? 'border-cyan-300 bg-cyan-400/20 text-cyan-200 shadow-[0_0_14px_#22d3ee]'
                : 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-300 hover:bg-fuchsia-500/20'
            }`}
          >
            {s}x{s}
          </button>
        ))}
      </div>
    </div>
  )
}

export default App
