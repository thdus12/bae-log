import { useRouter } from "next/router"
import React from "react"
import styled from "@emotion/styled"
import { plumOf } from "src/styles/plum"

type Props = {
  children: string
  readOnly?: boolean
  /**
   * glass: 사진 썸네일 위 어두운 유리(기본)
   * tint: 카드 위 플럼 틴트
   * frost: 그라데이션 기본 썸네일 위 밝은 서리 유리
   */
  variant?: "glass" | "tint" | "frost"
}

const Category: React.FC<Props> = ({
  readOnly = false,
  variant = "glass",
  children,
}) => {
  const router = useRouter()

  const handleClick = (value: string) => {
    if (readOnly) return
    router.push(`/?category=${value}`)
  }
  return (
    <StyledWrapper
      variant={variant}
      onClick={() => handleClick(children)}
      css={{
        cursor: readOnly ? "default" : "pointer",
      }}
    >
      {children}
    </StyledWrapper>
  )
}

export default Category

const StyledWrapper = styled.div<{ variant: "glass" | "tint" | "frost" }>`
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.6875rem;
  padding-right: 0.6875rem;
  border-radius: 9999px;
  width: fit-content;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;

  ${({ variant, theme }) => {
    if (variant === "tint")
      return `
        color: ${plumOf(theme.scheme).accentDeep};
        background-color: ${plumOf(theme.scheme).tint};
      `
    if (variant === "frost")
      return theme.scheme === "dark"
        ? `
        color: ${plumOf("dark").accentDeep};
        background-color: rgba(18, 16, 20, 0.55);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.08);
      `
        : `
        color: ${plumOf("light").accentDeep};
        background-color: rgba(255, 255, 255, 0.62);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.55);
      `
    return `
      color: #ffffff;
      background-color: rgba(24, 15, 26, 0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.16);
    `
  }}
`
