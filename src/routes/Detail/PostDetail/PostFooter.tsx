import styled from "@emotion/styled"
import React, { useEffect, useState } from "react"
import { FiArrowUp } from "react-icons/fi"
import { plumOf } from "src/styles/plum"

type Props = {}

// 스크롤을 내리면 우하단에 나타나는 플로팅 '맨 위로' 버튼
const Footer: React.FC<Props> = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleClick = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
  }

  return (
    <StyledWrapper
      data-visible={visible}
      onClick={handleClick}
      aria-label="맨 위로"
      title="맨 위로"
    >
      <FiArrowUp />
    </StyledWrapper>
  )
}

export default Footer

const StyledWrapper = styled.button`
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray11};
  background-color: ${({ theme }) => plumOf(theme.scheme).card};
  border: 1px solid ${({ theme }) => plumOf(theme.scheme).line};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.2, 0.7, 0.2, 1),
    color 0.15s ease, border-color 0.15s ease;

  &[data-visible="true"] {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  :hover {
    color: ${({ theme }) => plumOf(theme.scheme).accentDeep};
    border-color: ${({ theme }) => plumOf(theme.scheme).accent};
  }

  svg {
    width: 1.05rem;
    height: 1.05rem;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`
