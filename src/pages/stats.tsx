import { CONFIG } from "../../site.config"
import { NextPageWithLayout } from "../types"
import { getPosts } from "../apis"
import MetaConfig from "src/components/MetaConfig"
import { queryClient } from "src/libs/react-query"
import { queryKey } from "src/constants/queryKey"
import { GetStaticProps } from "next"
import { dehydrate } from "@tanstack/react-query"
import { filterPosts } from "src/libs/utils/notion"
import Stats from "src/routes/Stats"

export const getStaticProps: GetStaticProps = async () => {
  const posts = filterPosts(await getPosts())
  await queryClient.prefetchQuery(queryKey.posts(), () => posts)

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: CONFIG.revalidateTime,
  }
}

const StatsPage: NextPageWithLayout = () => {
  const meta = {
    title: `통계 | ${CONFIG.blog.title}`,
    description: "블로그 기록을 숫자로 정리한 통계 페이지",
    type: "website",
    url: `${CONFIG.link}/stats`,
  }

  return (
    <>
      <MetaConfig {...meta} />
      <Stats />
    </>
  )
}

export default StatsPage
