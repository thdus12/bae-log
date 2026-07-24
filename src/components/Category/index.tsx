import { useRouter } from "next/router"
import React from "react"
import styled from "@emotion/styled"
import { plumOf } from "src/styles/plum"

type Props = {
  children: string
  readOnly?: boolean
  /** glass: 썸네일 위 반투명 유리(기본) / tint: 카드 위 플럼 틴트 */
  variant?: "glass" | "tint"
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

const StyledWrapper = styled.div<{ variant: "glass" | "tint" }>`
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.6875rem;
  padding-right: 0.6875rem;
  border-radius: 9999px;
  width: fit-content;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;

  ${({ variant, theme }) =>
    variant === "tint"
      ? `
    color: ${plumOf(theme.scheme).accentDeep};
    background-color: ${plumOf(theme.scheme).tint};
  `
      : `
    color: #ffffff;
    background-color: rgba(24, 15, 26, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.16);
  `}
`
