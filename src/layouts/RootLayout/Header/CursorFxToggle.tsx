import styled from "@emotion/styled"
import React from "react"
import { HeaderIconButton } from "./ThemeToggle"
import useCursorFx, {
  CURSOR_FX_MODES,
  CursorFxMode,
} from "src/hooks/useCursorFx"

type Props = {}

const LABEL: Record<CursorFxMode, string> = {
  dust: "커서 효과: 별가루",
  ink: "커서 효과: 잉크",
  none: "커서 효과: 없음",
}

// 별가루 (4각 별)
const DustIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
    <path
      d="M7.5 1 L9 6 L14 7.5 L9 9 L7.5 14 L6 9 L1 7.5 L6 6 Z"
      fill="currentColor"
    />
  </svg>
)

// 잉크 방울
const InkIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
    <path
      d="M7.5 1.4 C7.5 1.4 3.4 6.5 3.4 9.4 a4.1 4.1 0 0 0 8.2 0 C11.6 6.5 7.5 1.4 7.5 1.4 Z"
      fill="currentColor"
    />
  </svg>
)

// 없음 (빗금 원)
const NoneIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="7.5" cy="7.5" r="5.6" />
    <line x1="3.7" y1="11.3" x2="11.3" y2="3.7" />
  </svg>
)

const ICON: Record<CursorFxMode, React.ReactNode> = {
  dust: <DustIcon />,
  ink: <InkIcon />,
  none: <NoneIcon />,
}

// 누를 때마다 별가루 → 잉크 → 없음 순환
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
      {ICON[mode]}
    </StyledWrapper>
  )
}

export default CursorFxToggle

const StyledWrapper = styled(HeaderIconButton)`
  /* 터치 기기에선 커서 효과가 비활성화되므로 토글도 숨김 */
  @media (pointer: coarse) {
    display: none;
  }
`
