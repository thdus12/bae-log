import React from "react"
import PostHeader from "./PostHeader"
import Footer from "./PostFooter"
import CommentBox from "./CommentBox"
import Category from "src/components/Category"
import styled from "@emotion/styled"
import { FiArrowLeft } from "react-icons/fi"
import { plumOf } from "src/styles/plum"
import NotionRenderer from "../components/NotionRenderer"
import Toc from "../components/Toc"
import PrevNextPosts from "./PrevNextPosts"
import usePostQuery from "src/hooks/usePostQuery"
import { useRouter } from "next/router"

type Props = {}

const PostDetail: React.FC<Props> = () => {
  const data = usePostQuery()
  const router = useRouter()

  const handlePrint = () => {
    window.print();
  };

  if (!data) return null

  const category = (data.category && data.category?.[0]) || undefined
  const isPaper = data.type[0] === "Paper" // Paper 타입 체크

  return (
    <>
      <ContentWrapper>
        <BackButton onClick={() => router.push("/")}>
          <FiArrowLeft /> Back
        </BackButton>
        <article>
          {category && (
            <div css={{ marginBottom: "0.75rem" }}>
              <Category
                variant="tint"
                readOnly={data.status?.[0] === "PublicOnDetail"}
              >
                {category}
              </Category>
            </div>
          )}
          {data.type[0] === "Post" && <PostHeader data={data} />}
          {/* Paper 타입일 때만 Print 버튼 표시 */}
          {isPaper && (
            <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
              <button
                onClick={handlePrint}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  color: '#374151',
                  fontWeight: 500,
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6'
                }}
              >
                Save PDF
              </button>
            </div>
          )}
          <div>
            <NotionRenderer recordMap={data.recordMap} />
          </div>
          {data.type[0] === "Post" && <Footer />}
        </article>
      </ContentWrapper>

      {/* 본문 카드와 댓글 카드 사이의 독립 영역 */}
      {data.type[0] === "Post" && <PrevNextPosts />}

      {data.type[0] === "Post" && <Toc />}

      {data.type[0] === "Post" && (
        <CommentWrapper>
          <div className="comment-inner">
            <CommentBox data={data} />
          </div>
        </CommentWrapper>
      )}
    </>
  )
}

export default PostDetail

const BackButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 1.5rem;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.gray11};
  background-color: ${({ theme }) => plumOf(theme.scheme).tint};
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  svg {
    transition: transform 0.2s cubic-bezier(0.2, 0.7, 0.2, 1);
  }

  :hover {
    color: ${({ theme }) => plumOf(theme.scheme).accentDeep};

    svg {
      transform: translateX(-2px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    svg {
      transition: none;
    }
  }
`

const ContentWrapper = styled.div`
  padding: 3rem 1.5rem;
  border-radius: 1.5rem;
  max-width: 52rem; // 읽기 편한 폭
  background-color: ${({ theme }) => plumOf(theme.scheme).card};
  border: 1px solid ${({ theme }) => plumOf(theme.scheme).line};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 0 auto;

  > article {
    margin: 0 auto;
    max-width: 46rem; // 본문 폭 (여백 최소화)
    width: 100%;
  }
`

const CommentWrapper = styled.div`
  margin: 1rem auto 0;
  padding: 2rem 1.5rem;
  border-radius: 1.5rem;
  max-width: 52rem; // 읽기 편한 폭
  background-color: ${({ theme }) => plumOf(theme.scheme).card};
  border: 1px solid ${({ theme }) => plumOf(theme.scheme).line};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06);

  .comment-inner {
    max-width: 46rem; // 본문 폭 (여백 최소화)
    width: 100%;
    margin: 0 auto;
  }
`
