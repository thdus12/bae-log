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
  background: white;
  width: 100%;  // 최대 너비 제한 제거

  .print-content {
    margin: 0 auto;
    width: 100%;  // 최대 너비 제한 제거
  }

  @media print {
    @page {
      size: A4;
      margin: 20mm;
    }
  }
`