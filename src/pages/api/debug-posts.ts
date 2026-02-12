import type { NextApiRequest, NextApiResponse } from "next"
import { getPosts } from "src/apis"
import { filterPosts } from "src/libs/utils/notion"
import { FilterPostsOptions } from "src/libs/utils/notion/filterPosts"

const filter: FilterPostsOptions = {
  acceptStatus: ["Public", "PublicOnDetail"],
  acceptType: ["Paper", "Post", "Page"],
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const posts = await getPosts()
    const detailPosts = filterPosts(posts, filter)

    const allSlugs = posts.map((p: any) => ({
      slug: p.slug,
      title: p.title,
      status: p.status,
      type: p.type,
      id: p.id,
    }))

    const filteredSlugs = detailPosts.map((p: any) => ({
      slug: p.slug,
      title: p.title,
      status: p.status,
      type: p.type,
    }))

    const resumePost = posts.find((p: any) => p.slug === "resume")

    res.status(200).json({
      totalPosts: posts.length,
      filteredPosts: detailPosts.length,
      allSlugs,
      filteredSlugs,
      resumePost: resumePost || "NOT FOUND",
    })
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
      stack: error.stack,
    })
  }
}
