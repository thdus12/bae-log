import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { ExtendedRecordMap } from "notion-types"
import useScheme, { Scheme } from "src/hooks/useScheme"

// core styles shared by all of react-notion-x (required)
import "react-notion-x/src/styles.css"

// used for rendering equations (optional)

import "katex/dist/katex.min.css"
import { FC, useEffect } from "react"
import styled from "@emotion/styled"
import { pretendard } from "src/assets"

const _NotionRenderer = dynamic(
  () => import("react-notion-x").then((m) => m.NotionRenderer),
  { ssr: false }
)

const Code = dynamic(() =>
  import("react-notion-x/build/third-party/code").then(async (m) => {
    await Promise.all([
      import("prismjs/components/prism-bash.js"),
      import("prismjs/components/prism-docker.js"),
      import("prismjs/components/prism-yaml.js"),
      import("prismjs/components/prism-java.js"),
      import("prismjs/components/prism-sql.js"),
      import("prismjs/components/prism-python.js"),
      import("prismjs/components/prism-typescript.js"),
      import("prismjs/components/prism-javascript.js"),
    ])
    return m.Code as any
  })
)

const Collection = dynamic(() =>
  import("react-notion-x/build/third-party/collection").then(
    (m) => m.Collection
  )
)
const Equation = dynamic(() =>
  import("react-notion-x/build/third-party/equation").then((m) => m.Equation)
)
const Pdf = dynamic(
  () => import("react-notion-x/build/third-party/pdf").then((m) => m.Pdf),
  {
    ssr: false,
  }
)
const Modal = dynamic(
  () => import("react-notion-x/build/third-party/modal").then((m) => m.Modal),
  {
    ssr: false,
  }
)

const mapPageUrl = (id: string) => {
  return "https://www.notion.so/" + id.replace(/-/g, "")
}

type Props = {
  recordMap: ExtendedRecordMap
}

type StyledWrapperProps = {
  theme: Scheme
}

const NotionRenderer: FC<Props> = ({ recordMap }) => {
  const [scheme] = useScheme()

  useEffect(() => {
    const rootElement = document.documentElement
    if (rootElement) {
      rootElement.setAttribute("data-theme", scheme)
    }
  }, [scheme])

  return (
    <StyledWrapper theme={scheme as any}>
      <_NotionRenderer
        darkMode={scheme === "dark"}
        recordMap={recordMap}
        components={{
          Code,
          Collection,
          Equation,
          Modal,
          Pdf,
          nextImage: Image,
          nextLink: Link,

        }}
        mapPageUrl={mapPageUrl}
      />
    </StyledWrapper>
  )
}

export default NotionRenderer

