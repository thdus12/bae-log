import styled from "@emotion/styled"
import { plumOf } from "src/styles/plum"

/**
 * 섹션 타이틀 앞에 붙는 작은 SVG 아이콘 래퍼
 * (이모지 대신 사용 — OS별 렌더링 차이 없이 모노크롬 플럼 톤 유지)
 */
export const SectionIcon = styled.span`
  display: inline-flex;
  vertical-align: -0.125em;
  margin-right: 0.2rem;
  color: ${({ theme }) => plumOf(theme.scheme).accent};

  svg {
    width: 1em;
    height: 1em;
  }
`
