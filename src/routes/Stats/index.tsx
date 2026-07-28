import React, { useEffect, useMemo, useRef, useState } from "react"
import styled from "@emotion/styled"
import { FiActivity, FiBarChart2, FiBookOpen } from "react-icons/fi"
import usePostsQuery from "src/hooks/usePostsQuery"
import usePalette from "src/hooks/usePalette"
import useScheme from "src/hooks/useScheme"
import { SectionIcon } from "src/components/SectionIcon"
import { plumOf } from "src/styles/plum"

type Props = {}

// 고리를 두른 행성 (react-icons에 없어서 직접 그림)
const PlanetIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden
  >
    <circle cx="12" cy="12" r="4.2" />
    <ellipse cx="12" cy="12" rx="10.4" ry="4.4" transform="rotate(-22 12 12)" />
  </svg>
)

const dateOf = (p: any) => new Date(p?.date?.start_date || p.createdTime)
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

type Cell = { date: Date; count: number } | null

// 깃허브 잔디 스타일: 일요일 시작 주 단위 열로 1년을 채운다
const buildYearGrid = (year: number, dayMap: Map<string, number>) => {
  const start = new Date(year, 0, 1)
  start.setDate(start.getDate() - start.getDay()) // 그 주 일요일까지 back
  const endOfYear = new Date(year, 11, 31)
  const last = new Date(year, 11, 31 + (6 - endOfYear.getDay())) // 그 주 토요일까지

  const weeks: Cell[][] = []
  let week: Cell[] = []
  for (let d = new Date(start); d <= last; d.setDate(d.getDate() + 1)) {
    week.push(
      d.getFullYear() === year
        ? { date: new Date(d), count: dayMap.get(dayKey(d)) || 0 }
        : null
    )
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }

  // 월 라벨: 각 월이 처음 등장하는 열
  const monthLabels: { col: number; text: string }[] = []
  let lastMonth = -1
  weeks.forEach((w, i) => {
    const first = w.find(Boolean) as Exclude<Cell, null> | undefined
    if (!first) return
    const m = first.date.getMonth()
    if (m !== lastMonth) {
      lastMonth = m
      monthLabels.push({ col: i, text: `${m + 1}월` })
    }
  })

  return { weeks, monthLabels }
}
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
// 한 칸에 표시할 최대 책 수 (넘으면 +N)
const MAX_BOOKS = 10

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

    // 일별 잔디: "YYYY-M-D" → 글 수
    const dayMap = new Map<string, number>()
    posts.forEach((p) => {
      const k = dayKey(dateOf(p))
      dayMap.set(k, (dayMap.get(k) || 0) + 1)
    })

    let months = 0
    let years: number[] = []
    if (posts.length) {
      const times = posts.map((p) => dateOf(p).getTime())
      const first = new Date(Math.min(...times))
      const now = new Date()
      months =
        (now.getFullYear() - first.getFullYear()) * 12 +
        (now.getMonth() - first.getMonth()) +
        1
      for (let y = now.getFullYear(); y >= first.getFullYear(); y--) years.push(y)
    }

    return {
      total,
      categoryCount: catMap.size,
      tagCount: tagMap.size,
      months,
      categories,
      topTags,
      dayMap,
      years,
    }
  }, [posts])

  // 선택된 연도의 일별 그리드
  const [year, setYear] = useState<number>(() => new Date().getFullYear())
  useEffect(() => {
    if (data.years.length && !data.years.includes(year)) setYear(data.years[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.years])

  const grid = useMemo(
    () => buildYearGrid(year, data.dayMap),
    [year, data.dayMap]
  )
  const yearTotal = useMemo(
    () =>
      grid.weeks
        .flat()
        .reduce((sum, c) => sum + (c ? c.count : 0), 0),
    [grid]
  )
  // 하루 최대 글 수 (농도 기준, 최소 4단계 보장)
  const maxDay = Math.max(2, ...Array.from(data.dayMap.values()))

  // 잔디 셀 색: 0이면 흙(틴트), 많을수록 진한 플럼
  const cellColor = (c: number) =>
    c === 0
      ? pal.tint
      : `color-mix(in srgb, ${pal.accent} ${Math.round(
          32 + 55 * Math.min(1, c / maxDay)
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

  return (
    <StyledWrapper>
      <header className="head">
        <h1>
          <SectionIcon>
            <FiBarChart2 />
          </SectionIcon>{" "}
          Statistics
        </h1>
        <p>지금까지 쌓아온 기록을 숫자로.</p>
      </header>

      <div className="tiles">
        <Tile label="Posts" value={data.total} active={tilesActive} delay={0} />
        <Tile label="Categories" value={data.categoryCount} active={tilesActive} delay={90} />
        <Tile label="Tags" value={data.tagCount} active={tilesActive} delay={180} />
        <Tile label="Months" value={data.months} active={tilesActive} delay={270} />
      </div>

      {/* 잔디밭 */}
      <section className="panel">
        <div className="phead">
          <h2>
            <SectionIcon>
              <FiActivity />
            </SectionIcon>{" "}
            Activity
            <small>
              {year}년 · {yearTotal}개
            </small>
          </h2>
          <div className="yearpick">
            {data.years.map((y) => (
              <button
                key={y}
                type="button"
                data-active={y === year}
                onClick={() => setYear(y)}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className="grass" ref={grassRef}>
          <div className="cal">
            {/* 월 라벨 */}
            <div
              className="months"
              style={{ gridTemplateColumns: `repeat(${grid.weeks.length}, var(--cell))` }}
            >
              {grid.monthLabels.map((m) => (
                <span key={m.col} style={{ gridColumnStart: m.col + 1 }}>
                  {m.text}
                </span>
              ))}
            </div>

            <div className="calbody">
              {/* 요일 라벨 (월·수·금만) */}
              <div className="wdays">
                {["", "월", "", "수", "", "금", ""].map((w, i) => (
                  <span key={i}>{w}</span>
                ))}
              </div>

              <div className="weeks" key={`${year}-${grassIn}`}>
                {grid.weeks.map((w, ci) => (
                  <div className="week" key={ci}>
                    {w.map((cell, ri) =>
                      cell ? (
                        <span
                          key={ri}
                          className={`cell ${grassIn ? "pop" : "idle"}`}
                          title={`${cell.date.getFullYear()}년 ${
                            cell.date.getMonth() + 1
                          }월 ${cell.date.getDate()}일 · ${cell.count}개`}
                          style={{
                            backgroundColor: cellColor(cell.count),
                            animationDelay: `${ci * 9}ms`,
                          }}
                        />
                      ) : (
                        <span key={ri} className="cell blank" />
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="legend">
            <span>적음</span>
            {[0, 0.34, 0.67, 1].map((r) => (
              <i
                key={r}
                style={{
                  backgroundColor: `color-mix(in srgb, ${pal.accent} ${Math.round(
                    32 + 55 * r
                  )}%, ${pal.card})`,
                }}
              />
            ))}
            <span>많음</span>
          </div>
          {!data.years.length && <p className="empty">아직 없어요.</p>}
        </div>
      </section>

      {/* 책장 */}
      <section className="panel">
        <h2>
          <SectionIcon>
            <FiBookOpen />
          </SectionIcon>{" "}
          Bookshelf
          <small>글 하나가 책 한 권</small>
        </h2>
        <div className="shelfwrap" ref={shelfRef}>
          <div className="shelf">
            {data.categories.map(([name, n], gi) => (
              <div className="bgroup" key={name}>
                <div className="books">
                  {Array.from({ length: Math.min(n, MAX_BOOKS) }).map((_, i) => {
                    const h = BOOK_H[(gi + i) % BOOK_H.length]
                    const isLast = i === Math.min(n, MAX_BOOKS) - 1 && n > 1
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
                  {n > MAX_BOOKS && <span className="more">+{n - MAX_BOOKS}</span>}
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

      {/* 태그 은하수 */}
      <section className="panel">
        <h2>
          <SectionIcon>
            <PlanetIcon />
          </SectionIcon>{" "}
          Tag Galaxy
          <small>자주 쓴 태그일수록 안쪽 궤도</small>
        </h2>
        {data.topTags.length ? (
          <TagGalaxy tags={data.topTags} total={data.tagCount} pal={pal} />
        ) : (
          <p className="empty">아직 없어요.</p>
        )}
      </section>
    </StyledWrapper>
  )
}

const Tile: React.FC<{
  label: string
  value: number
  unit?: string
  active: boolean
  delay: number
}> = ({ label, value, unit, active, delay }) => {
  const n = useCountUp(value, active, delay)
  return (
    <div className="tile">
      <div className="tlabel">{label}</div>
      <div className="tvalue">
        {n}
        {unit && <span className="tunit">{unit}</span>}
      </div>
    </div>
  )
}

/* ──────────────── Tag Galaxy ──────────────── */

const GALAXY_H = 380 // 데스크탑 높이 (모바일은 CSS에서 축소)
const SQUASH = 0.5 // 궤도 타원의 세로 눌림 = 기울어진 궤도면

// 배경 잔별 — SSR/CSR 결과가 같도록 난수 대신 결정적 값 사용
// (Math.sin은 런타임마다 끝자리가 달라 하이드레이션 경고가 나므로 소수점 3자리로 고정)
const frac = (x: number) => Number((x - Math.floor(x)).toFixed(3))
const DUST = Array.from({ length: 42 }, (_, i) => ({
  x: frac(Math.sin(i * 12.9898) * 43758.5453) * 100,
  y: frac(Math.sin(i * 78.233) * 12345.678) * 100,
  s: 1 + frac(Math.sin(i * 3.7) * 999.13) * 1.6,
  d: frac(Math.sin(i * 5.11) * 731.7) * 4,
}))

const TagGalaxy: React.FC<{
  tags: [string, number][]
  total: number
  pal: ReturnType<typeof plumOf>
}> = ({ tags, total, pal }) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const planetRefs = useRef<(HTMLDivElement | null)[]>([])
  const angles = useRef<number[]>([])
  const pausedRef = useRef(-1)
  const [focused, setFocused] = useState(-1)
  const [box, setBox] = useState({ w: 0, h: GALAXY_H })

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const read = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 자주 쓴 태그가 안쪽 궤도 · 큰 행성 · (아주 느리게) 빠른 공전
  const orbits = useMemo(() => {
    // 좁은 화면은 궤도를 더 눕히고 행성 수를 줄여야 라벨이 안 겹친다
    const narrow = box.w > 0 && box.w < 560
    const squash = narrow ? 0.62 : SQUASH
    const sorted = [...tags]
      .sort((a, b) => b[1] - a[1])
      .slice(0, narrow ? 7 : 14)
    const max = sorted[0]?.[1] || 1
    const rxMax = Math.max(
      narrow ? 108 : 130,
      Math.min(box.w / 2 - (narrow ? 30 : 56), (box.h / 2 - 24) / squash)
    )
    const rxMin = narrow ? 84 : Math.min(box.h * 0.33, rxMax - 24)
    return sorted.map(([name, n], i) => {
      const t = sorted.length > 1 ? i / (sorted.length - 1) : 0
      const rx = rxMin + t * (rxMax - rxMin)
      return {
        name,
        n,
        rx,
        ry: rx * squash,
        size: (narrow ? 7 : 8) + (n / max) * (narrow ? 11 : 15),
        // rad/ms — 안쪽 한 바퀴 ≈ 90초, 바깥 ≈ 210초 (아주 천천히)
        spd: 0.00003 + (1 - t) * 0.00004,
      }
    })
  }, [tags, box])

  useEffect(() => {
    if (!orbits.length) return
    if (angles.current.length !== orbits.length)
      // 황금각으로 흩뿌려 시작 위치가 겹치지 않게
      angles.current = orbits.map((_, i) => (i * 2.399) % (Math.PI * 2))

    const place = (i: number) => {
      const el = planetRefs.current[i]
      if (!el) return
      const o = orbits[i]
      const a = angles.current[i]
      el.style.transform = `translate(-50%, -50%) translate(${
        Math.cos(a) * o.rx
      }px, ${Math.sin(a) * o.ry}px)`
      // 궤도 뒤쪽(위쪽 반원)을 지날 때 살짝 흐려져 깊이감
      el.style.opacity =
        pausedRef.current === i
          ? "1"
          : (0.58 + ((Math.sin(a) + 1) / 2) * 0.42).toFixed(3)
    }

    if (prefersReduced()) {
      orbits.forEach((_, i) => place(i))
      return
    }

    let raf = 0
    let last = 0
    const tick = (t: number) => {
      const dt = last ? Math.min(t - last, 48) : 16
      last = t
      orbits.forEach((_, i) => {
        if (pausedRef.current !== i) angles.current[i] += orbits[i].spd * dt
        place(i)
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [orbits])

  const focus = (i: number) => {
    if (pausedRef.current === i) return
    pausedRef.current = i
    setFocused(i)
  }

  // 행성이 작아 조준이 어려우니, 궤도선 근처에 커서가 오면 그 행성을 잡아준다
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = wrapRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const mx = e.clientX - r.left - r.width / 2
    const my = e.clientY - r.top - r.height / 2
    let best = -1
    let bestD = Infinity
    orbits.forEach((o, i) => {
      const d = Math.abs(Math.hypot(mx / o.rx, my / o.ry) - 1) * o.rx
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    focus(bestD < 18 ? best : -1)
  }

  return (
    <div
      className="galaxy"
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={() => focus(-1)}
    >
      {DUST.map((d, i) => (
        <span
          key={i}
          className="dust"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.s,
            height: d.s,
            animationDelay: `${d.d}s`,
          }}
        />
      ))}

      <svg className="rings" aria-hidden>
        {orbits.map((o, i) => (
          <ellipse
            key={o.name}
            cx="50%"
            cy="50%"
            rx={o.rx}
            ry={o.ry}
            className={focused === i ? "hot" : ""}
          />
        ))}
      </svg>

      <div className="core" style={{ backgroundColor: pal.accent }}>
        <b>{total}</b>
        <span>TAGS</span>
      </div>

      {orbits.map((o, i) => (
        <div
          key={o.name}
          className={`planet${focused === i ? " on" : ""}`}
          ref={(el) => {
            planetRefs.current[i] = el
          }}
          onPointerEnter={() => focus(i)}
          title={`#${o.name} · ${o.n}개`}
        >
          <span
            className="ball"
            style={{
              width: o.size,
              height: o.size,
              backgroundColor: pal.accent,
            }}
          />
          <span className="lb">#{o.name}</span>
          <span className="cnt">{o.n}개</span>
        </div>
      ))}
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

  /* ── 패널 헤더 (제목 + 연도 선택) ── */
  .phead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1.25rem;

    h2 {
      margin-bottom: 0;
    }
  }
  .yearpick {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;

    button {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.625rem;
      border-radius: 999px;
      cursor: pointer;
      color: ${({ theme }) => theme.colors.gray10};
      background-color: transparent;
      border: 1px solid ${({ theme }) => plumOf(theme.scheme).line};
      font-variant-numeric: tabular-nums;
      transition: background-color 0.15s ease, color 0.15s ease,
        border-color 0.15s ease;

      :hover {
        color: ${({ theme }) => plumOf(theme.scheme).accentDeep};
        background-color: ${({ theme }) => plumOf(theme.scheme).tint};
      }
      &[data-active="true"] {
        color: ${({ theme }) => plumOf(theme.scheme).tagOnInk};
        background-color: ${({ theme }) => plumOf(theme.scheme).tagOnBg};
        border-color: transparent;
      }
    }
  }

  /* ── 🌱 잔디밭 (깃허브 스타일 일별 그리드) ── */
  .grass {
    --cell: 11px;
    --gap: 3px;

    @media (max-width: 720px) {
      --cell: 9px;
      --gap: 2px;
    }

    .cal {
      overflow-x: auto;
      padding-bottom: 0.25rem;
      scrollbar-width: none;
      ::-webkit-scrollbar {
        display: none;
      }
    }
    .months {
      display: grid;
      gap: var(--gap);
      margin-left: calc(1.5rem + var(--gap));
      margin-bottom: 0.3125rem;
      min-width: min-content;

      span {
        font-size: 0.625rem;
        color: ${({ theme }) => theme.colors.gray9};
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
    }
    .calbody {
      display: flex;
      gap: var(--gap);
      min-width: min-content;
    }
    .wdays {
      display: flex;
      flex-direction: column;
      gap: var(--gap);
      width: 1.5rem;
      flex-shrink: 0;

      span {
        height: var(--cell);
        font-size: 0.625rem;
        line-height: var(--cell);
        color: ${({ theme }) => theme.colors.gray9};
      }
    }
    .weeks {
      display: flex;
      gap: var(--gap);
    }
    .week {
      display: flex;
      flex-direction: column;
      gap: var(--gap);
    }
    .cell {
      width: var(--cell);
      height: var(--cell);
      border-radius: 2.5px;
      cursor: default;
      transition: background-color 0.2s ease;

      :hover {
        outline: 2px solid ${({ theme }) => plumOf(theme.scheme).accent};
        outline-offset: 1px;
      }
    }
    .cell.blank {
      background-color: transparent !important;
      pointer-events: none;
    }
    .cell.idle {
      transform: scale(0);
      opacity: 0;
    }
    .cell.pop {
      animation: cellpop 0.4s cubic-bezier(0.3, 1.4, 0.4, 1) backwards;
    }
    @keyframes cellpop {
      from {
        transform: scale(0);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
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

  /* ── 📚 책장 (한 줄 4칸, 줄바꿈) ── */
  .shelf {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem 1rem;

    @media (max-width: 720px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  .bgroup {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 0;
  }
  .books {
    display: flex;
    align-items: flex-end;
    align-content: flex-end;
    justify-content: center;
    flex-wrap: wrap;
    gap: 3px;
    width: 100%;
    min-height: 54px;
    /* 각 칸이 하나의 선반 */
    border-bottom: 3px solid ${({ theme }) => plumOf(theme.scheme).line};
    padding: 0 0.25rem;
    transition: border-color 0.25s ease;
  }
  .book {
    width: 11px;
    border-radius: 3px 3px 0 0;
    transform-origin: bottom center;
    transition: height 0.55s cubic-bezier(0.2, 0.7, 0.2, 1),
      transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.28s ease;
  }
  /* 마지막 책은 옆으로 삐딱하게 기대어 있음 */
  .book.lean {
    transform: rotate(9deg);
    transform-origin: bottom left;
    margin-left: 3px;
  }

  /* 책을 꺼내 드는 호버 (마우스 쓰는 환경에서만) */
  @media (hover: hover) and (pointer: fine) {
    .book:hover {
      transform: translateY(-8px);
      filter: brightness(1.1);
    }
    .book.lean:hover {
      transform: translateY(-8px) rotate(9deg);
    }
    /* 빠진 자리로 양옆 책이 기울어진다 */
    .book:not(.lean):hover + .book:not(.lean) {
      transform: rotate(5deg);
    }
    .book:not(.lean):has(+ .book:not(.lean):hover) {
      transform: rotate(-5deg);
    }

    /* 칸 전체에 올리면 선반과 라벨이 살아난다 */
    .bgroup:hover .books {
      border-bottom-color: ${({ theme }) => plumOf(theme.scheme).accent};
    }
    .bgroup:hover .glabel .gname {
      color: ${({ theme }) => plumOf(theme.scheme).accentDeep};
    }
    .bgroup:hover .glabel em {
      background-color: ${({ theme }) => plumOf(theme.scheme).accent};
      color: ${({ theme }) => plumOf(theme.scheme).tagOnInk};
    }
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
    justify-content: center;
    gap: 0.375rem;
    margin-top: 0.5rem;
    max-width: 100%;

    .gname {
      font-size: 0.75rem;
      color: ${({ theme }) => theme.colors.gray11};
      transition: color 0.25s ease;
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
      transition: background-color 0.25s ease, color 0.25s ease;
    }
  }

  /* ── Tag Galaxy ── */
  .galaxy {
    position: relative;
    width: 100%;
    height: ${GALAXY_H}px;
    border-radius: 1rem;
    overflow: hidden;
    background: radial-gradient(
          70% 80% at 50% 50%,
          ${({ theme }) =>
            `color-mix(in srgb, ${plumOf(theme.scheme).violet} 13%, ${
              plumOf(theme.scheme).card
            })`}
            0%,
          transparent 62%
        ),
      radial-gradient(
        110% 120% at 12% 8%,
        ${({ theme }) =>
          `color-mix(in srgb, ${plumOf(theme.scheme).accent} 9%, ${
            plumOf(theme.scheme).card
          })`}
          0%,
        transparent 55%
      ),
      ${({ theme }) => plumOf(theme.scheme).tint};

    @media (max-width: 620px) {
      height: 300px;
    }
  }
  .galaxy .rings {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    ellipse {
      fill: none;
      stroke: ${({ theme }) => theme.colors.gray9};
      stroke-width: 1;
      stroke-dasharray: 2 5;
      opacity: 0.3;
      transition: stroke 0.3s ease, opacity 0.3s ease, stroke-width 0.3s ease;
    }
    ellipse.hot {
      stroke: ${({ theme }) => plumOf(theme.scheme).accent};
      stroke-dasharray: none;
      stroke-width: 1.5;
      opacity: 0.9;
    }
  }
  .galaxy .dust {
    position: absolute;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.gray9};
    pointer-events: none;
    animation: twinkle 4s ease-in-out infinite;
  }
  @keyframes twinkle {
    0%,
    100% {
      opacity: 0.14;
    }
    50% {
      opacity: 0.42;
    }
  }

  /* 코어 = 전체 태그 수 */
  .galaxy .core {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 78px;
    height: 78px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 2;
    color: ${({ theme }) => plumOf(theme.scheme).tagOnInk};
    animation: corepulse 5.5s ease-in-out infinite;

    b {
      font-size: 1.4375rem;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }
    span {
      font-size: 0.5938rem;
      letter-spacing: 0.14em;
      opacity: 0.85;
      margin-top: 0.1875rem;
    }

    @media (max-width: 620px) {
      width: 58px;
      height: 58px;

      b {
        font-size: 1.125rem;
      }
      span {
        font-size: 0.5rem;
        margin-top: 0.125rem;
      }
    }
  }
  @keyframes corepulse {
    0%,
    100% {
      box-shadow: 0 0 0 0.5rem
          ${({ theme }) =>
            `color-mix(in srgb, ${plumOf(theme.scheme).accent} 12%, transparent)`},
        0 0 2rem -0.25rem
          ${({ theme }) =>
            `color-mix(in srgb, ${plumOf(theme.scheme).accent} 45%, transparent)`};
    }
    50% {
      box-shadow: 0 0 0 0.9375rem
          ${({ theme }) =>
            `color-mix(in srgb, ${plumOf(theme.scheme).accent} 7%, transparent)`},
        0 0 3rem -0.125rem
          ${({ theme }) =>
            `color-mix(in srgb, ${plumOf(theme.scheme).accent} 62%, transparent)`};
    }
  }

  /* 궤도를 도는 태그 행성 */
  .galaxy .planet {
    position: absolute;
    left: 50%;
    top: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1875rem;
    z-index: 3;
    cursor: default;
    will-change: transform;

    .ball {
      display: block;
      border-radius: 50%;
      box-shadow: 0 0 0 0 transparent;
      transition: box-shadow 0.3s ease,
        transform 0.35s cubic-bezier(0.3, 1.5, 0.4, 1);
    }
    .lb {
      font-size: 0.6563rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.gray11};
      white-space: nowrap;
      opacity: 0.62;
      transition: opacity 0.25s ease, color 0.25s ease;

      @media (max-width: 620px) {
        font-size: 0.5938rem;
      }
    }
    .cnt {
      display: none;
      font-size: 0.5938rem;
      color: ${({ theme }) => plumOf(theme.scheme).accent};
      font-variant-numeric: tabular-nums;
    }
  }
  .galaxy .planet.on {
    z-index: 4;

    .ball {
      transform: scale(1.5);
      box-shadow: 0 0 0 0.4375rem
          ${({ theme }) =>
            `color-mix(in srgb, ${plumOf(theme.scheme).accent} 16%, transparent)`},
        0 0 1.375rem -0.125rem
          ${({ theme }) =>
            `color-mix(in srgb, ${plumOf(theme.scheme).accent} 60%, transparent)`};
    }
    .lb {
      opacity: 1;
      font-weight: 700;
      color: ${({ theme }) => plumOf(theme.scheme).accentDeep};
    }
    .cnt {
      display: block;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tile,
    .grass .cell,
    .book,
    .galaxy .core,
    .galaxy .dust {
      transition: none;
      animation: none;
    }
    .grass .cell.idle {
      transform: scale(1);
      opacity: 1;
    }
  }
`
