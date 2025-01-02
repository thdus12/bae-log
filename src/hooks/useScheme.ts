import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getCookie, setCookie } from "cookies-next"
import { useEffect } from "react"
import { queryKey } from "src/constants/queryKey"

export type Scheme = "light" | "dark"
type SetScheme = (scheme: Scheme) => void

const useScheme = (): [Scheme, SetScheme] => {
  const queryClient = useQueryClient()

  const { data } = useQuery<Scheme>({
    queryKey: queryKey.scheme(),
    enabled: false,
    initialData: "light",
  })

  const scheme = data || "light"

  const setScheme: SetScheme = (newScheme: Scheme) => {
    setCookie("scheme", newScheme)
    queryClient.setQueryData(queryKey.scheme(), newScheme)
  }

  useEffect(() => {
    if (!window) return

    const savedScheme = getCookie("scheme") as Scheme | undefined
    setScheme(savedScheme || "light")
  }, [])

  return [scheme, setScheme]
}

export default useScheme
