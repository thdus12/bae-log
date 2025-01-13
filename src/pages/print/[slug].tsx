// pages/print/[slug].tsx
import { useEffect } from 'react'
import NotionRenderer from 'src/routes/Detail/components/NotionRenderer'
import usePostQuery from 'src/hooks/usePostQuery'
import styled from '@emotion/styled'
import { useRouter } from 'next/router'
import { GetStaticProps, GetStaticPaths } from 'next'
import { getPosts, getRecordMap } from 'src/apis'
import { filterPosts, FilterPostsOptions } from "src/libs/utils/notion/filterPosts"
import { CONFIG } from 'site.config'
import { queryClient } from 'src/libs/react-query'
import { queryKey } from 'src/constants/queryKey'
import { dehydrate } from '@tanstack/react-query'

// Paper 타입만 가져오도록 필터 옵션 설정
const filter: FilterPostsOptions = {
  acceptStatus: ["Public", "PublicOnDetail"],
  acceptType: ["Paper"]  // Paper 타입만 허용
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPosts()
  const filteredPost = filterPosts(posts, filter)  // filter 적용

  return {
    paths: filteredPost.map((row) => `/print/${row.slug}`),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug

  const posts = await getPosts()
  const detailPosts = filterPosts(posts, filter)  // 동일한 filter 적용
  const postDetail = detailPosts.find((t: any) => t.slug === slug)
  const recordMap = await getRecordMap(postDetail?.id!)

  await queryClient.prefetchQuery(queryKey.post(`${slug}`), () => ({
    ...postDetail,
    recordMap,
  }))

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: CONFIG.revalidateTime,
  }
}

const PrintPage = () => {
  const data = usePostQuery()
  const router = useRouter()

  useEffect(() => {
    if (data && data.type[0] !== "Paper") {
      router.push('/')
    }
  }, [data, router])

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => {
        window.print()
      }, 1000)
      return () => clearTimeout(timer)
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
  padding: 2rem;
  max-width: 56rem;
  margin: 0 auto;
  background: white;

  .print-content {
    margin: 0 auto;
    max-width: 42rem;
  }

  @media print {
    /* A4 크기 설정 */
    @page {
      size: A4;
      margin: 20mm;  // 여백 설정
    }

    html, body {
      zoom: 62%;  // 64% 비율
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact
    }

    /* 페이지 나누기 방지 */
    .notion-text,
    .notion-quote,
    .notion-h-title {
      break-inside: avoid;
    }

    /* 배경색 인쇄 설정 */
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;

    /* 링크 색상 */
    a {
      color: inherit !important;
      text-decoration: none !important;
    }

    /* 이미지 크기 조정 */
    img {
      max-width: 100% !important;
    }

    /* 코드 블록 스타일 조정 */
    .notion-code {
      break-inside: avoid;
      border: 1px solid #e5e7eb;
    }
  }
`