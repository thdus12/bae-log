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
  const detailPosts = filterPosts(posts, filter)
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
  padding: 3rem 1.5rem;
  border-radius: 1.5rem;
  max-width: 70rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 0 auto;

  .print-content {
    margin: 0 auto;
    max-width: 60rem;
    width: 100%;
  }

  @media print {
    @page {
      size: A4;
      margin: 20mm;
    }

    padding: 0;
    max-width: none;
    box-shadow: none;

    .print-content {
      max-width: none;
      font-size: 62%;  // 글씨 크기를 62%로 줄임

      /* Notion 컨텐츠의 모든 텍스트 요소 크기 조절 */
      .notion-text,
      .notion-h-title,
      .notion-h1,
      .notion-h2,
      .notion-h3 {
        font-size: 62%;
      }

      /* 인라인 코드도 크기 조절 */
      .notion-inline-code {
        font-size: 62%;
      }

      /* 이미지나 다른 요소들도 크기 조절이 필요하다면 추가 */
      img {
        transform: scale(0.62);
      }
    }
  }
`