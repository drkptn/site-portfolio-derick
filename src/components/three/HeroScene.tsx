import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { MotionValue } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { signalHeroSceneReady } from './loadHeroScene'
import * as THREE from 'three'

export interface HeroSceneProps {
  /** Scroll progress of the hero section (0 → top, 1 → scrolled past). */
  progress: MotionValue<number>
  /** Render loop runs only while the hero is visible. */
  active: boolean
  /** Becomes true after the preloader — drives the entrance animation. */
  intro: boolean
  compact: boolean
  reduced: boolean
}

const { damp, lerp } = THREE.MathUtils
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

/** Window-level pointer (the canvas sits behind the content, so it can't receive events). */
function usePointer() {
  const pointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  return pointer
}

export default function HeroScene({ progress, active, intro, compact, reduced }: HeroSceneProps) {
  // The loop stays off until the environment exists and shaders are compiled,
  // so compilation never stalls the preloader curtain or the hero intro.
  const [ready, setReady] = useState(false)
  const handleReady = useCallback(() => setReady(true), [])
  return (
    <Canvas
      dpr={compact ? [1, 1.5] : [1, 1.75]}
      camera={{ position: [0, 0, compact ? 11 : 9], fov: 32, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={!active || !ready ? 'never' : reduced ? 'demand' : 'always'}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.1
      }}
    >
      <Scene progress={progress} intro={intro} compact={compact} reduced={reduced} onReady={handleReady} />
    </Canvas>
  )
}

function Scene({ progress, intro, compact, reduced, onReady }: Omit<HeroSceneProps, 'active'> & { onReady: () => void }) {
  const root = useRef<THREE.Group>(null)
  const tilt = useRef<THREE.Group>(null)
  const pointer = usePointer()
  const introT = useRef(reduced ? 1 : 0)
  const { camera, invalidate } = useThree()
  const baseZ = compact ? 11 : 9
  const baseY = compact ? -0.45 : 0
  const baseScale = compact ? 0.72 : 1

  useEffect(() => {
    if (reduced) invalidate()
  }, [reduced, intro, invalidate])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const g = root.current
    const tl = tilt.current
    if (!g || !tl) return
    introT.current = reduced ? 1 : damp(introT.current, intro ? 1 : 0, 1.6, dt)
    const it = introT.current
    const p = progress.get()

    // Scroll: the camera pushes into the core (motion reference: dolly through the subject)
    camera.position.z = lerp(baseZ, baseZ * 0.36, easeInOut(Math.min(1, p * 1.1)))
    camera.position.y = lerp(baseY, baseY - 0.4, p)
    camera.lookAt(0, baseY, 0)

    // Entrance: scale up and unwind
    g.scale.setScalar(baseScale * (0.4 + 0.6 * it))
    g.rotation.z = (1 - it) * -0.9

    if (reduced) return
    // Idle drift + pointer parallax
    const t = state.clock.elapsedTime
    tl.rotation.y = damp(tl.rotation.y, pointer.current.x * 0.5 + Math.sin(t * 0.15) * 0.15, 2.4, dt)
    tl.rotation.x = damp(tl.rotation.x, pointer.current.y * 0.3, 2.4, dt)
    g.position.y = Math.sin(t * 0.6) * 0.06
  })

  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[3, 5, 6]} intensity={1.1} />
      <directionalLight position={[-6, -2, -2]} intensity={0.8} color="#9fb2c9" />

      <group ref={root}>
        <group ref={tilt}>
          <Core reduced={reduced} />
          <Orbits reduced={reduced} />
          <Stars reduced={reduced} />
        </group>
      </group>
      <Particles count={compact ? 260 : 650} reduced={reduced} pointer={pointer} />

      <StudioEnvironment onReady={onReady} />
    </>
  )
}

/* ------------------------------- Environment ------------------------------ */

type Light = { form: 'rect' | 'ring' | 'circle'; intensity: number; position: [number, number, number]; scale: [number, number] | number; color?: string }

/** Soft-box layout of the studio: strips, a cold rim light and a fill behind the camera. */
const LIGHTS: Light[] = [
  { form: 'rect', intensity: 3.2, position: [0, 5, 1], scale: [10, 1.4] },
  { form: 'rect', intensity: 2.2, position: [5, 0.5, 2], scale: [1.3, 6] },
  { form: 'rect', intensity: 1.6, position: [-5, -0.5, 1], scale: [1, 6], color: '#a9bdd6' },
  { form: 'ring', intensity: 1.4, position: [0, 0, -7], scale: 5 },
  { form: 'rect', intensity: 0.7, position: [0, -5, 0], scale: [10, 1] },
  { form: 'circle', intensity: 2.4, position: [-2.5, 3, 4], scale: 1.2 },
  // Fill behind the camera: faces pointing at the viewer reflect graphite, not a void
  { form: 'rect', intensity: 0.55, position: [0, 0, 9], scale: [14, 7] },
  { form: 'rect', intensity: 1.8, position: [3, -2.5, 6], scale: [3, 0.5] },
]

