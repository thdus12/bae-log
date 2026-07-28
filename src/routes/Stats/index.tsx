import React, { useMemo } from "react"
import styled from "@emotion/styled"
import usePostsQuery from "src/hooks/usePostsQuery"
import { plumOf } from "src/styles/plum"

type Props = {}

const dateOf = (p: any) => new Date(p?.date?.start_date || p.createdTime)

const Stats: React.FC<Props> = () => {
  const posts = usePostsQuery().filter((p) => p.type?.[0] === "Post")

  const data = useMemo(() => {
    const total = posts.length

    // 카테고리별 글 수 (내림차순)
    const catMap = new Map<string, number>()
    posts.forEach((p) => {
      const c = p.category?.[0]
      if (c) catMap.set(c, (catMap.get(c) || 0) + 1)
    })
    const categories = [...catMap.entries()].sort((a, b) => b[1] - a[1])

    // 태그별 글 수 Top 10
    const tagMap = new Map<string, number>()
    posts.forEach((p) =>
      p.tags?.forEach((t) => tagMap.set(t, (tagMap.get(t) || 0) + 1))
    )
    const tags = [...tagMap.entries()].sort((a, b) => b[1] - a[1])
    const topTags = tags.slice(0, 10)

    // 연도별 발행 수 (오래된→최신)
    const yearMap = new Map<string, number>()
    posts.forEach((p) => {
      const y = String(dateOf(p).getFullYear())
      yearMap.set(y, (yearMap.get(y) || 0) + 1)
    })
    const years = [...yearMap.entries()].sort((a, b) => +a[0] - +b[0])

    // 활동 기간(개월) — 첫 글부터 지금까지
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

  return (
    <StyledWrapper>
      <header className="head">
        <h1>📊 블로그 통계</h1>
        <p>지금까지 쌓아온 기록을 숫자로.</p>
      </header>

      {/* 요약 타일 */}
      <div className="tiles">
        <Tile label="총 글" value={data.total} unit="개" />
        <Tile label="카테고리" value={data.categoryCount} unit="개" />
        <Tile label="태그" value={data.tagCount} unit="개" />
        <Tile label="활동 기간" value={data.months} unit="개월" />
      </div>

      {/* 카테고리별 */}
      <section className="panel">
        <h2>카테고리별 글</h2>
        <div className="bars">
          {data.categories.map(([name, n]) => (
            <div className="row" key={name}>
              <span className="name" title={name}>
                {name}
              </span>
              <span className="track">
                <span
                  className="fill"
                  style={{ width: `${(n / maxCat) * 100}%` }}
                />
              </span>
              <span className="val">{n}</span>
            </div>
          ))}
          {!data.categories.length && <p className="empty">아직 없어요.</p>}
        </div>
      </section>

      {/* 태그 Top 10 */}
      <section className="panel">
        <h2>많이 쓴 태그 Top 10</h2>
        <div className="bars">
          {data.topTags.map(([name, n]) => (
            <div className="row" key={name}>
              <span className="name" title={name}>
                #{name}
              </span>
              <span className="track">
                <span
                  className="fill"
                  style={{ width: `${(n / maxTag) * 100}%` }}
                />
              </span>
              <span className="val">{n}</span>
            </div>
          ))}
          {!data.topTags.length && <p className="empty">아직 없어요.</p>}
        </div>
      </section>

      {/* 연도별 발행 */}
      <section className="panel">
        <h2>연도별 발행</h2>
        <div className="years">
          {data.years.map(([y, n]) => (
            <div className="ybar" key={y}>
              <span className="ynum">{n}</span>
              <span
                className="ycol"
                style={{ height: `${Math.max(6, (n / maxYear) * 100)}%` }}
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

const Tile: React.FC<{ label: string; value: number; unit: string }> = ({
  label,
  value,
  unit,
}) => (
  <div className="tile">
    <div className="tlabel">{label}</div>
    <div className="tvalue">
      {value}
      <span className="tunit">{unit}</span>
    </div>
  </div>
)

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

  /* 요약 타일 */
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

  /* 패널 */
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

  /* 가로 막대 */
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
    }
    .val {
      font-size: 0.8125rem;
      font-weight: 600;
      text-align: right;
      color: ${({ theme }) => theme.colors.gray11};
      font-variant-numeric: tabular-nums;
    }
  }

  /* 연도별 세로 막대 */
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
    }
    .ylabel {
      font-size: 0.75rem;
      color: ${({ theme }) => theme.colors.gray9};
      font-variant-numeric: tabular-nums;
    }
  }
`
