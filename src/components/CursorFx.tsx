import React, { useEffect, useRef } from "react"
import useCursorFx from "src/hooks/useCursorFx"
import useScheme from "src/hooks/useScheme"
import { plum } from "src/styles/plum"

/**
 * 커서 효과 (헤더 토글로 선택, 쿠키에 저장)
 * - ink  : 플럼빛 잉크 방울이 혜성 꼬리처럼 커서를 따라옴 (gooey 필터로 뭉침)
 * - dust : 커서에서 팔레트 색 별가루가 떨어짐
 * - none : 효과 없음
 *
 * 기존 Sparkle과 달리 React state 대신 DOM을 직접 다뤄서
 * 프레임마다 리렌더링이 발생하지 않는다.
 * 터치 기기(pointer: coarse)와 모션 줄이기 설정에선 자동 비활성화.
 */

const PALETTE = {
  light: [plum.light.accent, plum.light.violet, plum.light.accentDeep],
  dark: [plum.dark.accent, plum.dark.violet, plum.dark.accentDeep],
}
const INK_SIZES = [16, 13, 11, 9, 7, 6, 5]
const DUST_LIFE = 60 // frames

const lerp = (a: number, b: number, k: number) => a + (b - a) * k

const CursorFx: React.FC = () => {
  const [mode] = useCursorFx()
  const [scheme] = useScheme()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || mode === "none") return

    const fine = window.matchMedia("(pointer: fine)").matches
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!fine || reduce) return

    const colors = PALETTE[scheme === "dark" ? "dark" : "light"]
    let raf = 0
    let mx = -100
    let my = -100
    let lastMove = 0
    let lastDust = 0

    // ── ink ──
    let inkWrap: HTMLDivElement | null = null
    let inks: { el: HTMLDivElement; sz: number; x: number; y: number }[] = []
    let inkOpacity = 0

    if (mode === "ink") {
      inkWrap = document.createElement("div")
      inkWrap.style.cssText =
        "position:absolute;inset:0;filter:url(#cursor-goo);opacity:0"
      inks = INK_SIZES.map((sz) => {
        const el = document.createElement("div")
        el.style.cssText = `position:absolute;top:0;left:0;width:${sz}px;height:${sz}px;border-radius:50%;background:${colors[0]}`
        inkWrap!.appendChild(el)
        return { el, sz, x: -100, y: -100 }
      })
      root.appendChild(inkWrap)
    }

    // ── dust ──
    type Dust = {
      el: HTMLDivElement
      x: number
      y: number
      dx: number
      life: number
    }
    let dusts: Dust[] = []

    const spawnDust = () => {
      const el = document.createElement("div")
      const sz = 5 + Math.random() * 4
      const color = colors[Math.floor(Math.random() * colors.length)]
      el.style.cssText =
        `position:absolute;top:0;left:0;width:${sz}px;height:${sz}px;background:${color};` +
        "clip-path:polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)"
      root.appendChild(el)
      dusts.push({
        el,
        x: mx + (Math.random() - 0.5) * 14,
        y: my + (Math.random() - 0.5) * 14,
        dx: (Math.random() - 0.5) * 0.6,
        life: 0,
      })
    }

    const onMove = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
      lastMove = performance.now()
      if (mode === "dust" && performance.now() - lastDust > 70) {
        lastDust = performance.now()
        spawnDust()
      }
    }

    const frame = () => {
      if (mode === "ink" && inkWrap) {
        let px = mx
        let py = my
        inks.forEach((d, i) => {
          const k = i === 0 ? 0.35 : 0.3
          d.x = lerp(d.x, px, k)
          d.y = lerp(d.y, py, k)
          d.el.style.transform = `translate(${(d.x - d.sz / 2).toFixed(
            1
          )}px,${(d.y - d.sz / 2).toFixed(1)}px)`
          px = d.x
          py = d.y
        })
        // 커서가 멈추면 스르륵 사라짐
        const idle = performance.now() - lastMove > 700
        inkOpacity = lerp(inkOpacity, idle ? 0 : 0.75, 0.1)
        inkWrap.style.opacity = inkOpacity.toFixed(3)
      }

      if (mode === "dust") {
        dusts = dusts.filter((p) => {
          p.life += 1
          if (p.life > DUST_LIFE) {
            p.el.remove()
            return false
          }
          p.y += 0.9
          p.x += p.dx
          const t = p.life / DUST_LIFE
          p.el.style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(
            1
          )}px) scale(${(1 - t * 0.85).toFixed(2)})`
          p.el.style.opacity = (0.9 * (1 - t)).toFixed(2)
          return true
        })
      }

      raf = requestAnimationFrame(frame)
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    raf = requestAnimationFrame(frame)

    return () => {
      window.removeEventListener("pointermove", onMove)
      cancelAnimationFrame(raf)
      root.innerHTML = ""
    }
  }, [mode, scheme])

  return (
    <>
      {/* gooey 필터: 잉크 방울들이 액체처럼 서로 뭉치게 함 */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id="cursor-goo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
            <feColorMatrix
              in="b"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="g"
            />
            <feBlend in="SourceGraphic" in2="g" />
          </filter>
        </defs>
      </svg>
      <div
        ref={rootRef}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 9990,
          overflow: "hidden",
        }}
      />
    </>
  )
}

export default CursorFx
