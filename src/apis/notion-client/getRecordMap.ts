import { NotionAPI } from "notion-client"

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

export const getRecordMap = async (pageId: string) => {
  const api = new NotionAPI()
  const recordMap = await api.getPage(pageId)

  // Notion API 응답 정규화 (새 형식 대응)
  recordMap.block = normalizeRecordMap(recordMap.block)
  recordMap.collection = normalizeRecordMap(recordMap.collection) as any

  return recordMap
}
