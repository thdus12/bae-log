import { PropertyType } from "notion-types"

export type ExtendedPropertyType = PropertyType | 'code'

export interface CodeBlockContent {
  code: string
  language: string
  colorFormat: string
}