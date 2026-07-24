import Link from "next/link"
import React from "react"
import styled from "@emotion/styled"
import usePostQuery from "src/hooks/usePostQuery"
import usePostsQuery from "src/hooks/usePostsQuery"
import { plumOf } from "src/styles/plum"

// 글 목록(최신순)에서 현재 글의 앞뒤 글을 찾아 내비 카드로 보여준다
const PrevNextPosts: React.FC = () => {
  const current = usePostQuery()
  const posts = usePostsQuery().filter((p) => p.type?.[0] === "Post")

  if (!current) return null
  const idx = posts.findIndex((p) => p.slug === current.slug)
  if (idx === -1) return null

  const newer = idx > 0 ? posts[idx - 1] : null
  const older = idx < posts.length - 1 ? posts[idx + 1] : null
  if (!newer && !older) return null

  return (
    <StyledWrapper>
      {older ? (
        <Link className="card" href={`/${older.slug}`}>
          <div className="dir">← 이전 글</div>
          <div className="pt">{older.title}</div>
        </Link>
      ) : (
        <span />
      )}
      {newer ? (
        <Link className="card next" href={`/${newer.slug}`}>
          <div className="dir">다음 글 →</div>
          <div className="pt">{newer.title}</div>
        </Link>
      ) : (
        <span />
      )}
    </StyledWrapper>
  )
}

export default PrevNextPosts

const StyledWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 2.5rem;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }

  .card {
    display: block;
    border: 1px solid ${({ theme }) => plumOf(theme.scheme).line};
    border-radius: 0.875rem;
    padding: 0.875rem 1rem;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.2, 0.7, 0.2, 1),
      border-color 0.15s ease;

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
      transform: translateY(-2px);
      border-color: ${({ theme }) => plumOf(theme.scheme).accent};

      .pt {
        color: ${({ theme }) => plumOf(theme.scheme).accentDeep};
      }
    }
  }
  .card.next {
    text-align: right;
  }

  @media (prefers-reduced-motion: reduce) {
    .card {
      transition: none;
    }
  }
`
