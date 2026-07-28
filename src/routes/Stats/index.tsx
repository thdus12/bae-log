import React, { useEffect, useMemo, useRef, useState } from "react"
import styled from "@emotion/styled"
import usePostsQuery from "src/hooks/usePostsQuery"
import usePalette from "src/hooks/usePalette"
import useScheme from "src/hooks/useScheme"
import { plumOf } from "src/styles/plum"

type Props = {}

const dateOf = (p: any) => new Date(p?.date?.start_date || p.createdTime)
const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

// 요소가 화면에 들어오면 true (모션 줄이기 시 즉시 true)
const useInView = <T extends HTMLElement>(): [React.RefObject<T>, boolean] => {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (prefersReduced()) {
      setInView(true)
      return
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true)
            io.disconnect()
          }
        })
      },
      { threshold: 0.2 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, inView]
}

// 0 → target 카운트업
const useCountUp = (target: number, active: boolean, delay = 0) => {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    if (prefersReduced()) {
      setN(target)
      return
    }
    let raf = 0
    let start = 0
    const dur = 1100
    const tick = (t: number) => {
      if (!start) start = t
      const elapsed = t - start - delay
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick)
        return
      }
      const p = Math.min(1, elapsed / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, active, delay])
  return n
}

// 책등 높이 패턴 (책장 느낌)
const BOOK_H = [42, 50, 46, 54, 44]

