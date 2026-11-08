import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { FRAG, VERT } from './shader'

interface BlackHoleProps {
  size: number
  className?: string
  /** Lower = closer framing. */
  zoom?: number
  label?: string
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  return s
}

/** Animated black-hole mark (logo). Raw WebGL, pauses offscreen, static under reduced motion. */
export function BlackHole({ size, className, zoom = 1.25, label }: BlackHoleProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false })
    if (!gl) {
      canvas.dataset.fallback = '1'
      return
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.dataset.fallback = '1'
      return
    }
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(prog, 'uRes')
    const uTime = gl.getUniformLocation(prog, 'uTime')
    gl.uniform1f(gl.getUniformLocation(prog, 'uZoom'), zoom)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uRes, canvas.width, canvas.height)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now() - 8000 // start mid-swirl, never on a blank frame
    let raf = 0
    let visible = true
    const draw = () => {
      gl.uniform1f(uTime, (performance.now() - start) / 1000)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const loop = () => {
      draw()
      if (visible && !reduce) raf = requestAnimationFrame(loop)
    }
    loop()
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      cancelAnimationFrame(raf)
      if (visible && !reduce) raf = requestAnimationFrame(loop)
    })
    io.observe(canvas)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [size, zoom])

  return (
    <span
      className={cn('relative inline-block shrink-0 overflow-hidden rounded-full bg-black shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_0_18px_-4px_rgb(255_150_60/0.45)]', className)}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <canvas ref={ref} className="h-full w-full" style={{ width: size, height: size }} />
      {/* CSS fallback when WebGL is unavailable */}
      <span className="pointer-events-none absolute inset-0 hidden [canvas[data-fallback]+&]:block" aria-hidden="true">
        <span className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,#000_42%,#ffd59a_46%,#ff7a1a_55%,transparent_70%)]" />
      </span>
    </span>
  )
}
