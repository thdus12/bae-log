import { NotionAPI } from "notion-client"
import { BlockMap, CollectionPropertySchemaMap } from "notion-types"
import { getTextContent, getDateValue } from "notion-utils"
import { customMapImageUrl } from "./customMapImageUrl"
import { ExtendedPropertyType, CodeBlockContent } from "./types"

const getLanguageType = (notionLang: string): string => {
  const languageMap: { [key: string]: string } = {
    'plain text': 'text',
    'javascript': 'js',
    'typescript': 'ts',
    'bash': 'shell',
    'shell': 'shell',
    'python': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c++': 'cpp',
    'c': 'c',
    'css': 'css',
    'html': 'html',
    'json': 'json',
    'yaml': 'yaml',
    'sql': 'sql'
  }
  return languageMap[notionLang.toLowerCase()] || notionLang
}

export const getCodeBlockColor = (format: string): string => {
  const colorMap: { [key: string]: string } = {
    'blue': 'text-blue-600 dark:text-blue-400',
    'brown': 'text-amber-800 dark:text-amber-500',
    'gray': 'text-gray-600 dark:text-gray-400',
    'orange': 'text-orange-600 dark:text-orange-400',
    'purple': 'text-purple-600 dark:text-purple-400',
    'red': 'text-red-600 dark:text-red-400',
    'yellow': 'text-yellow-600 dark:text-yellow-400',
    'green': 'text-green-600 dark:text-green-400',
    'pink': 'text-pink-600 dark:text-pink-400',
    'default': 'text-gray-900 dark:text-gray-100'
  }
  return colorMap[format] || colorMap.default
}

const extractCodeBlock = (val: any): CodeBlockContent => {
  try {
    if (Array.isArray(val) && val[0] && Array.isArray(val[0][0])) {
      const codeBlock = val[0][0]
      return {
        code: codeBlock[0] || '',
        language: getLanguageType(codeBlock[1]?.[0]?.[1] || 'plain text'),
        colorFormat: codeBlock[1]?.[1] || 'default'
      }
    }
  } catch (error) {
    console.error('Error extracting code block:', error)
  }

  return {
    code: '',
    language: 'plain text',
    colorFormat: 'default'
  }
}

async function getPageProperties(
  id: string,
  block: BlockMap,
  schema: CollectionPropertySchemaMap
) {
  const api = new NotionAPI()
  const rawProperties = Object.entries(block?.[id]?.value?.properties || [])
  const excludeProperties = ["date", "select", "multi_select", "person", "file"]
  const properties: any = {}

  for (let i = 0; i < rawProperties.length; i++) {
    const [key, val]: any = rawProperties[i]
    properties.id = id

    const propertyType = schema[key]?.type as ExtendedPropertyType
    const propertyName = schema[key]?.name

    if (!propertyType) continue

    if (propertyType === 'code') {
      properties[propertyName] = extractCodeBlock(val)
    } else if (!excludeProperties.includes(propertyType)) {
      properties[propertyName] = getTextContent(val)
    } else {
      switch (propertyType) {
        case "file": {
          try {
            const Block = block?.[id].value
            const url: string = val[0][1][0][1]
            const newurl = customMapImageUrl(url, Block)
            properties[propertyName] = newurl
          } catch (error) {
            properties[propertyName] = undefined
          }
          break
        }
        case "date": {
          const dateProperty: any = getDateValue(val)
          delete dateProperty.type
          properties[propertyName] = dateProperty
          break
        }
        case "select": {
          const selects = getTextContent(val)
          if (selects[0]?.length) {
            properties[propertyName] = selects.split(",")
          }
          break
        }
        case "multi_select": {
          const selects = getTextContent(val)
          if (selects[0]?.length) {
            properties[propertyName] = selects.split(",")
          }
          break
        }
        case "person": {
          const rawUsers = val.flat()
          const users = []
          for (let i = 0; i < rawUsers.length; i++) {
            if (rawUsers[i][0][1]) {
              const userId = rawUsers[i][0]
              const res: any = await api.getUsers(userId)
              const resValue =
                res?.recordMapWithRoles?.notion_user?.[userId[1]]?.value
              const user = {
                id: resValue?.id,
                name:
                  resValue?.name ||
                  `${resValue?.family_name}${resValue?.given_name}` ||
                  undefined,
                profile_photo: resValue?.profile_photo || null,
              }
              users.push(user)
            }
          }
          properties[propertyName] = users
          break
        }
        default:
          break
      }
    }
  }
  return properties
}

export { getPageProperties as default }