const Stats: React.FC<Props> = () => {
  const posts = usePostsQuery().filter((p) => p.type?.[0] === "Post")
  const [scheme] = useScheme()
  usePalette() // 팔레트 변경 시 인라인 색 재계산
  const pal = plumOf(scheme)

  const data = useMemo(() => {
    const total = posts.length

    const catMap = new Map<string, number>()
    posts.forEach((p) => {
      const c = p.category?.[0]
      if (c) catMap.set(c, (catMap.get(c) || 0) + 1)
    })
    const categories = [...catMap.entries()].sort((a, b) => b[1] - a[1])

    const tagMap = new Map<string, number>()
    posts.forEach((p) =>
      p.tags?.forEach((t) => tagMap.set(t, (tagMap.get(t) || 0) + 1))
    )
    const topTags = [...tagMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 14)

    // 연×월 잔디
    let months = 0
    let grass: { year: number; cells: number[] }[] = []
    if (posts.length) {
      const times = posts.map((p) => dateOf(p).getTime())
      const first = new Date(Math.min(...times))
      const now = new Date()
      months =
        (now.getFullYear() - first.getFullYear()) * 12 +
        (now.getMonth() - first.getMonth()) +
        1
      for (let y = first.getFullYear(); y <= now.getFullYear(); y++) {
        grass.push({ year: y, cells: Array(12).fill(0) })
      }
      posts.forEach((p) => {
        const d = dateOf(p)
        const row = grass.find((g) => g.year === d.getFullYear())
        if (row) row.cells[d.getMonth()] += 1
      })
    }
    const maxCell = Math.max(1, ...grass.flatMap((g) => g.cells))

    return {
      total,
      categoryCount: catMap.size,
      tagCount: tagMap.size,
      months,
      categories,
      topTags,
      grass,
      maxCell,
    }
  }, [posts])

  const maxTag = data.topTags[0]?.[1] || 1

  // 잔디 셀 색: 0이면 흙(틴트), 많을수록 진한 플럼
  const cellColor = (c: number) =>
    c === 0
      ? pal.tint
      : `color-mix(in srgb, ${pal.accent} ${Math.round(
          30 + 55 * (c / data.maxCell)
        )}%, ${pal.card})`

  // 책등 색: 플럼 패밀리 순환
  const bookColor = (i: number) =>
    [
      pal.accent,
      pal.violet,
      `color-mix(in srgb, ${pal.accent} 65%, ${pal.card})`,
      pal.accentDeep,
      `color-mix(in srgb, ${pal.violet} 65%, ${pal.card})`,
    ][i % 5]

  const [tilesActive, setTilesActive] = useState(false)
  useEffect(() => setTilesActive(true), [])

  const [grassRef, grassIn] = useInView<HTMLDivElement>()
  const [shelfRef, shelfIn] = useInView<HTMLDivElement>()
  const [bubRef, bubIn] = useInView<HTMLDivElement>()

  return (
    <StyledWrapper>
      <header className="head">
        <h1>📊 블로그 통계</h1>
        <p>지금까지 쌓아온 기록을 숫자로.</p>
      </header>

      <div className="tiles">
        <Tile label="총 글" value={data.total} unit="개" active={tilesActive} delay={0} />
        <Tile label="카테고리" value={data.categoryCount} unit="개" active={tilesActive} delay={90} />
        <Tile label="태그" value={data.tagCount} unit="개" active={tilesActive} delay={180} />
        <Tile label="활동 기간" value={data.months} unit="개월" active={tilesActive} delay={270} />
      </div>

      {/* 🌱 잔디밭 */}
      <section className="panel">
        <h2>🌱 기록의 잔디밭</h2>
        <div className="grass" ref={grassRef}>
          <div className="grow monthhead">
            <span className="ylab" />
            <div className="cells">
              {Array.from({ length: 12 }).map((_, m) => (
                <span className="mlab" key={m}>
                  {m + 1}
                </span>
              ))}
            </div>
          </div>
          {data.grass.map((row, ri) => (
            <div className="grow" key={row.year}>
              <span className="ylab">{row.year}</span>
              <div className="cells">
                {row.cells.map((c, mi) => (
                  <span
                    key={mi}
                    className="cell"
                    title={`${row.year}년 ${mi + 1}월 · ${c}개`}
                    style={{
                      backgroundColor: cellColor(c),
                      transform: grassIn ? "scale(1)" : "scale(0)",
                      transitionDelay: `${(ri * 12 + mi) * 14}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="legend">
            <span>적음</span>
            {[0.25, 0.5, 0.75, 1].map((r) => (
              <i
                key={r}
                style={{
                  backgroundColor: `color-mix(in srgb, ${pal.accent} ${Math.round(
                    30 + 55 * r
                  )}%, ${pal.card})`,
                }}
              />
            ))}
            <span>많음</span>
          </div>
          {!data.grass.length && <p className="empty">아직 없어요.</p>}
        </div>
      </section>

      {/* 📚 책장 */}
      <section className="panel">
        <h2>📚 카테고리 책장 <small>글 하나가 책 한 권</small></h2>
        <div className="shelfwrap" ref={shelfRef}>
          <div className="shelf">
            {data.categories.map(([name, n], gi) => (
              <div className="bgroup" key={name}>
                <div className="books">
                  {Array.from({ length: Math.min(n, 14) }).map((_, i) => {
                    const h = BOOK_H[(gi + i) % BOOK_H.length]
                    const isLast = i === Math.min(n, 14) - 1 && n > 1
                    return (
                      <span
                        key={i}
                        className={`book${isLast ? " lean" : ""}`}
                        style={{
                          height: shelfIn ? h : 0,
                          backgroundColor: bookColor(gi + i),
                          transitionDelay: `${gi * 120 + i * 55}ms`,
                        }}
                      />
                    )
                  })}
                  {n > 14 && <span className="more">+{n - 14}</span>}
                </div>
                <div className="glabel" title={name}>
                  <span className="gname">{name}</span>
                  <em>{n}</em>
                </div>
              </div>
            ))}
          </div>
          {!data.categories.length && <p className="empty">아직 없어요.</p>}
        </div>
      </section>

      {/* 🫧 태그 버블밭 */}
      <section className="panel">
        <h2>🫧 태그 버블밭</h2>
        <div className="bubbles" ref={bubRef}>
          {data.topTags.map(([name, n], i) => {
            const d = 54 + Math.round((n / maxTag) * 46)
            const big = n / maxTag > 0.55
            return (
              <div
                className="bub"
                key={name}
                title={`#${name} · ${n}개`}
                style={{
                  width: d,
                  height: d,
                  backgroundColor: big
                    ? pal.accent
                    : `color-mix(in srgb, ${pal.accent} ${18 + Math.round((n / maxTag) * 25)}%, ${pal.card})`,
                  color: big ? pal.tagOnInk : pal.accentDeep,
                  transform: bubIn ? "scale(1)" : "scale(0)",
                  transitionDelay: `${i * 60}ms`,
                  animationDelay: `${(i % 5) * -1.3}s`,
                  animationDuration: `${3.6 + (i % 4) * 0.7}s`,
                }}
              >
                <b>#{name}</b>
                <span>{n}</span>
              </div>
            )
          })}
          {!data.topTags.length && <p className="empty">아직 없어요.</p>}
        </div>

        {/* gooey: 버블들이 가까워지면 액체처럼 뭉침 */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
          <defs>
            <filter id="stats-goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
              <feColorMatrix
                in="b"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
                result="g"
              />
              <feBlend in="SourceGraphic" in2="g" />
            </filter>
          </defs>
        </svg>
      </section>
    </StyledWrapper>
  )
}

const Tile: React.FC<{
  label: string
  value: number
  unit: string
  active: boolean
  delay: number
}> = ({ label, value, unit, active, delay }) => {
  const n = useCountUp(value, active, delay)
  return (
    <div className="tile">
      <div className="tlabel">{label}</div>
      <div className="tvalue">
        {n}
        <span className="tunit">{unit}</span>
      </div>
    </div>
  )
}

export default Stats

const StyledWrapper = styled.div`
  max-width: 52rem;
  margin: 0 auto;
  padding: 3rem 1.5rem;

  .head {
    margin-bottom: 2rem;
    h1 {
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    p {
      margin-top: 0.5rem;
      color: ${({ theme }) => theme.colors.gray10};
      font-size: 0.9375rem;
    }
  }

  .tiles {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin-bottom: 2rem;

    @media (max-width: 620px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  .tile {
    background-color: ${({ theme }) => plumOf(theme.scheme).card};
    border: 1px solid ${({ theme }) => plumOf(theme.scheme).line};
    border-radius: 1rem;
    padding: 1.125rem 1.25rem;
    transition: transform 0.2s cubic-bezier(0.2, 0.7, 0.2, 1),
      border-color 0.2s ease;

    :hover {
      transform: translateY(-2px);
      border-color: ${({ theme }) => plumOf(theme.scheme).accent};
    }
    .tlabel {
      font-size: 0.75rem;
      color: ${({ theme }) => theme.colors.gray10};
      margin-bottom: 0.375rem;
    }
    .tvalue {
      font-size: 1.875rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: ${({ theme }) => plumOf(theme.scheme).accentDeep};
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }
    .tunit {
      font-size: 0.875rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.gray9};
      margin-left: 0.25rem;
    }
  }

  .panel {
    background-color: ${({ theme }) => plumOf(theme.scheme).card};
    border: 1px solid ${({ theme }) => plumOf(theme.scheme).line};
    border-radius: 1.25rem;
    padding: 1.5rem;
    margin-bottom: 1.25rem;

    h2 {
      font-size: 1.0625rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      margin-bottom: 1.25rem;

      small {
        font-size: 0.75rem;
        font-weight: 500;
        color: ${({ theme }) => theme.colors.gray9};
        margin-left: 0.5rem;
      }
    }
    .empty {
      color: ${({ theme }) => theme.colors.gray9};
      font-size: 0.875rem;
    }
  }

  /* ── 🌱 잔디밭 ── */
  .grass {
    .grow {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      margin-bottom: 0.375rem;
    }
    .ylab {
      width: 2.75rem;
      flex-shrink: 0;
      font-size: 0.75rem;
      color: ${({ theme }) => theme.colors.gray9};
      font-variant-numeric: tabular-nums;
      text-align: right;
    }
    .cells {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 0.25rem;
      flex: 1;
    }
    .mlab {
      font-size: 0.6875rem;
      color: ${({ theme }) => theme.colors.gray8};
      text-align: center;
      font-variant-numeric: tabular-nums;
    }
    .cell {
      aspect-ratio: 1;
      border-radius: 0.3125rem;
      transition: transform 0.4s cubic-bezier(0.3, 1.4, 0.4, 1),
        background-color 0.2s ease;
      cursor: default;

      :hover {
        outline: 2px solid ${({ theme }) => plumOf(theme.scheme).accent};
        outline-offset: 1px;
      }
    }
    .legend {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.25rem;
      margin-top: 0.75rem;
      font-size: 0.6875rem;
      color: ${({ theme }) => theme.colors.gray9};

      i {
        width: 0.625rem;
        height: 0.625rem;
        border-radius: 0.1875rem;
      }
      span + i {
        margin-left: 0.25rem;
      }
      i + span {
        margin-left: 0.25rem;
      }
    }
  }

  /* ── 📚 책장 ── */
  .shelfwrap {
    overflow-x: auto;
    scrollbar-width: none;
    ::-webkit-scrollbar {
      display: none;
    }
  }
  .shelf {
    display: flex;
    align-items: flex-end;
    gap: 1.75rem;
    padding: 0.5rem 0.25rem 0;
    border-bottom: 3px solid ${({ theme }) => plumOf(theme.scheme).line};
    min-width: min-content;
  }
  .bgroup {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .books {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    min-height: 54px;
  }
  .book {
    width: 11px;
    border-radius: 3px 3px 0 0;
    transition: height 0.55s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  /* 마지막 책은 옆으로 삐딱하게 기대어 있음 */
  .book.lean {
    transform: rotate(9deg);
    transform-origin: bottom left;
    margin-left: 3px;
  }
  .more {
    font-size: 0.6875rem;
    color: ${({ theme }) => theme.colors.gray9};
    margin-left: 0.25rem;
    align-self: flex-end;
    padding-bottom: 2px;
  }
  .glabel {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: 0.625rem;
    padding-bottom: 0.75rem;
    max-width: 8.5rem;

    .gname {
      font-size: 0.75rem;
      color: ${({ theme }) => theme.colors.gray11};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    em {
      font-style: normal;
      font-size: 0.6875rem;
      font-weight: 700;
      color: ${({ theme }) => plumOf(theme.scheme).accentDeep};
      background-color: ${({ theme }) => plumOf(theme.scheme).tint};
      border-radius: 999px;
      padding: 0 0.4375rem;
      font-variant-numeric: tabular-nums;
    }
  }

  /* ── 🫧 버블밭 ── */
  .bubbles {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 0.25rem;
    filter: url(#stats-goo);
  }
  .bub {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    text-align: center;
    cursor: default;
    transition: transform 0.5s cubic-bezier(0.3, 1.4, 0.4, 1);
    animation: bob ease-in-out infinite alternate;

    b {
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      max-width: 90%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    span {
      font-size: 0.625rem;
      opacity: 0.75;
      font-variant-numeric: tabular-nums;
    }

    :hover {
      transform: scale(1.12) !important;
    }
  }
  @keyframes bob {
    from {
      translate: 0 -4px;
    }
    to {
      translate: 0 3px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tile,
    .grass .cell,
    .book,
    .bub {
      transition: none;
      animation: none;
    }
  }
`
