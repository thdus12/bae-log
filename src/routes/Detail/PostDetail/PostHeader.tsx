import { CONFIG } from "site.config"
import Tag from "src/components/Tag"
import { TPost } from "src/types"
import { formatDate } from "src/libs/utils"
import Image from "next/image"
import React from "react"
import styled from "@emotion/styled"
import { plumOf } from "src/styles/plum"
import useReadingTime from "../hooks/useReadingTime"

type Props = {
  data: TPost
}

const PostHeader: React.FC<Props> = ({ data }) => {
  const readingTime = useReadingTime()

  return (
    <StyledWrapper>
      <h1 className="title">{data.title}</h1>
      {data.type[0] !== "Paper" && (
        <nav>
          <div className="top">
            {data.author && data.author[0] && data.author[0].name && (
              <>
                <div className="author">
                  <Image
                    css={{ borderRadius: "50%" }}
                    src={data.author[0].profile_photo || CONFIG.profile.image}
                    alt="profile_photo"
                    width={24}
                    height={24}
                  />
                  <div className="">{data.author[0].name}</div>
                </div>
                <span className="dot" />
              </>
            )}
            <div className="date">
              {formatDate(
                data?.date?.start_date || data.createdTime,
                CONFIG.lang
              )}
            </div>
            {readingTime && (
              <>
                <span className="dot" />
                <div className="reading-time">☕ {readingTime}분 읽기</div>
              </>
            )}
          </div>
          <div className="mid">
            {data.tags && (
              <div className="tags">
                {data.tags &&
                  data.tags.map((tag: string, idx: number) => (
                    <Tag key={idx}>{tag}</Tag>
                  ))}
              </div>
            )}
          </div>
          {data.thumbnail && (
            <div className="thumbnail">
              <Image
                src={data.thumbnail}
                css={{ objectFit: "cover" }}
                fill
                alt={data.title}
              />
            </div>
          )}
        </nav>
      )}
    </StyledWrapper>
  )
}

export default PostHeader

const StyledWrapper = styled.div`
  .title {
    font-size: 2.125rem;
    line-height: 1.3;
    font-weight: 800;
    letter-spacing: -0.02em;
    /* 한글 단어가 어절 단위로 자연스럽게 줄바꿈되도록 */
    word-break: keep-all;
  }
  nav {
    margin-top: 1rem;
    color: ${({ theme }) => theme.colors.gray11};
    /* 헤더와 본문 사이 구분선 */
    padding-bottom: 1.75rem;
    border-bottom: 1px solid ${({ theme }) => plumOf(theme.scheme).line};
    margin-bottom: 2rem;

    > .top {
      display: flex;
      margin-bottom: 0.875rem;
      gap: 0.625rem;
      align-items: center;
      font-size: 0.875rem;
      font-variant-numeric: tabular-nums;
      .author {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      .dot {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background-color: ${({ theme }) => theme.colors.gray8};
        flex-shrink: 0;
      }
      .reading-time {
        color: ${({ theme }) => theme.colors.gray10};
      }
    }
    > .mid {
      display: flex;
      align-items: center;
      .tags {
        display: flex;
        overflow-x: auto;
        flex-wrap: nowrap;
        gap: 0.5rem;
        max-width: 100%;
      }
    }
    .thumbnail {
      overflow: hidden;
      position: relative;
      margin-top: 1.5rem;
      border-radius: 1.25rem;
      width: 100%;
      background-color: ${({ theme }) => theme.colors.gray4};
      padding-bottom: 66%;

      @media (min-width: 1024px) {
        padding-bottom: 50%;
      }
    }
  }
`
