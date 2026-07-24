import styled from "@emotion/styled"
import React from "react"
import useScheme from "src/hooks/useScheme"

type Props = {}

// 클릭하면 전환될 테마를 아이콘으로 표시 (라이트 → ☾, 다크 → ☀)
const ThemeToggle: React.FC<Props> = () => {
  const [scheme, setScheme] = useScheme()

  const handleClick = () => {
    setScheme(scheme === "light" ? "dark" : "light")
  }

  return (
    <StyledWrapper onClick={handleClick} aria-label="테마 전환" title="테마 전환">
      {scheme === "light" ? <MoonIcon /> : <SunIcon />}
    </StyledWrapper>
  )
}

export default ThemeToggle

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
    <path
      d="M12.8 9.2 A5.8 5.8 0 1 1 5.8 2.2 A4.6 4.6 0 0 0 12.8 9.2 Z"
      fill="currentColor"
    />
  </svg>
)

const SunIcon = () => (
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
    <circle cx="7.5" cy="7.5" r="3" fill="currentColor" stroke="none" />
    <line x1="7.5" y1="0.9" x2="7.5" y2="2.4" />
    <line x1="7.5" y1="12.6" x2="7.5" y2="14.1" />
    <line x1="0.9" y1="7.5" x2="2.4" y2="7.5" />
    <line x1="12.6" y1="7.5" x2="14.1" y2="7.5" />
    <line x1="2.83" y1="2.83" x2="3.9" y2="3.9" />
    <line x1="11.1" y1="11.1" x2="12.17" y2="12.17" />
    <line x1="2.83" y1="12.17" x2="3.9" y2="11.1" />
    <line x1="11.1" y1="3.9" x2="12.17" y2="2.83" />
  </svg>
)

export const HeaderIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.gray6};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.gray11};
  transition: background-color 0.15s ease, color 0.15s ease;

  :hover {
    background-color: ${({ theme }) => theme.colors.gray4};
    color: ${({ theme }) => theme.colors.gray12};
  }
`

const StyledWrapper = HeaderIconButton
