import { useEffect } from "react"

/**
 * react-notion-x가 렌더한 코드블럭(.notion-code)에
 * 언어 라벨과 복사 버튼을 주입한다. (클라이언트 렌더 이후 실행)
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
        block.style.position = "relative"

        const code = block.querySelector("code")
        const match = (code?.className || "").match(/language-([\w-]+)/)
        const lang = match ? match[1] : ""

        if (lang) {
          const label = document.createElement("span")
          label.className = "code-lang-label"
          label.textContent = lang
          block.appendChild(label)
        }

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
        block.appendChild(btn)
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
