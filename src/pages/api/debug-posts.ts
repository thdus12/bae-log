import type { NextApiRequest, NextApiResponse } from "next"
import { CONFIG } from "site.config"
import { NotionAPI } from "notion-client"
import { idToUuid } from "notion-utils"
import getAllPageIds from "src/libs/utils/notion/getAllPageIds"
import getPageProperties from "src/libs/utils/notion/getPageProperties"

/**
 * Notion API 응답의 새 형식(spaceId 래핑) 정규화
 */
function normalizeRecordMap(recordMap: any): any {
  const result: any = {}
  for (const [key, entry] of Object.entries(recordMap)) {
    const e = entry as any
    if (e && "spaceId" in e && e.value?.value !== undefined) {
      result[key] = { value: e.value.value, role: e.value.role }
    } else {
      result[key] = e
    }
  }
  return result
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const rawId = CONFIG.notionConfig.pageId as string
    const api = new NotionAPI()
    const response = await api.getPage(rawId)
    const convertedId = idToUuid(rawId)

    // Raw response structure
    const keySizes: any = {}
    for (const key of Object.keys(response)) {
      const val = (response as any)[key]
      if (val && typeof val === "object") {
        keySizes[key] = Object.keys(val).length
      } else {
        keySizes[key] = val
      }
    }

    // Raw collection_query (full content for debugging)
    const rawCollectionQuery = response.collection_query

    // Try normalization like getPosts does
    response.block = normalizeRecordMap(response.block)
    response.collection = normalizeRecordMap(response.collection) as any

    const collection = Object.values(response.collection)[0]?.value
    const schema = collection?.schema

    // Try getAllPageIds
    let pageIds: string[] = []
    let pageIdError: string | null = null
    try {
      pageIds = getAllPageIds(response)
    } catch (e: any) {
      pageIdError = e.message
    }

    // Try getBlocks + getPageProperties for first few pages
    let posts: any[] = []
    let postsError: string | null = null
    if (pageIds.length > 0) {
      try {
        const rawBlocks = await api.getBlocks(pageIds)
        const wholeBlocks = normalizeRecordMap(rawBlocks.recordMap.block)

        for (let i = 0; i < pageIds.length; i++) {
          const id = pageIds[i]
          const properties =
            (await getPageProperties(id, wholeBlocks, schema)) || null
          if (!wholeBlocks[id]) continue
          properties.createdTime = new Date(
            wholeBlocks[id].value?.created_time
          ).toString()
          posts.push({
            slug: properties.slug,
            title: properties.title,
            status: properties.status,
            type: properties.type,
          })
        }
      } catch (e: any) {
        postsError = e.message
      }
    }

    // Find resume specifically
    const resumePost = posts.find((p) => p.slug === "resume")

    res.status(200).json({
      keySizes,
      rawCollectionQuery,
      collectionExists: !!collection,
      schemaExists: !!schema,
      pageIdCount: pageIds.length,
      pageIdError,
      postsError,
      totalPosts: posts.length,
      resumePost: resumePost || "NOT FOUND",
      allSlugs: posts.map((p) => p.slug),
    })
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
      stack: error.stack,
    })
  }
}
