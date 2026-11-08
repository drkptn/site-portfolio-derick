import { useEffect } from 'react'
import { FRAG, VERT } from './shader'

/**
 * Animates the tab icon by rendering the black-hole shader into a tiny offscreen
 * canvas and swapping the favicon a few times per second (only while the tab is visible).
 * Browsers that ignore dynamic favicons simply keep the static PNG.
 */
export function AnimatedFavicon() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 64
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })
    if (!gl) return
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.uniform2f(gl.getUniformLocation(prog, 'uRes'), 64, 64)
    gl.uniform1f(gl.getUniformLocation(prog, 'uZoom'), 1.15)
    const uTime = gl.getUniformLocation(prog, 'uTime')

    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/png'
    document.head.appendChild(link)
    const start = performance.now() - 8000
    const tick = () => {
      if (document.hidden) return
      gl.uniform1f(uTime, (performance.now() - start) / 1000)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      link.href = canvas.toDataURL('image/png')
    }
    tick()
    const id = window.setInterval(tick, 160)
    return () => {
      window.clearInterval(id)
      link.remove()
    }
  }, [])
  return null
}
