import Link from "next/link"
import React from "react"
import styled from "@emotion/styled"
import usePostQuery from "src/hooks/usePostQuery"
import usePostsQuery from "src/hooks/usePostsQuery"
import { plumOf } from "src/styles/plum"

// 글 목록(최신순)에서 현재 글의 앞뒤 글을 찾아 내비로 보여준다.
// 본문/댓글 카드와 같은 언어의 단일 카드 안에 좌우로 배치하고,
// 앞/뒤 글이 없어도 슬롯을 유지하며 "없음"을 비활성으로 표시한다.
const PrevNextPosts: React.FC = () => {
  const current = usePostQuery()
  const posts = usePostsQuery().filter((p) => p.type?.[0] === "Post")

  if (!current) return null
  const idx = posts.findIndex((p) => p.slug === current.slug)
  if (idx === -1) return null

  const newer = idx > 0 ? posts[idx - 1] : null
  const older = idx < posts.length - 1 ? posts[idx + 1] : null

  return (
    <StyledWrapper>
      {older ? (
        <Link className="slot" href={`/${older.slug}`}>
          <div className="dir">← 이전 글</div>
          <div className="pt">{older.title}</div>
        </Link>
      ) : (
        <div className="slot empty">
          <div className="dir">← 이전 글</div>
          <div className="pt none">없음</div>
        </div>
      )}
      <div className="divider" />
      {newer ? (
        <Link className="slot next" href={`/${newer.slug}`}>
          <div className="dir">다음 글 →</div>
          <div className="pt">{newer.title}</div>
        </Link>
      ) : (
        <div className="slot next empty">
          <div className="dir">다음 글 →</div>
          <div className="pt none">없음</div>
        </div>
      )}
    </StyledWrapper>
  )
}

export default PrevNextPosts

const StyledWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  align-items: stretch;
  max-width: 52rem;
  margin: 1rem auto 0;
  padding: 0.375rem;
  border-radius: 1.25rem;
  background-color: ${({ theme }) => plumOf(theme.scheme).card};
  border: 1px solid ${({ theme }) => plumOf(theme.scheme).line};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }

  .divider {
    background-color: ${({ theme }) => plumOf(theme.scheme).line};
    margin: 0.5rem 0;

    @media (max-width: 620px) {
      height: 1px;
      margin: 0 0.75rem;
    }
  }

  .slot {
    display: block;
    padding: 0.75rem 1.125rem;
    border-radius: 0.875rem;
    cursor: pointer;
    transition: background-color 0.15s ease;

    .dir {
      font-size: 0.6875rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: ${({ theme }) => theme.colors.gray9};
      margin-bottom: 0.25rem;
    }
    .pt {
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: ${({ theme }) => theme.colors.gray12};
      transition: color 0.15s ease;
    }

    :hover {
      background-color: ${({ theme }) => plumOf(theme.scheme).tint};

      .pt {
        color: ${({ theme }) => plumOf(theme.scheme).accentDeep};
      }
    }
  }
  .slot.next {
    text-align: right;
  }

  /* 앞/뒤 글이 없는 슬롯: 비활성 표시 */
  .slot.empty {
    cursor: default;

    .dir {
      opacity: 0.6;
    }
    .pt.none {
      font-weight: 500;
      color: ${({ theme }) => theme.colors.gray9};
      opacity: 0.7;
    }
    :hover {
      background-color: transparent;

      .pt.none {
        color: ${({ theme }) => theme.colors.gray9};
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .slot {
      transition: none;
    }
  }
`
