import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getCookie, setCookie } from "cookies-next"
import { useEffect } from "react"
import { queryKey } from "src/constants/queryKey"

export type CursorFxMode = "ink" | "dust" | "none"
type SetCursorFx = (mode: CursorFxMode) => void

// 순환 순서이자 기본값(첫 항목): 별가루 → 잉크 → 없음
export const CURSOR_FX_MODES: CursorFxMode[] = ["dust", "ink", "none"]

const useCursorFx = (): [CursorFxMode, SetCursorFx] => {
  const queryClient = useQueryClient()

  const { data } = useQuery<CursorFxMode>({
    queryKey: queryKey.cursorFx(),
    enabled: false,
    initialData: "dust",
  })

  const mode = data || "dust"

  const setCursorFx: SetCursorFx = (newMode: CursorFxMode) => {
    setCookie("cursor_fx", newMode)
    queryClient.setQueryData(queryKey.cursorFx(), newMode)
  }

  useEffect(() => {
    if (!window) return

    const saved = getCookie("cursor_fx") as CursorFxMode | undefined
    setCursorFx(saved && CURSOR_FX_MODES.includes(saved) ? saved : "dust")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [mode, setCursorFx]
}

export default useCursorFx
