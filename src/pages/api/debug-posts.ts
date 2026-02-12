import type { NextApiRequest, NextApiResponse } from "next"
import { CONFIG } from "site.config"
import { NotionAPI } from "notion-client"
import { idToUuid } from "notion-utils"
import getAllPageIds from "src/libs/utils/notion/getAllPageIds"
import getPageProperties from "src/libs/utils/notion/getPageProperties"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    let id = CONFIG.notionConfig.pageId as string
    const api = new NotionAPI()
    const response = await api.getPage(id)
    id = idToUuid(id)

    const collection = Object.values(response.collection)[0]?.value
    const schema = collection?.schema

    if (!collection || !schema) {
      return res.status(200).json({ error: "No collection or schema" })
    }

    const pageIds = getAllPageIds(response)

    // Step 2: getBlocks
    const blocksResponse = await api.getBlocks(pageIds)
    const wholeBlocks = blocksResponse.recordMap.block

    const wholeBlocksKeys = Object.keys(wholeBlocks)
    const matchCount = pageIds.filter((pid) => pid in wholeBlocks).length

    // Step 3: Try extracting one page
    let sampleResult = null
    if (pageIds.length > 0) {
      const sampleId = pageIds[0]
      const hasBlock = sampleId in wholeBlocks
      const blockValue = wholeBlocks[sampleId]?.value
      const props = await getPageProperties(sampleId, wholeBlocks, schema)
      sampleResult = {
        sampleId,
        hasBlock,
        blockValueType: blockValue?.type ?? null,
        blockValueHasProperties: !!blockValue?.properties,
        extractedProps: props
          ? { title: props.title, slug: props.slug, status: props.status, type: props.type }
          : null,
      }
    }

    res.status(200).json({
      pageIdsCount: pageIds.length,
      wholeBlocksKeysCount: wholeBlocksKeys.length,
      matchCount,
      sampleResult,
    })
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
      stack: error.stack,
    })
  }
}
