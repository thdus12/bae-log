import React from "react"
import PostHeader from "./PostHeader"
import Footer from "./PostFooter"
import CommentBox from "./CommentBox"
import Category from "src/components/Category"
import styled from "@emotion/styled"
import NotionRenderer from "../components/NotionRenderer"
import usePostQuery from "src/hooks/usePostQuery"
import { useRouter } from "next/router"

type Props = {}

const PostDetail: React.FC<Props> = () => {
  const data = usePostQuery()
  const router = useRouter()

  const handlePrint = () => {
    // window.print()
    window.open(`/print/${router.query.slug}`, '_blank');
  }

  if (!data) return null

  const category = (data.category && data.category?.[0]) || undefined
  const isPaper = data.type[0] === "Paper" // Paper 타입 체크

  return (
    <>
      <ContentWrapper>
        <div className="back-link">
          <a onClick={() => router.push("/")}>← Back</a>
        </div>
        <article>
          {category && (
            <div css={{ marginBottom: "0.5rem" }}>
              <Category readOnly={data.status?.[0] === "PublicOnDetail"}>
                {category}
              </Category>
            </div>
          )}
          {data.type[0] === "Post" && <PostHeader data={data} />}
          {/* Paper 타입일 때만 Print 버튼 표시 */}
          {isPaper && (
            <PrintButtonWrapper>
              <button
                onClick={handlePrint}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  color: "#374151",
                  fontWeight: 500,
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#e5e7eb"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6"
                }}
              >
                Save PDF
              </button>
            </PrintButtonWrapper>
          )}
          <div>
            <NotionRenderer recordMap={data.recordMap} />
          </div>
          {data.type[0] === "Post" && <Footer />}
        </article>
      </ContentWrapper>

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

const ContentWrapper = styled.div`
  padding: 3rem 1.5rem;
  border-radius: 1.5rem;
  max-width: 70rem; // 56rem에서 증가
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "white" : "rgb(63 63 70)"};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 0 auto;

  > article {
    margin: 0 auto;
    max-width: 60rem; // 42rem에서 증가
    width: 100%;
  }
`

const CommentWrapper = styled.div`
  margin: 2rem auto 0;
  padding: 2rem 1.5rem;
  border-radius: 1.5rem;
  max-width: 70rem; // 56rem에서 증가
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "white" : "rgb(63 63 70)"};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  .comment-inner {
    max-width: 60rem; // 42rem에서 증가
    width: 100%;
    margin: 0 auto;
  }
`

const PrintButtonWrapper = styled.div`
  text-align: right;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {  // 모바일 크기에서
    display: none;  // 버튼 숨기기
  }
`;