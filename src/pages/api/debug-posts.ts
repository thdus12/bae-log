import type { NextApiRequest, NextApiResponse } from "next"
import { CONFIG } from "site.config"
import { NotionAPI } from "notion-client"
import { idToUuid } from "notion-utils"
import getAllPageIds from "src/libs/utils/notion/getAllPageIds"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    let id = CONFIG.notionConfig.pageId as string
    const api = new NotionAPI()
    const response = await api.getPage(id)
    id = idToUuid(id)

    const block = response.block
    const rawMetadata = block[id]?.value
    const collectionQuery = response.collection_query
    const firstCollection = Object.values(collectionQuery)[0]

    // Show the structure of each view
    const viewStructures: any = {}
    if (firstCollection) {
      Object.entries(firstCollection).forEach(([viewId, view]: [string, any]) => {
        viewStructures[viewId] = {
          hasBlockIds: !!view?.blockIds,
          blockIdsCount: view?.blockIds?.length,
          hasCollectionGroupResults: !!view?.collection_group_results,
          collectionGroupBlockIdsCount: view?.collection_group_results?.blockIds?.length,
          hasReducerResults: !!view?.reducerResults,
          reducerResultsKeys: view?.reducerResults ? Object.keys(view.reducerResults) : null,
          reducerCollectionGroupBlockIds: view?.reducerResults?.collection_group_results?.blockIds?.length,
          topLevelKeys: Object.keys(view || {}),
        }
      })
    }

    const pageIds = getAllPageIds(response)

    res.status(200).json({
      notionPageId: id,
      rawMetadataType: rawMetadata?.type,
      collectionQueryKeys: Object.keys(collectionQuery || {}),
      viewCount: firstCollection ? Object.keys(firstCollection).length : 0,
      viewStructures,
      pageIdsCount: pageIds.length,
      pageIdsSample: pageIds.slice(0, 5),
    })
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
      stack: error.stack,
    })
  }
}
