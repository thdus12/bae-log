import { useEffect } from "react"

/**
 * react-notion-x가 렌더한 코드블럭(.notion-code) 상단에
 * 언어 라벨 + 복사 버튼이 들어간 바(bar)를 주입한다.
 * 바가 자기 줄을 차지하므로 코드와 구조적으로 겹치지 않는다.
 */
const useCodeCopy = () => {
  useEffect(() => {
    if (typeof document === "undefined") return

    let tries = 0
    const decorate = () => {
      const blocks = document.querySelectorAll<HTMLElement>(".notion-code")
      blocks.forEach((block) => {
        if (block.dataset.copyReady === "true") return
        block.dataset.copyReady = "true"

        const code = block.querySelector("code")
        const match = (code?.className || "").match(/language-([\w-]+)/)
        const lang = match ? match[1] : "code"

        const bar = document.createElement("div")
        bar.className = "code-bar"

        const label = document.createElement("span")
        label.className = "code-lang-label"
        label.textContent = lang

        const btn = document.createElement("button")
        btn.type = "button"
        btn.className = "code-copy-btn"
        btn.textContent = "Copy"
        btn.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(code?.textContent || "")
          } catch (e) {
            /* clipboard 미지원 시 무시 */
          }
          btn.textContent = "Copied!"
          btn.classList.add("copied")
          window.setTimeout(() => {
            btn.textContent = "Copy"
            btn.classList.remove("copied")
          }, 1400)
        })

        bar.appendChild(label)
        bar.appendChild(btn)
        block.insertBefore(bar, block.firstChild)
      })
      return blocks.length > 0
    }

    // 코드블럭이 dynamic import로 늦게 렌더되므로 잠시 폴링
    const timer = window.setInterval(() => {
      const found = decorate()
      tries += 1
      if (found || tries > 50) window.clearInterval(timer)
    }, 120)

    return () => window.clearInterval(timer)
  }, [])
}

export default useCodeCopy
