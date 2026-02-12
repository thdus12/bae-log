import type { NextApiRequest, NextApiResponse } from "next"
import { CONFIG } from "site.config"
import { NotionAPI } from "notion-client"
import { idToUuid } from "notion-utils"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const rawId = CONFIG.notionConfig.pageId as string
    const api = new NotionAPI()
    const response = await api.getPage(rawId)
    const convertedId = idToUuid(rawId)

    // Check all top-level keys and their sizes
    const responseKeys = Object.keys(response)
    const keySizes: any = {}
    for (const key of responseKeys) {
      const val = (response as any)[key]
      if (val && typeof val === "object") {
        keySizes[key] = Object.keys(val).length
      } else {
        keySizes[key] = val
      }
    }

    // Collection details
    const collectionKeys = Object.keys(response.collection || {})
    let collectionSample = null
    if (collectionKeys.length > 0) {
      const firstKey = collectionKeys[0]
      const firstVal = (response.collection as any)[firstKey]
      collectionSample = {
        key: firstKey,
        hasValue: !!firstVal?.value,
        hasRole: !!firstVal?.role,
        topKeys: Object.keys(firstVal || {}),
      }
    }

    // Block entry for page ID
    const blockEntry = response.block[convertedId]
    let blockSample = null
    if (blockEntry) {
      blockSample = {
        hasValue: !!blockEntry.value,
        hasRole: !!(blockEntry as any).role,
        topKeys: Object.keys(blockEntry),
        valueKeys: blockEntry.value ? Object.keys(blockEntry.value) : null,
      }
    }

    res.status(200).json({
      responseKeys,
      keySizes,
      collectionKeys,
      collectionSample,
      blockSample,
    })
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
      stack: error.stack,
    })
  }
}
