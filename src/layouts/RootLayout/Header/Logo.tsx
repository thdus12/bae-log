import Link from "next/link"
import { CONFIG } from "site.config"
import styled from "@emotion/styled"
import { plumOf } from "src/styles/plum"

// hover 시: 손글씨 밑줄이 스윽 그려지고, 다 그려지면 별표가 한 획으로 마무리
const Logo = () => {
  return (
    <StyledWrapper href="/" aria-label={CONFIG.blog.title}>
      {CONFIG.blog.title}
      <svg
        className="doodle-line"
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path pathLength="100" d="M1 7 C 20 3, 45 9, 65 5 S 92 4, 99 6" />
      </svg>
      <svg className="doodle-star" viewBox="0 0 20 20" aria-hidden="true">
        {/* 펜을 안 떼고 한 붓으로 그리는 별 */}
        <path
          pathLength="100"
          d="M10 1.5 L15.3 17.3 L1.4 7.2 L18.6 7.2 L4.7 17.3 Z"
        />
      </svg>
    </StyledWrapper>
  )
}

export default Logo

const StyledWrapper = styled(Link)`
  position: relative;
  display: inline-block;
  font-size: 1.25rem;
  font-weight: bold;

  svg {
    pointer-events: none;
    overflow: visible;
  }
  path {
    fill: none;
    stroke: ${({ theme }) => plumOf(theme.scheme).accent};
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    transition: stroke-dashoffset 0.45s ease;
  }
  .doodle-line {
    position: absolute;
    left: -2px;
    bottom: -6px;
    width: calc(100% + 4px);
    height: 10px;
  }
  .doodle-line path {
    stroke-width: 2;
  }
  .doodle-star {
    position: absolute;
    right: -19px;
    bottom: -2px;
    width: 14px;
    height: 14px;
    transform: rotate(-12deg);
  }
  .doodle-star path {
    stroke-width: 2.4;
  }

  :hover path {
    stroke-dashoffset: 0;
  }
  /* 별표는 밑줄이 다 그려진 뒤에 시작 */
  :hover .doodle-star path {
    transition: stroke-dashoffset 0.45s ease 0.4s;
  }

  @media (prefers-reduced-motion: reduce) {
    path {
      transition: none;
    }
  }
`
