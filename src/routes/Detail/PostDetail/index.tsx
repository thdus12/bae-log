import React, { useRef } from "react"
import PostHeader from "./PostHeader"
import Footer from "./PostFooter"
import CommentBox from "./CommentBox"
import Category from "src/components/Category"
import styled from "@emotion/styled"
import NotionRenderer from "../components/NotionRenderer"
import usePostQuery from "src/hooks/usePostQuery"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

type Props = {}

const PostDetail: React.FC<Props> = () => {
  const data = usePostQuery()
  const contentRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return

    try {
      const content = contentRef.current

      // html2canvas 옵션 조정
      const canvas = await html2canvas(content, {
        scale: 1.5, // 해상도 조정
        useCORS: true, // 이미지 로딩을 위해
        logging: false,
        width: content.scrollWidth, // 전체 너비 캡처
        height: content.scrollHeight, // 전체 높이 캡처
        windowWidth: content.scrollWidth, // 뷰포트 너비 설정
        windowHeight: content.scrollHeight, // 뷰포트 높이 설정
        x: 0, // 시작 x 좌표
        y: 0, // 시작 y 좌표
        scrollX: -window.scrollX, // 스크롤 위치 보정
        scrollY: -window.scrollY, // 스크롤 위치 보정
      })

      // PDF 크기와 여백 설정
      const margin = 40 // 여백 크기 (포인트 단위)
      const imgWidth = 595 - margin * 2 // A4 너비에서 여백을 뺀 크기
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // PDF 생성 옵션 설정
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      })

      // 여백을 포함하여 이미지 추가
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        margin, // x 좌표에 여백 추가
        margin, // y 좌표에 여백 추가
        imgWidth,
        imgHeight
      )

      // 페이지 높이를 넘어가는 경우 자동으로 페이지 추가
      if (imgHeight > 842 - margin * 2) {
        // A4 높이(842pt)에서 여백을 뺀 높이
        let remainingHeight = imgHeight
        let currentPage = 1

        while (remainingHeight > 0) {
          remainingHeight -= 842 - margin * 2
          if (remainingHeight > 0) {
            pdf.addPage()
            currentPage++

            pdf.addImage(
              canvas.toDataURL("image/png"),
              "PNG",
              margin,
              margin - (842 - margin * 2) * (currentPage - 1),
              imgWidth,
              imgHeight
            )
          }
        }
      }

      pdf.save(`${data?.title || "document"}.pdf`)
    } catch (error) {
      console.error("PDF 변환 중 에러:", error)
    }
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
          <div style={{ textAlign: "right", marginBottom: "1rem" }}>
            <button
              onClick={handleDownloadPDF}
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
              Download PDF
            </button>
          </div>
        )}

        <div
          ref={contentRef} style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
          <NotionRenderer recordMap={data.recordMap} />
        </div>
        {data.type[0] === "Post" && (
          <>
            <Footer />
            <CommentBox data={data} />
          </>
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
