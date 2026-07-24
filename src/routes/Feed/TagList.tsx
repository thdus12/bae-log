import styled from "@emotion/styled"
import { useRouter } from "next/router"
import React, { useEffect, useRef } from "react"
import { FiTag } from "react-icons/fi"
import { SectionIcon } from "src/components/SectionIcon"
import { useTagsQuery } from "src/hooks/useTagsQuery"
import { plumOf } from "src/styles/plum"

type Props = {}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k

const TagList: React.FC<Props> = () => {
  const router = useRouter()
  const currentTag = router.query.tag || undefined
  const data = useTagsQuery()
  const listRef = useRef<HTMLDivElement>(null)

  // 마그네틱: 커서 주변 태그가 자석처럼 끌려와 gooey 필터로 뭉침 (데스크톱 전용)
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const fine = window.matchMedia("(pointer: fine)").matches
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!fine || reduce) return

    const tags = Array.from(list.querySelectorAll<HTMLAnchorElement>("a"))
    if (!tags.length) return
    const state = tags.map(() => ({ x: 0, y: 0, xt: 0, yt: 0, s: 1, st: 1 }))
    let raf = 0

    const cleanups = tags.map((el, i) => {
      const onEnter = () => (state[i].st = 1.08)
      const onLeave = () => (state[i].st = 1)
      el.addEventListener("pointerenter", onEnter)
      el.addEventListener("pointerleave", onLeave)
      return () => {
        el.removeEventListener("pointerenter", onEnter)
        el.removeEventListener("pointerleave", onLeave)
      }
    })

    const onMove = (e: PointerEvent) => {
      tags.forEach((el, i) => {
        const r = el.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        const d = Math.hypot(dx, dy)
        const pull = Math.max(0, 1 - d / 85) * 6
        state[i].xt = (dx / (d || 1)) * pull
        state[i].yt = (dy / (d || 1)) * pull
      })
    }
    const onLeaveField = () =>
      state.forEach((s) => {
        s.xt = 0
        s.yt = 0
      })

    const frame = () => {
      state.forEach((s, i) => {
        s.x = lerp(s.x, s.xt, 0.15)
        s.y = lerp(s.y, s.yt, 0.15)
        s.s = lerp(s.s, s.st, 0.18)
        tags[i].style.transform = `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(
          2
        )}px) scale(${s.s.toFixed(3)})`
      })
      raf = requestAnimationFrame(frame)
    }

    list.addEventListener("pointermove", onMove)
    list.addEventListener("pointerleave", onLeaveField)
    raf = requestAnimationFrame(frame)

    return () => {
      list.removeEventListener("pointermove", onMove)
      list.removeEventListener("pointerleave", onLeaveField)
      cleanups.forEach((c) => c())
      cancelAnimationFrame(raf)
      tags.forEach((el) => (el.style.transform = ""))
    }
  }, [data])

  const handleClickTag = (value: any) => {
    // delete
    if (currentTag === value) {
      router.push({
        query: {
          ...router.query,
          tag: undefined,
        },
      })
    }
    // add
    else {
      router.push({
        query: {
          ...router.query,
          tag: value,
        },
      })
    }
  }

  return (
    <StyledWrapper>
      <div className="top">
        <SectionIcon><FiTag /></SectionIcon> Tags
      </div>
      <div className="list" ref={listRef}>
        {Object.keys(data).map((key) => (
          <a
            key={key}
            data-active={key === currentTag}
            onClick={() => handleClickTag(key)}
          >
            {key}
          </a>
        ))}
      </div>

      {/* gooey: 가까워진 태그들이 액체처럼 뭉치게 하는 필터 */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id="tag-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
            <feColorMatrix
              in="b"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="g"
            />
            <feBlend in="SourceGraphic" in2="g" />
          </filter>
        </defs>
      </svg>
    </StyledWrapper>
  )
}

export default TagList

const StyledWrapper = styled.div`
  .top {
    display: none;
    padding: 0.25rem;
    margin-bottom: 0.75rem;

    @media (min-width: 1024px) {
      display: block;
    }
  }

  .list {
    display: flex;
    margin-bottom: 1.5rem;
    gap: 0.25rem;
    overflow: scroll;

    scrollbar-width: none;
    -ms-overflow-style: none;
    ::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    /* 데스크톱: 알약 클라우드 + gooey */
    @media (min-width: 1024px) {
      flex-wrap: wrap;
      gap: 0.375rem;
      overflow: visible;
      padding: 0.25rem;
    }
    @media (min-width: 1024px) and (pointer: fine) {
      filter: url(#tag-goo);
    }

    a {
      display: block;
      padding: 0.25rem 0.6875rem;
      border-radius: 9999px;
      font-size: 0.8125rem;
      line-height: 1.25rem;
      color: ${({ theme }) => theme.colors.gray11};
      background-color: ${({ theme }) => plumOf(theme.scheme).tint};
      flex-shrink: 0;
      cursor: pointer;
      white-space: nowrap;
      transition: color 0.15s ease;

      ::before {
        content: "#";
        color: ${({ theme }) => plumOf(theme.scheme).accent};
        opacity: 0.7;
        margin-right: 1px;
      }

      :hover {
        color: ${({ theme }) => plumOf(theme.scheme).accentDeep};
      }
      &[data-active="true"] {
        color: ${({ theme }) => plumOf(theme.scheme).tagOnInk};
        background-color: ${({ theme }) => plumOf(theme.scheme).tagOnBg};

        ::before {
          color: inherit;
          opacity: 0.8;
        }
      }
    }
  }
`
