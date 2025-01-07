import React, { useRef } from "react"
import PostHeader from "./PostHeader"
import Footer from "./PostFooter"
import CommentBox from "./CommentBox"
import Category from "src/components/Category"
import styled from "@emotion/styled"
import NotionRenderer from "../components/NotionRenderer"
import usePostQuery from "src/hooks/usePostQuery"
import html2canvas from "html2canvas"
import jsPDF from 'jspdf'

type Props = {}

const PostDetail: React.FC<Props> = () => {
  const data = usePostQuery()
  const contentRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return

    const content = contentRef.current
    const pdf = new jsPDF('p', 'pt', 'a4')

    const canvas = await html2canvas(content, {
      scale: 2,
      useCORS: true,
      logging: false
    })
    const imgWidth = 595.28 // A4 width in points
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      0,
      imgWidth,
      imgHeight
    )

    pdf.save(`${data?.title || 'document'}.pdf`)
  }

  if (!data) return null

  const category = (data.category && data.category?.[0]) || undefined
  const isPaper = data.type[0] === "Paper"

  return (
    <StyledWrapper>
      <article>
        {category && (
          <div css={{ marginBottom: "0.5rem" }}>
            <Category readOnly={data.status?.[0] === "PublicOnDetail"}>
              {category}
            </Category>
          </div>
        )}
        {data.type[0] === "Post" && <PostHeader data={data} />}
        {/* PDF 다운로드 버튼 추가 */}
        {isPaper && (
          <button
            onClick={handleDownloadPDF}
            className="mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            style={{
              border: '1px solid #e5e7eb',
              fontSize: '0.875rem',
              marginTop: '1rem'
            }}
          >
            Download PDF
          </button>
        )}

        <div>
          <NotionRenderer recordMap={data.recordMap} />
        </div>
        {data.type[0] === "Post" && (
          <>
            <Footer />
            <CommentBox data={data} />
          </>
        )}
      </article>
    </StyledWrapper>
  )
}

export default PostDetail

const StyledWrapper = styled.div`
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-top: 3rem;
  padding-bottom: 3rem;
  border-radius: 1.5rem;
  max-width: 56rem;
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "white" : "rgb(63 63 70)"};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 0 auto;
  > article {
    margin: 0 auto;
    max-width: 42rem;
  }
`
