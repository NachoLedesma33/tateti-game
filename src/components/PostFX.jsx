import { useMemo } from 'react'
import { Vector2 } from 'three'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Scanline,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

function PostFX() {
  const offset = useMemo(() => new Vector2(0.0007, 0.0007), [])

  return (
    <EffectComposer>
      <Bloom
        intensity={1.05}
        luminanceThreshold={0.18}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <ChromaticAberration
        offset={offset}
        radialModulation
        modulationOffset={0.2}
        blendFunction={BlendFunction.NORMAL}
      />
      <Scanline blendFunction={BlendFunction.OVERLAY} density={1.4} />
      <Noise opacity={0.05} />
      <Vignette eskil={false} offset={0.25} darkness={0.85} />
    </EffectComposer>
  )
}

export default PostFX
