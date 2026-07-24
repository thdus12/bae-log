import styled from "@emotion/styled"
import React from "react"
import { Emoji } from "src/components/Emoji"
import useCursorFx, {
  CURSOR_FX_MODES,
  CursorFxMode,
} from "src/hooks/useCursorFx"

type Props = {}

const ICON: Record<CursorFxMode, string> = {
  ink: "💧",
  dust: "✨",
  none: "🖱️",
}

const LABEL: Record<CursorFxMode, string> = {
  ink: "커서 효과: 잉크",
  dust: "커서 효과: 별가루",
  none: "커서 효과: 없음",
}

// 누를 때마다 잉크 → 별가루 → 없음 순환
const CursorFxToggle: React.FC<Props> = () => {
  const [mode, setCursorFx] = useCursorFx()

  const handleClick = () => {
    const next =
      CURSOR_FX_MODES[
        (CURSOR_FX_MODES.indexOf(mode) + 1) % CURSOR_FX_MODES.length
      ]
    setCursorFx(next)
  }

  return (
    <StyledWrapper
      onClick={handleClick}
      title={LABEL[mode]}
      aria-label={LABEL[mode]}
    >
      <Emoji>{ICON[mode]}</Emoji>
    </StyledWrapper>
  )
}

export default CursorFxToggle

const StyledWrapper = styled.div`
  cursor: pointer;

  /* 터치 기기에선 커서 효과가 비활성화되므로 토글도 숨김 */
  @media (pointer: coarse) {
    display: none;
  }
`
