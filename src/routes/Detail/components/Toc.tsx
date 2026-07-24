import styled from "@emotion/styled"
import React, { useEffect, useState } from "react"
import { plumOf } from "src/styles/plum"

type Heading = { id: string; text: string; level: number }

/**
 * 본문의 노션 헤딩(h1/h2)을 수집해 우측에 고정 목차를 띄운다.
 * 스크롤에 따라 현재 섹션이 플럼으로 하이라이트.
 * 넓은 화면(1360px+)에서만 표시.
 */
const Toc: React.FC = () => {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [active, setActive] = useState<string>("")

  // 본문이 늦게 렌더되므로 잠시 폴링하며 헤딩 수집
  useEffect(() => {
    let tries = 0
    const timer = window.setInterval(() => {
      const els = document.querySelectorAll<HTMLElement>(
        ".notion-page .notion-h1, .notion-page .notion-h2"
      )
      tries += 1
      if (els.length) {
        window.clearInterval(timer)
        setHeadings(
          Array.from(els).map((el, i) => {
            if (!el.id) el.id = "toc-heading-" + i
            return {
              id: el.id,
              text: el.textContent || "",
              level: el.classList.contains("notion-h2") ? 2 : 1,
            }
          })
        )
      } else if (tries > 50) {
        window.clearInterval(timer)
      }
    }, 200)
    return () => window.clearInterval(timer)
  }, [])

  // 스크롤 스파이
  useEffect(() => {
    if (!headings.length) return
    const onScroll = () => {
      let cur = headings[0]?.id || ""
      for (const h of headings) {
        const el = document.getElementById(h.id)
        if (el && el.getBoundingClientRect().top < 140) cur = h.id
      }
      setActive(cur)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [headings])

  const handleClick = (id: string) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  }

  if (headings.length < 2) return null

  return (
    <StyledWrapper aria-label="목차">
      <div className="label">On this page</div>
      {headings.map((h) => (
        <a
          key={h.id}
          data-active={h.id === active}
          data-level={h.level}
          onClick={() => handleClick(h.id)}
        >
          {h.text}
        </a>
      ))}
    </StyledWrapper>
  )
}

export default Toc

const StyledWrapper = styled.nav`
  display: none;

  @media (min-width: 1360px) {
    display: block;
  }

  position: fixed;
  top: 120px;
  left: calc(50% + 29rem);
  width: 12rem;
  font-size: 0.8rem;
  line-height: 1.5;

  .label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.gray9};
    margin-bottom: 0.625rem;
  }

  a {
    display: block;
    padding: 0.25rem 0 0.25rem 0.625rem;
    border-left: 2px solid ${({ theme }) => plumOf(theme.scheme).line};
    color: ${({ theme }) => theme.colors.gray9};
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &[data-level="2"] {
      padding-left: 1.25rem;
    }

    :hover {
      color: ${({ theme }) => plumOf(theme.scheme).accentDeep};
    }
    &[data-active="true"] {
      color: ${({ theme }) => plumOf(theme.scheme).accentDeep};
      border-left-color: ${({ theme }) => plumOf(theme.scheme).accent};
      font-weight: 600;
    }
  }
`
