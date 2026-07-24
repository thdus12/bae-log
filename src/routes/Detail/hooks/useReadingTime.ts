import { useEffect, useState } from "react"

/**
 * 렌더된 본문(.notion-page)의 글자 수로 예상 읽기 시간(분)을 계산.
 * 한국어 기준 분당 약 500자. 본문이 늦게 렌더되므로 잠시 폴링.
 */
const useReadingTime = (): number | null => {
  const [minutes, setMinutes] = useState<number | null>(null)

  useEffect(() => {
    let tries = 0
    const timer = window.setInterval(() => {
      const el = document.querySelector(".notion-page")
      tries += 1
      if (el && el.textContent && el.textContent.length > 0) {
        const chars = el.textContent.replace(/\s/g, "").length
        setMinutes(Math.max(1, Math.round(chars / 500)))
        window.clearInterval(timer)
      } else if (tries > 50) {
        window.clearInterval(timer)
      }
    }, 150)
    return () => window.clearInterval(timer)
  }, [])

  return minutes
}

export default useReadingTime
