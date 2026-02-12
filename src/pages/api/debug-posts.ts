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

    const block = response.block
    const blockKeys = Object.keys(block)
    const blockHasConvertedId = convertedId in block
    const blockEntry = block[convertedId]

    // Try to find the block by checking all keys
    let matchingBlockType = null
    for (const key of blockKeys) {
      const type = block[key]?.value?.type
      if (type === "collection_view_page" || type === "collection_view") {
        matchingBlockType = { key, type }
        break
      }
    }

    res.status(200).json({
      rawId,
      convertedId,
      rawIdLength: rawId.length,
      blockKeysCount: blockKeys.length,
      blockKeysSample: blockKeys.slice(0, 5),
      blockHasConvertedId,
      blockEntryType: blockEntry?.value?.type ?? null,
      matchingCollectionBlock: matchingBlockType,
    })
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
      stack: error.stack,
    })
  }
}
