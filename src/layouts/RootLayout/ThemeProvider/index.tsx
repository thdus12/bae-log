import { ThemeProvider as _ThemeProvider } from "@emotion/react"
import { Global } from "./Global"
import { createTheme } from "src/styles"
import usePalette from "src/hooks/usePalette"
import { setCurrentPaletteId } from "src/styles/plum"

type Props = {
  scheme: string
  children?: React.ReactNode
}

export const ThemeProvider = ({ scheme, children }: Props) => {
  // 팔레트가 바뀌면 이 컴포넌트가 리렌더되고, 매 렌더마다 새 theme 객체가
  // 만들어지므로 모든 styled 컴포넌트가 새 팔레트로 다시 그려진다.
  const [palette] = usePalette()
  setCurrentPaletteId(palette)

  const theme = createTheme({
    scheme: scheme === "dark" ? "dark" : "light",
  })

  return (
    <_ThemeProvider theme={theme}>
      <Global />
      {children}
    </_ThemeProvider>
  )
}
