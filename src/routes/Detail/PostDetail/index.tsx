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

  if (!data) return null

  const category = (data.category && data.category?.[0]) || undefined

  return (
    <>
      <ContentWrapper>
        <a onClick={() => router.push("/")}>← Back</a>
        <article>
          {category && (
            <div css={{ marginBottom: "0.5rem" }}>
              <Category readOnly={data.status?.[0] === "PublicOnDetail"}>
                {category}
              </Category>
            </div>
          )}
          {data.type[0] === "Post" && <PostHeader data={data} />}
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
  max-width: 56rem;
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "white" : "rgb(63 63 70)"};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 0 auto;

  > article {
    margin: 0 auto;
    max-width: 60rem;  // 게시글 너비
    width: 100%;       // 추가
  }
`

const CommentWrapper = styled.div`
  margin: 2rem auto 0;  // top right/left bottom
  padding: 2rem 1.5rem;
  border-radius: 1.5rem;
  max-width: 70rem;
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "white" : "rgb(63 63 70)"};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06);

  .comment-inner {
    max-width: 60rem;
    width: 100%;
    margin: 0 auto;
  }
`