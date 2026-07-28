import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getCookie, setCookie } from "cookies-next"
import { useEffect } from "react"
import { queryKey } from "src/constants/queryKey"
import { DEFAULT_PALETTE, PALETTE_IDS, PaletteId } from "src/styles/plum"

type SetPalette = (id: PaletteId) => void

/**
 * 쿠키에는 "방문자가 직접 고른 팔레트"만 저장한다.
 * 접속만 해도 기본값을 쿠키에 써버리면, 나중에 사이트 기본 팔레트를 바꿔도
 * 기존 방문자는 예전 색에 고정돼버린다.
 *
 * (예전 구현이 접속 시 기본값을 그대로 저장했기 때문에, 그때 저장된 값과
 *  구분하려고 쿠키 이름에 버전을 붙였다)
 */
const PALETTE_COOKIE = "palette_v2"

const usePalette = (): [PaletteId, SetPalette] => {
  const queryClient = useQueryClient()

  const { data } = useQuery<PaletteId>({
    queryKey: queryKey.palette(),
    enabled: false,
    initialData: DEFAULT_PALETTE,
  })

  const palette = data || DEFAULT_PALETTE

  const setPalette: SetPalette = (id: PaletteId) => {
    setCookie(PALETTE_COOKIE, id)
    queryClient.setQueryData(queryKey.palette(), id)
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    // 직접 고른 값이 있으면 그걸, 없으면 사이트 기본값을 쓴다 (쿠키는 건드리지 않음)
    const saved = getCookie(PALETTE_COOKIE) as PaletteId | undefined
    queryClient.setQueryData(
      queryKey.palette(),
      saved && PALETTE_IDS.includes(saved) ? saved : DEFAULT_PALETTE
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [palette, setPalette]
}

export default usePalette
