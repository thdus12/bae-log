import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getCookie, setCookie } from "cookies-next"
import { useEffect } from "react"
import { queryKey } from "src/constants/queryKey"
import { PALETTE_IDS, PaletteId } from "src/styles/plum"

type SetPalette = (id: PaletteId) => void

const usePalette = (): [PaletteId, SetPalette] => {
  const queryClient = useQueryClient()

  const { data } = useQuery<PaletteId>({
    queryKey: queryKey.palette(),
    enabled: false,
    initialData: "plum",
  })

  const palette = data || "plum"

  const setPalette: SetPalette = (id: PaletteId) => {
    setCookie("palette", id)
    queryClient.setQueryData(queryKey.palette(), id)
  }

  useEffect(() => {
    if (!window) return

    const saved = getCookie("palette") as PaletteId | undefined
    setPalette(saved && PALETTE_IDS.includes(saved) ? saved : "plum")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [palette, setPalette]
}

export default usePalette
