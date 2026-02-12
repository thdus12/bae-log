import { CONFIG } from "site.config"
import { NotionAPI } from "notion-client"
import { idToUuid } from "notion-utils"

import getAllPageIds from "src/libs/utils/notion/getAllPageIds"
import getPageProperties from "src/libs/utils/notion/getPageProperties"
import { TPosts } from "src/types"

/**
 * Notion API 응답의 새 형식(spaceId 래핑) 정규화
 * Old: { value: {...data}, role } → New: { spaceId, value: { value: {...data}, role } }
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

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */

// TODO: react query를 사용해서 처음 불러온 뒤로는 해당데이터만 사용하도록 수정
export const getPosts = async () => {
  let id = CONFIG.notionConfig.pageId as string
  const api = new NotionAPI()

  const response = await api.getPage(id)
  id = idToUuid(id)

  // Notion API 응답 정규화 (새 형식 대응)
  response.block = normalizeRecordMap(response.block)
  response.collection = normalizeRecordMap(response.collection) as any

  const collection = Object.values(response.collection)[0]?.value
  const schema = collection?.schema

  // collection과 schema가 존재하는지로 유효성 확인
  if (!collection || !schema) {
    return []
  }

  // Construct Data
  const pageIds = getAllPageIds(response)
  const rawBlocks = await api.getBlocks(pageIds)
  const wholeBlocks = normalizeRecordMap(rawBlocks.recordMap.block)

  const data = []
  for (let i = 0; i < pageIds.length; i++) {
    const id = pageIds[i]
    const properties =
      (await getPageProperties(id, wholeBlocks, schema)) || null
    if (!wholeBlocks[id]) continue

    // Add fullwidth, createdtime to properties
    properties.createdTime = new Date(
      wholeBlocks[id].value?.created_time
    ).toString()
    properties.fullWidth =
      (wholeBlocks[id].value?.format as any)?.page_full_width ?? false

    data.push(properties)
  }

  // Sort by date
  data.sort((a: any, b: any) => {
    const dateA: any = new Date(a?.date?.start_date || a.createdTime)
    const dateB: any = new Date(b?.date?.start_date || b.createdTime)
    return dateB - dateA
  })

  const posts = data as TPosts
  return posts
}