/**
 * Procedural environment map (no HDR download): emissive panels rendered once into
 * a PMREM texture and used for the reflections of every metallic material.
 */
function StudioEnvironment({ onReady }: { onReady: () => void }) {
  const { gl, scene, camera, invalidate } = useThree()

  useEffect(() => {
    const envScene = new THREE.Scene()
    envScene.background = new THREE.Color('#000000')
    const geometries = {
      rect: new THREE.PlaneGeometry(1, 1),
      ring: new THREE.RingGeometry(0.5, 1, 64),
      circle: new THREE.CircleGeometry(1, 64),
    }
    const materials: THREE.Material[] = []
    for (const light of LIGHTS) {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(light.color ?? '#ffffff').multiplyScalar(light.intensity),
        side: THREE.DoubleSide,
        toneMapped: false,
      })
      materials.push(material)
      const mesh = new THREE.Mesh(geometries[light.form], material)
      mesh.position.set(...light.position)
      if (typeof light.scale === 'number') mesh.scale.setScalar(light.scale)
      else mesh.scale.set(light.scale[0], light.scale[1], 1)
      mesh.lookAt(0, 0, 0)
      envScene.add(mesh)
    }

    const pmrem = new THREE.PMREMGenerator(gl)
    const target = pmrem.fromScene(envScene, 0.02)
    scene.environment = target.texture

    // Compile every program now (in parallel where KHR_parallel_shader_compile exists)
    let disposed = false
    const compiled = gl.extensions.has('KHR_parallel_shader_compile')
      ? gl.compileAsync(scene, camera)
      : Promise.resolve(gl.compile(scene, camera))
    compiled
      .catch(() => undefined)
      .then(() => {
        if (disposed) return
        // Warm-up frame: without the parallel-compile extension, shader linking is only
        // checked on first use — pay that cost now, while the preloader is still up.
        gl.render(scene, camera)
        onReady()
        signalHeroSceneReady()
        invalidate()
      })

    return () => {
      disposed = true
      scene.environment = null
      target.dispose()
      pmrem.dispose()
      Object.values(geometries).forEach((g) => g.dispose())
      materials.forEach((m) => m.dispose())
    }
  }, [gl, scene, camera, invalidate, onReady])

  return null
}

/* ---------------------------------- Core ---------------------------------- */

function Core({ reduced }: { reduced: boolean }) {
  const mesh = useRef<THREE.Group>(null)
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 1), [])
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 1), [geometry])

  useFrame((_, delta) => {
    if (reduced || !mesh.current) return
    mesh.current.rotation.y += delta * 0.12
    mesh.current.rotation.x += delta * 0.045
  })

  return (
    <group ref={mesh} rotation={[0.4, 0.3, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#3d3d3d" metalness={1} roughness={0.24} flatShading envMapIntensity={1.25} />
      </mesh>
      <lineSegments geometry={edges} scale={1.003}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.16} />
      </lineSegments>
      {/* Inner core visible through nothing but adds a subtle glint when the camera pushes in */}
      <mesh scale={0.35}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#d9d9d9" metalness={1} roughness={0.1} />
      </mesh>
    </group>
  )
}

/* --------------------------------- Orbits --------------------------------- */

const chrome = new THREE.MeshStandardMaterial({ color: '#e9e9e9', metalness: 1, roughness: 0.16 })
const graphite = new THREE.MeshStandardMaterial({ color: '#7a7a7a', metalness: 1, roughness: 0.3 })

