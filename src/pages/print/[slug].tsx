// pages/print/[slug].tsx
import { useEffect } from 'react'
import NotionRenderer from 'src/routes/Detail/components/NotionRenderer'
import usePostQuery from 'src/hooks/usePostQuery'
import styled from '@emotion/styled'
import { useRouter } from 'next/router'

const PrintPage = () => {
  const data = usePostQuery()
  const router = useRouter()

  useEffect(() => {
    if (data && data.type[0] !== "Paper") {
      router.push('/')
    }
  }, [data, router])

  // 페이지 로드 후 자동으로 프린트 다이얼로그 열기
  useEffect(() => {
    if (data) {
      window.print()
    }
  }, [data])

  if (!data || data.type[0] !== "Paper") return null

  return (
    <PrintWrapper>
      <div className="print-content">
        <NotionRenderer recordMap={data.recordMap} />
      </div>
    </PrintWrapper>
  )
}

export default PrintPage

const PrintWrapper = styled.div`
  .print-content {
    padding: 2rem;
  }

  @media print {
    @page {
      size: A4;
      margin: 20mm;
    }

    html, body {
      zoom: 62%;  // 64% 비율
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact
    }

    .print-content {
      padding: 0;
    }

    /* 프린트할 때 불필요한 요소 숨기기 */
    nav, header, footer, button {
      display: none !important;
    }
  }
`