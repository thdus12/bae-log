import styled from "@emotion/styled"
import React from "react"
import { HeaderIconButton } from "./ThemeToggle"
import usePalette from "src/hooks/usePalette"
import { PALETTE_IDS, PALETTE_LABELS, plumOf } from "src/styles/plum"

type Props = {}

// 누를 때마다 플럼 → 오션 → 포레스트 → 선셋 → 모노 순환
// 버튼의 원형 스와치가 현재 팔레트의 포인트 색을 보여준다
const PaletteToggle: React.FC<Props> = () => {
  const [palette, setPalette] = usePalette()

  const handleClick = () => {
    const next =
      PALETTE_IDS[(PALETTE_IDS.indexOf(palette) + 1) % PALETTE_IDS.length]
    setPalette(next)
  }

  const label = `컬러 테마: ${PALETTE_LABELS[palette]}`

  return (
    <HeaderIconButton onClick={handleClick} title={label} aria-label={label}>
      <Swatch />
    </HeaderIconButton>
  )
}

export default PaletteToggle

const Swatch = styled.span`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: ${({ theme }) => plumOf(theme.scheme).accent};
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
  transition: background-color 0.2s ease;
`