function Ring({
  radius,
  tube,
  tilt,
  speed,
  beads,
  reduced,
}: {
  radius: number
  tube: number
  tilt: [number, number, number]
  speed: number
  beads: number[]
  reduced: boolean
}) {
  const spin = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (!reduced && spin.current) spin.current.rotation.z += delta * speed
  })
  return (
    <group rotation={tilt}>
      <group ref={spin}>
        <mesh material={chrome}>
          <torusGeometry args={[radius, tube, 12, 220]} />
        </mesh>
        {beads.map((angle, i) => (
          <mesh key={i} material={chrome} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}>
            <sphereGeometry args={[i === 0 ? 0.05 : 0.032, 24, 24]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function DottedRing({ radius, count, tilt, speed, reduced }: { radius: number; count: number; tilt: [number, number, number]; speed: number; reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const spin = useRef<THREE.Group>(null)
  useEffect(() => {
    const m = new THREE.Matrix4()
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      const s = i % 8 === 0 ? 1.8 : 1
      m.makeScale(s, s, s).setPosition(Math.cos(a) * radius, Math.sin(a) * radius, 0)
      ref.current?.setMatrixAt(i, m)
    }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true
  }, [count, radius])
  useFrame((_, delta) => {
    if (!reduced && spin.current) spin.current.rotation.z -= delta * speed
  })
  return (
    <group rotation={tilt}>
      <group ref={spin}>
        <instancedMesh ref={ref} args={[undefined, graphite, count]}>
          <sphereGeometry args={[0.014, 8, 8]} />
        </instancedMesh>
      </group>
    </group>
  )
}

function Orbits({ reduced }: { reduced: boolean }) {
  return (
    <>
      <Ring radius={1.62} tube={0.011} tilt={[1.25, 0.15, 0]} speed={0.22} beads={[0.4, 2.6]} reduced={reduced} />
      <Ring radius={2.05} tube={0.007} tilt={[-0.55, 0.85, 0.3]} speed={-0.14} beads={[1.2]} reduced={reduced} />
      <DottedRing radius={2.5} count={96} tilt={[0.3, -0.45, 0]} speed={0.05} reduced={reduced} />
    </>
  )
}

/* ---------------------------------- Stars --------------------------------- */

function useStarGeometry() {
  return useMemo(() => {
    const k = 0.14
    const shape = new THREE.Shape()
    shape.moveTo(0, 1)
    shape.quadraticCurveTo(k, k, 1, 0)
    shape.quadraticCurveTo(k, -k, 0, -1)
    shape.quadraticCurveTo(-k, -k, -1, 0)
    shape.quadraticCurveTo(-k, k, 0, 1)
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.045,
      bevelSegments: 8,
      curveSegments: 28,
    })
    geo.center()
    geo.computeVertexNormals()
    return geo
  }, [])
}

const starMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 1, roughness: 0.16 })

const STARS: { position: [number, number, number]; scale: number; speed: number; phase: number }[] = [
  { position: [1.75, 1.72, 0.6], scale: 0.4, speed: 0.5, phase: 0 },
  { position: [-2.3, -1.05, 0.4], scale: 0.24, speed: -0.7, phase: 1.4 },
  { position: [2.6, -1.4, -0.9], scale: 0.15, speed: 0.9, phase: 2.2 },
  { position: [-1.75, 1.6, -1.2], scale: 0.12, speed: -0.6, phase: 3.1 },
]

function Stars({ reduced }: { reduced: boolean }) {
  const geometry = useStarGeometry()
  const refs = useRef<(THREE.Mesh | null)[]>([])
  useFrame((state) => {
    if (reduced) return
    const t = state.clock.elapsedTime
    refs.current.forEach((m, i) => {
      if (!m) return
      const s = STARS[i]
      m.rotation.y = t * s.speed + s.phase
      m.position.y = s.position[1] + Math.sin(t * 0.8 + s.phase) * 0.08
    })
  })
  return (
    <>
      {STARS.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          geometry={geometry}
          material={starMaterial}
          position={s.position}
          scale={s.scale}
          rotation={[0, s.phase, 0]}
        />
      ))}
    </>
  )
}

/* -------------------------------- Particles ------------------------------- */

function Particles({
  count,
  reduced,
  pointer,
}: {
  count: number
  reduced: boolean
  pointer: RefObject<{ x: number; y: number }>
}) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Spherical shell, flattened slightly so the field reads as depth, not a ball
      const r = 3.2 + Math.random() * 7
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.4
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.75
      arr[i * 3 + 2] = r * Math.cos(phi) - 2
    }
    return arr
  }, [count])

  useFrame((_, delta) => {
    const p = ref.current
    if (!p || reduced) return
    p.rotation.y += delta * 0.012
    p.position.x = damp(p.position.x, -(pointer.current?.x ?? 0) * 0.25, 1.5, delta)
    p.position.y = damp(p.position.y, (pointer.current?.y ?? 0) * 0.15, 1.5, delta)
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.022} color="#c4c4c4" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  )
}
