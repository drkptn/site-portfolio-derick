import { Spark } from '@/components/icons'

/** Static, CSS-only stand-in for devices without WebGL. */
export function SceneFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <div className="relative aspect-square w-[min(70vw,34rem)]">
        <div className="absolute inset-[18%] rounded-full border border-white/15 [transform:rotateX(68deg)_rotateZ(20deg)]" />
        <div className="absolute inset-[8%] rounded-full border border-white/10 [transform:rotateX(60deg)_rotateY(35deg)]" />
        <div className="absolute inset-0 rounded-full border border-dashed border-white/10 [transform:rotateX(70deg)_rotateY(-25deg)]" />
        <div className="absolute inset-[33%] rotate-45 rounded-[22%] bg-[radial-gradient(circle_at_30%_25%,#6b6b6b,#1a1a1a_55%,#050505)] shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_40px_80px_-20px_rgb(0_0_0/0.9)]" />
        <Spark size={46} className="absolute right-[8%] top-[14%] text-ink-800" />
        <Spark size={22} className="absolute bottom-[22%] left-[6%] text-ink-600" />
      </div>
    </div>
  )
}