const StyledWrapper = styled.div<StyledWrapperProps>`
  .notion-collection-page-properties {
    display: none !important;
  }

  .notion-page {
    padding: 0;
  }

  .notion-list {
    width: 100%;
  }

  .notion-code {
    background-color: ${({ theme }) =>
      theme === "dark" ? "#2d2d2d" : "#f7f6f3"};
  }

  .notion {
    font-family: ${pretendard.style.fontFamily};
    color: ${({ theme }) =>
      theme === "dark" ? "rgb(209 213 219)" : "rgb(107 114 128);"};
    overflow-wrap: break-word;
  }

  /* Text Colors */
  .notion-gray {
    color: rgb(120, 119, 116) !important;
  }
  .notion-brown {
    color: rgb(159, 107, 83) !important;
  }
  .notion-orange {
    color: rgb(217, 115, 13) !important;
  }
  .notion-yellow {
    color: rgb(203, 145, 47) !important;
  }
  .notion-green {
    color: rgb(68, 131, 97) !important;
  }
  .notion-blue {
    color: rgb(51, 126, 169) !important;
  }
  .notion-purple {
    color: rgb(144, 101, 176) !important;
  }
  .notion-pink {
    color: rgb(193, 76, 138) !important;
  }
  .notion-red {
    color: rgb(212, 76, 71) !important;
  }

  /* Background Colors */
  .notion-gray_background {
    background-color: rgb(241, 241, 239) !important;
  }
  .notion-brown_background {
    background-color: rgb(244, 238, 238) !important;
  }
  .notion-orange_background {
    background-color: rgb(251, 236, 221) !important;
  }
  .notion-yellow_background {
    background-color: rgb(251, 243, 219) !important;
  }
  .notion-green_background {
    background-color: rgb(237, 243, 236) !important;
  }
  .notion-blue_background {
    background-color: rgb(231, 243, 248) !important;
  }
  .notion-purple_background {
    background-color: rgb(244, 240, 247) !important;
  }
  .notion-pink_background {
    background-color: rgb(249, 238, 243) !important;
  }
  .notion-red_background {
    background-color: rgb(253, 235, 236) !important;
  }

  /* 인라인 코드 기본 스타일 */
  .notion-inline-code {
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
    background-color: ${({ theme }) =>
      theme === "dark" ? "rgba(45,45,45)" : "rgba(247,246,243)"};
  }

  .notion,
  .notion-text,
  .notion-quote,
  .notion-h-title {
    line-height: 1.75;
    padding: 0;
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }

  .notion-toggle {
    width: 100%;
  }

  .notion-list li {
    padding-top: 0;
    padding-bottom: 0;
  }

  .notion-page-link {
    color: inherit;
  }

  svg.notion-page-icon {
    display: none;
  }

  svg + .notion-page-title-text {
    border-bottom: 0;
  }

  .notion-bookmark {
    border: 1px solid rgb(243 244 246);
    color: inherit;
  }

  .notion-bookmark .notion-bookmark-title,
  .notion-bookmark .notion-bookmark-link div {
    color: ${({ theme }) =>
      theme === "dark" ? "rgb(229 231 235)" : "rgb(17 24 39);"};
  }

  .notion-bookmark .notion-bookmark-description {
    color: ${({ theme }) =>
      theme === "dark" ? "rgb(209 213 219)" : "rgb(75 85 99);"};
  }

  .notion-code > code {
    color: ${({ theme }) => (theme === "dark" ? "#ccc)" : "rgb(17 24 39);")};
  }

  pre[class*="language-"] {
    line-height: inherit;
  }

  .notion-bookmark:hover {
    border-color: rgb(96 165 250);
  }

  .notion-viewport {
    z-index: -10;
  }

  .notion-asset-caption {
    color: ${({ theme }) =>
      theme === "dark" ? "rgb(161 161 170)" : "rgb(113 113 122);"};
  }

  .notion-full-width {
    padding-left: 0;
    padding-right: 0;
  }

  .notion-page {
    width: auto;
    padding-left: 0;
    padding-right: 0;
    overflow: auto;
  }

  .notion-quote {
    padding: 0.2em 0.9em;
  }

  .notion-collection {
    max-width: 100%;
  }

  .notion-collection > .notion-collection-header {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .notion-collection > .notion-table {
    max-width: 100% !important;
  }

  .notion-collection > .notion-table > .notion-table-view {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .notion-collection-view-type {
    display: none;
  }

  .notion-collection-row {
    display: none;
  }

  .notion-hr {
    border: none;
    border-top: 1px solid rgba(55, 53, 47, 0.09);
    margin: 2em 0;
  }

  // 다크모드일 때
  .dark-mode .notion-hr {
    border-top-color: rgba(255, 255, 255, 0.13);
  }

  .notion-table-of-contents {
    position: fixed;
    right: -75%;
    top: 80px;
    display: flex;
    flex-direction: column;
    padding: 0;
    margin-bottom: 10px;

    a {
      padding: 0;
      margin-bottom: 10px;
    }

    a:hover {
      background: none;
    }

    span {
      padding: 2px 2px;
      line-height: 1.3;
      background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0) 50%,
        var(--bg-color-0) 50%
      );
      background-size: 200%;
      transition: background-position 0.35s;
    }

    span:hover {
      background-position: -100% 0;
    }
  }

  @media screen and (max-width: 1800px) {
    .notion-table-of-contents {
      right: -80%;
    }
  }

  @media screen and (max-width: 1500px) {
    .notion-table-of-contents {
      position: static;
    }
  }
`
