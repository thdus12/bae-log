// components/ProgressBar.tsx
import { useEffect, useState } from "react"

const ProgressBar = () => {
  const [width, setWidth] = useState(0)

  const calculateScrollProgress = () => {
    const winScroll = document.documentElement.scrollTop
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight
    const scrolled = (winScroll / height) * 100
    console.log('Progress:', scrolled) // 디버깅용
    setWidth(scrolled)
  }

  useEffect(() => {
    window.addEventListener("scroll", calculateScrollProgress)
    return () => window.removeEventListener("scroll", calculateScrollProgress)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500
          transition-all duration-300 ease-in-out"
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

export default ProgressBar
