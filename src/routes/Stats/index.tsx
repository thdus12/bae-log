import React, { useEffect, useMemo, useRef, useState } from "react"
import styled from "@emotion/styled"
import usePostsQuery from "src/hooks/usePostsQuery"
import { plumOf } from "src/styles/plum"

type Props = {}

const dateOf = (p: any) => new Date(p?.date?.start_date || p.createdTime)
const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

// 요소가 화면에 들어오면 true (모션 줄이기 시 즉시 true)
const useInView = <T extends HTMLElement>(): [
  React.RefObject<T>,
  boolean
] => {
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
      { threshold: 0.25 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, inView]
}

// 0 → target 카운트업 (easeOutCubic)
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

const Stats: React.FC<Props> = () => {
  const posts = usePostsQuery().filter((p) => p.type?.[0] === "Post")

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
      .slice(0, 10)

    const yearMap = new Map<string, number>()
    posts.forEach((p) => {
      const y = String(dateOf(p).getFullYear())
      yearMap.set(y, (yearMap.get(y) || 0) + 1)
    })
    const years = [...yearMap.entries()].sort((a, b) => +a[0] - +b[0])

    let months = 0
    if (posts.length) {
      const times = posts.map((p) => dateOf(p).getTime())
      const first = new Date(Math.min(...times))
      const now = new Date()
      months =
        (now.getFullYear() - first.getFullYear()) * 12 +
        (now.getMonth() - first.getMonth()) +
        1
    }
    return {
      total,
      categoryCount: catMap.size,
      tagCount: tagMap.size,
      months,
      categories,
      topTags,
      years,
    }
  }, [posts])

  const maxCat = data.categories[0]?.[1] || 1
  const maxTag = data.topTags[0]?.[1] || 1
  const maxYear = Math.max(1, ...data.years.map(([, n]) => n))

  const [tilesActive, setTilesActive] = useState(false)
  useEffect(() => setTilesActive(true), [])

  const [catRef, catIn] = useInView<HTMLDivElement>()
  const [tagRef, tagIn] = useInView<HTMLDivElement>()
  const [yearRef, yearIn] = useInView<HTMLDivElement>()

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

      <section className="panel">
        <h2>카테고리별 글</h2>
        <div className="bars" ref={catRef}>
          {data.categories.map(([name, n], i) => (
            <div className="row" key={name}>
              <span className="name" title={name}>
                {name}
              </span>
              <span className="track">
                <span
                  className="fill"
                  style={{
                    width: catIn ? `${(n / maxCat) * 100}%` : "0%",
                    transitionDelay: `${i * 70}ms`,
                  }}
                />
              </span>
              <span className="val">{n}</span>
            </div>
          ))}
          {!data.categories.length && <p className="empty">아직 없어요.</p>}
        </div>
      </section>

      <section className="panel">
        <h2>많이 쓴 태그 Top 10</h2>
        <div className="bars" ref={tagRef}>
          {data.topTags.map(([name, n], i) => (
            <div className="row" key={name}>
              <span className="name" title={name}>
                #{name}
              </span>
              <span className="track">
                <span
                  className="fill"
                  style={{
                    width: tagIn ? `${(n / maxTag) * 100}%` : "0%",
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              </span>
              <span className="val">{n}</span>
            </div>
          ))}
          {!data.topTags.length && <p className="empty">아직 없어요.</p>}
        </div>
      </section>

      <section className="panel">
        <h2>연도별 발행</h2>
        <div className="years" ref={yearRef}>
          {data.years.map(([y, n], i) => (
            <div className="ybar" key={y}>
              <span className="ynum">{n}</span>
              <span
                className="ycol"
                style={{
                  height: yearIn ? `${Math.max(6, (n / maxYear) * 100)}%` : "0%",
                  transitionDelay: `${i * 90}ms`,
                }}
              />
              <span className="ylabel">{y}</span>
            </div>
          ))}
          {!data.years.length && <p className="empty">아직 없어요.</p>}
        </div>
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
    }
    .empty {
      color: ${({ theme }) => theme.colors.gray9};
      font-size: 0.875rem;
    }
  }

  .bars {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }
  .row {
    display: grid;
    grid-template-columns: 7.5rem 1fr 2rem;
    align-items: center;
    gap: 0.75rem;

    @media (max-width: 620px) {
      grid-template-columns: 5.5rem 1fr 1.75rem;
      gap: 0.5rem;
    }

    .name {
      font-size: 0.8125rem;
      color: ${({ theme }) => theme.colors.gray11};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .track {
      height: 0.625rem;
      border-radius: 999px;
      background-color: ${({ theme }) => plumOf(theme.scheme).tint};
      overflow: hidden;
    }
    .fill {
      display: block;
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(
        90deg,
        ${({ theme }) => plumOf(theme.scheme).violet},
        ${({ theme }) => plumOf(theme.scheme).accent}
      );
      /* 스크롤 진입 시 왼쪽에서 자라남 */
      transition: width 0.85s cubic-bezier(0.2, 0.7, 0.2, 1);
    }
    .val {
      font-size: 0.8125rem;
      font-weight: 600;
      text-align: right;
      color: ${({ theme }) => theme.colors.gray11};
      font-variant-numeric: tabular-nums;
    }
    :hover .fill {
      filter: brightness(1.08);
    }
  }

  .years {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    height: 10rem;
    padding-top: 1.25rem;
  }
  .ybar {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
    gap: 0.5rem;

    .ynum {
      font-size: 0.8125rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.gray11};
      font-variant-numeric: tabular-nums;
    }
    .ycol {
      width: 100%;
      max-width: 3.5rem;
      border-radius: 6px 6px 2px 2px;
      background: linear-gradient(
        180deg,
        ${({ theme }) => plumOf(theme.scheme).accent},
        ${({ theme }) => plumOf(theme.scheme).violet}
      );
      /* 스크롤 진입 시 아래에서 솟아오름 */
      transition: height 0.9s cubic-bezier(0.2, 0.7, 0.2, 1);
    }
    :hover .ycol {
      filter: brightness(1.08);
    }
    .ylabel {
      font-size: 0.75rem;
      color: ${({ theme }) => theme.colors.gray9};
      font-variant-numeric: tabular-nums;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tile,
    .row .fill,
    .ybar .ycol {
      transition: none;
    }
  }
`
